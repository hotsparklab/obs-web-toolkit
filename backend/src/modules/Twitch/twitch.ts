import { BaseModule } from '../BaseModule/BaseModule';
import * as express from 'express';
import { TwitchConfig } from './model/TwitchConfig';
import { get } from 'lodash';
import axios from 'axios';
import { TwitchAuthResponse } from './model/TwithAuthResponse';
import { ChatClient } from 'twitch-chat-client';
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { TwitchEvent } from './model/TwitchEvent';
import { promises as fs } from 'fs';
import TwitchEventShare from './TwitchEventShare';

/**
 * Subscribe to Twitch events and broadcast as socket.io events for connected apps/hardware.
 */
export class Twitch extends BaseModule {
    // Base route for this module
    // This will also be used as the socket.io namespace name.
    protected baseRoute = '/twitch';
    protected config: TwitchConfig;
    protected auth: RefreshableAuthProvider;
    protected client: ChatClient;
    protected eventShare: TwitchEventShare;

    // Is the class connected to Twitch?
    protected connectedToTwitch = false;

    // Generated with OAuth code received from client and clientSecret to make authorized requests from Twitch
    protected accessToken: string;

    // A set date 
    protected accessTokenExpires: Date;

    // Received with accessToken, used to get a new access token when it expires.
    protected refreshToken: string;

    constructor(config: TwitchConfig, app: express.Application, router: express.Router, io: SocketIO.Server) {
        super(app, router, io);

        this.config = {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            redirectUri: config.redirectUri,
            channel: config.channel,
            scopes: config.scopes,
        };

        // Set initial state
        // TODO

        // Set REST routes for apps making requests such as VoiceAttack.
        this.setRoutes();

        // Init namespace
        this.setIoConnections();

        // Attempt to connect with cached refresh token data (if available).
        this.attemptAuthWithLocalData();

        // Share events via socket.io for client(s) and as an event emitter for other server-side functionality.
        this.eventShare = TwitchEventShare.getInstance();
    }

    /**
     * Emit current state to new socket connections.
     */
    protected setIoConnections(): void {
        this.io.of(this.baseRoute).on('connect', socket => {
            console.log('/twitch connected');

            socket.on('ready', () => {
                console.log('/twitch ready received');
                socket.emit(TwitchEvent.CONNECTED, { 'connected': this.connectedToTwitch });
            });
        });
    }

    /**
     * Set the Express routes for this module.
     */
    protected setRoutes(): void {
        // Hello!
        this.router.get(`${this.baseRoute}`, (req, res) => {
            res.send({ response: "Twitch is enabled." }).status(200);
        });

        // OAuth2 with Twitch
        this.router.get(`${this.baseRoute}/auth`, async (req, res) => {
            const code = this.authCodeFromTwitch(req);
            if (!code) {
                // Step 1: Show link to user to authenticate via Twitch
                res.send(this.makeLoginPage(req)).status(200);
            } else {
                // Step 2: Twitch sends a code back here, with the server sending
                // a post request with that code to complete authentication.
                try {
                    // Get things started.
                    const authData = await this.getAuthDataFromTwitch(code, req, res);
                    await this.initRefreshableAuthProvider(this.config.clientId, this.config.clientSecret, authData.access_token, authData.refresh_token, authData.expires_in);
                    await this.initChatClient(this.auth, this.config.channel);
                    res.send('Successfully authenticated with Twitch! Good job.').status(200);
                } catch (err) {
                    res.send(`Twitch auth error: ${err.message}`).status(400);
                }
            }
        });

    }

    /**
     * Check if request to this server (from Twitch via request URI) has an auth code.
     */
    protected authCodeFromTwitch = (req: any): string => {
        return get(req, 'query.code', null);
    }

    /**
     * Get Oauth2 token from Twitch
     * User is redirected here after getting auth code from Twitch.
     * If resulting client oauth code is present, authenticate server 
     * with Twitch and get things started
     */
    protected getAuthDataFromTwitch = async (code: string, req: any, res: any): Promise<TwitchAuthResponse> => {
        try {
            const { data } = await axios.request<TwitchAuthResponse>({
                method: 'post',
                url: 'https://id.twitch.tv/oauth2/token',
                params: {
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.config.redirectUri
                }
            });
            return data;
        } catch (err) {
            throw new Error(err.response.message);
        }
    }

    /**
     * Set the expiration date of access token based on number of seconds remaining Twitch API sends back.
     * @param expiresIn - number of seconds until accessToken expires
     */
    protected setAccessTokenExpires(expiresIn: number): void {
        let expires = new Date();
        expires.setSeconds(expires.getSeconds() + expiresIn);
        this.accessTokenExpires = expires;
    }

    /**
     * Make a crude login page that will send users to Twitch to authenticate with requested scopes.
     */
    protected makeLoginPage(req: any): string {
        // TODO: This is very wrong when on the Pi, showing wrong port and even wrong IP. Might need to hard-code this.
        const redirectUri = this.config.redirectUri;
        const scopes = this.config.scopes.join('+');

        return `
            <html>
                <head><title>Login To Twitch</title></head>
                <body>
                    <h1>Login to Twitch</h1>
                    <p>To Authorize the Chat Bot app to interact with the channel, login to Twitch.</p>
                    <a href="https://id.twitch.tv/oauth2/authorize?client_id=${this.config.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}">Authorize Bot with Twitch</a>
                </body>
            </html>
        `;
        
    }

    protected encodeScopesForUrl(): string {
        return this.config.scopes.join('+');
    }

    /**
     * Setup refreshable auth provider to keep things authenticated with Twitch
     */
    protected initRefreshableAuthProvider = async (clientId: string, clientSecret: string, accessToken: string, refreshToken: string, expiryTimestamp: string): Promise<void> => {
        this.auth = new RefreshableAuthProvider(
            new StaticAuthProvider(clientId, accessToken),
            {
                clientSecret,
                refreshToken: refreshToken,
                expiry: expiryTimestamp === null ? null : new Date(expiryTimestamp),
                onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                    const newTokenData = {
                        accessToken,
                        refreshToken,
                        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                    };
                    await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8');
                }
            }
        );
    }

    /**
     * Attempt to connect with local refresh token data if available, good for restarts
     * and such.
     */
    // 
    protected attemptAuthWithLocalData = async () => {
        try {
            const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf8'));
            if (tokenData) {
                this.initRefreshableAuthProvider(this.config.clientId, this.config.clientSecret, tokenData.accessToken, tokenData.refreshToken, tokenData.expiryTimestamp);
                await this.initRefreshableAuthProvider(this.config.clientId, this.config.clientSecret, tokenData.accessToken, tokenData.refreshToken, tokenData.expiryTimestamp);
                await this.initChatClient(this.auth, this.config.channel);
            } else {
                console.log('Unable to authenticate with locally saved data as there was no data. Login via /twitch/auth.');
            }
        } catch (err) {
            console.warn('Unable to authenticate with locally saved data (if there was any). Login via /twitch/auth.');
        }
    }

    /**
     * Initialize chat client that listens to Twitch and sends commands.
     */
    protected async initChatClient (auth: RefreshableAuthProvider, channel: string): Promise<void> {
        this.client = new ChatClient(auth, { 
            channels: [channel],
            requestMembershipEvents: true
         });
        await this.client.connect();
        this.connectedToTwitch = true;
        this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.CONNECTED, { 'connected': true });
        this.listenToChatEvents();
    }

    /**
     * Listen to chat client events.
     */
    protected listenToChatEvents = () => {
        // Fires when a user sends an action (/me) to a channel.
        this.client.onAction ((channel, user, message, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.ACTION, { channel, user, message, msg });
        });

        // Fires when authentication fails.
        this.client.onAuthenticationFailure ((message) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.AUTHENTICATION_FAILURE, { message });
        });

        // Fires when a user is permanently banned from a channel.
        this.client.onBan ((channel, user) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.BAN, { channel, user });
        });

        // Fires when a user upgrades their bits badge in a channel.
        this.client.onBitsBadgeUpgrade ((channel, user, upgradeInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.BITS_BADGE_UPGRADE, { channel, user, upgradeInfo, msg });
        });

        // Fires when the chat of a channel is cleared.
        this.client.onChatClear ((channel) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.CHAT_CLEAR, { channel });
        });

        // Fires when a user pays forward a subscription that was gifted to them to the community.
        this.client.onCommunityPayForward ((channel, user, forwardInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.COMMUNITY_PAY_FORWARD, { channel, user, forwardInfo, msg });
        });

        // Fires when a user gifts random subscriptions to the community of a channel.
        this.client.onCommunitySub ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.COMMUNITY_SUB, { channel, user, subInfo, msg });
        });

        // Fires when emote-only mode is toggled in a channel.
        this.client.onEmoteOnly ((channel, enabled) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.EMOTE_ONLY, { channel, enabled });
        });

        // Fires when followers-only mode is toggled in a channel.
        this.client.onFollowersOnly ((channel, enabled, delay) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.FOLLOWERS_ONLY, { channel, enabled, delay });
        });

        // Fires when a user upgrades their gift subscription to a paid subscription in a channel.
        this.client.onGiftPaidUpgrade ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.GIFT_PAID_UPGRADE, { channel, user, subInfo, msg });
        });

        // Fires when a channel hosts another channel.
        this.client.onHost ((channel, target, viewers) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.HOST, { channel, target, viewers });
        });

        // Fires when a channel you're logged in as its owner is being hosted by another channel.
        this.client.onHosted ((channel, byChannel, auto, viewers) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.HOSTED, { channel, byChannel, auto, viewers });
        });

        // Fires when Twitch tells you the number of hosts you have remaining in the next half hour for the channel for which you're logged in as owner after hosting a channel.
        this.client.onHostsRemaining ((channel, numberOfHosts) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.HOSTS_REMAINING, { channel, numberOfHosts });
        });

        // Fires when a user joins a channel.
        // The join/part events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
        // Please note that unless you enabled the requestMembershipEvents option, this will only react to your own joins.
        this.client.onJoin ((channel, user) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.JOIN, { channel, user });
        });

        // Message posted in channel
        this.client.onMessage((channel, user, message) => {
            console.log(channel, user, message);
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.MESSAGE, { channel, user, message });
            if (message === '!ping') {
                this.client.say(channel, 'Pong!');
            }
        });

        // Fires when sending a message fails.
        this.client.onMessageFailed ((channel, reason) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.MESSAGE_FAILED, { channel, reason });
        });

        // Fires when a message you tried to send gets rejected by the ratelimiter.
        this.client.onMessageRatelimit ((channel, message) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.MESSAGE_RATE_LIMIT, { channel, message });
        });

        // Fires when a single message is removed from a channel.
        this.client.onMessageRemove ((channel, messageId, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.MESSAGE_REMOVE, { channel, messageId, msg });
        });

        // Fires when you tried to execute a command you don't have sufficient permission for.
        this.client.onNoPermission ((channel, message) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.NO_PERMISSION, { channel, message });
        });

        // Fires when a user leaves ("parts") a channel.
        // The join/part events are cached by the Twitch chat server and will be batched and sent every 30-60 seconds.
        // Please note that unless you enabled the requestMembershipEvents option, this will only react to your own parts.
        this.client.onPart ((channel, user) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.PART, { channel, user });
        });

        // Fires when a user gifts a Twitch Prime benefit to the channel.
        this.client.onPrimeCommunityGift ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.PRIME_COMMUNITY_GIFT, { channel, user, subInfo, msg });
        });

        // Fires when a user upgrades their Prime subscription to a paid subscription in a channel.
        this.client.onPrimePaidUpgrade ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.PRIME_PAID_UPGRADE, { channel, user, subInfo, msg });
        });

        // Fires when R9K mode is toggled in a channel.
        this.client.onR9k ((channel, enabled) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.R9K, { channel, enabled });
        });

        // Fires when a user raids a channel.
        this.client.onRaid ((channel, user, raidInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.RAID, { channel, user, raidInfo, msg });
        });

        // Fires when a user cancels a raid.
        this.client.onRaidCancel ((channel, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.RAID_CANCEL, { channel, msg });
        });

        // Fires when a user resubscribes to a channel.
        this.client.onResub ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.RESUB, { channel, user, subInfo, msg });
        });

        // Fires when a user gifts rewards during a special event.
        this.client.onRewardGift ((channel, user, rewardGiftInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.REWARD_GIFT, { channel, user, rewardGiftInfo, msg });
        });

        // Fires when a user performs a "ritual" in a channel.
        this.client.onRitual ((channel, user, ritualInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.RITUAL, { channel, user, ritualInfo, msg });
        });

        // Fires when slow mode is toggled in a channel.
        this.client.onSlow ((channel, enabled, delay) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.SLOW, { channel, enabled, delay });
        });

        // Fires when a user pays forward a subscription that was gifted to them to a specific user.
        this.client.onStandardPayForward ((channel, user, forwardInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.STANDARD_PAY_FORWARD, { channel, user, forwardInfo, msg });
        });

        // Fires when a user subscribes to a channel.
        this.client.onSub ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.SUB, { channel, user, subInfo, msg });
        });

        // Fires when a user extends their subscription using a Sub Token.
        this.client.onSubExtend ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.SUB_EXTEND, { channel, user, subInfo, msg });
        });

        // Fires when a user gifts a subscription to a channel to another user.
        this.client.onSubGift ((channel, user, subInfo, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.SUB_GIFT, { channel, user, subInfo, msg });
        });

        // Fires when sub only mode is toggled in a channel.
        this.client.onSubsOnly ((channel, enabled) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.SUB_ONLY, { channel, enabled });
        });

        // Fires when a user is timed out from a channel.
        this.client.onTimeout ((channel, user, duration) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.TIMEOUT, { channel, user, duration });
        });

        // Fires when host mode is disabled in a channel.
        this.client.onUnhost ((channel) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.UNHOST, { channel });
        });

        // Fires when receiving a whisper from another user.
        this.client.onWhisper ((user, message, msg) => {
            this.eventShare.shareTwitchEvent(this.io.of(this.baseRoute), TwitchEvent.WHISPER, { user, message, msg });
        });
    }
}