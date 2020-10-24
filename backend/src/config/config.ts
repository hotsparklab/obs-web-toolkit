import { ToolkitServerConfig } from './model/ToolkitServerConfig';
import { GreenPlaylist } from './EpicPlayer/playlists/GreenPlaylist';
import { QuantumTravelPlaylist } from './EpicPlayer/playlists/QuantumTravelPlaylist';
import { RedAlertPlaylist } from './EpicPlayer/playlists/RedAlertPlaylist';
import { YellowAlertPlaylist } from './EpicPlayer/playlists/YellowAlertPlaylist';
import { config as dotenv } from 'dotenv';
import { DisplayMessageCategory } from './model/DisplayMessageCategory';

dotenv();

const config: ToolkitServerConfig = {
    port: 4001,
    clientConfig: {
        epicPlayer: true,
        retroMessageConsole: {
            props: {
                width: 500,
                top: 100,
                left: 50,
                fontSize: 24,
                typeDelay: 10,
                typeCursor: '▋',
                messageCategories: [
                    DisplayMessageCategory.ERROR,
                    DisplayMessageCategory.INFO,
                    DisplayMessageCategory.LOG,
                    DisplayMessageCategory.WARN,
                    
                    DisplayMessageCategory.PLAY,
                    DisplayMessageCategory.PLAYLIST,
                    DisplayMessageCategory.PAUSE,
                    DisplayMessageCategory.VOLUME,

                    DisplayMessageCategory.CONNECTED,
                    DisplayMessageCategory.ACTION,
                    DisplayMessageCategory.AUTHENTICATION_FAILURE,
                    // DisplayMessageCategory.BAN,
                    DisplayMessageCategory.BITS_BADGE_UPGRADE,
                    DisplayMessageCategory.CHAT_CLEAR,
                    DisplayMessageCategory.COMMUNITY_PAY_FORWARD,
                    DisplayMessageCategory.COMMUNITY_SUB,
                    DisplayMessageCategory.EMOTE_ONLY,
                    DisplayMessageCategory.FOLLOWERS_ONLY,
                    DisplayMessageCategory.GIFT_PAID_UPGRADE,
                    DisplayMessageCategory.HOST,
                    DisplayMessageCategory.HOSTED,
                    DisplayMessageCategory.HOSTS_REMAINING,
                    // DisplayMessageCategory.JOIN,
                    DisplayMessageCategory.MESSAGE,
                    DisplayMessageCategory.MESSAGE_FAILED,
                    DisplayMessageCategory.MESSAGE_RATE_LIMIT,
                    DisplayMessageCategory.MESSAGE_REMOVE,
                    DisplayMessageCategory.NO_PERMISSION,
                    // DisplayMessageCategory.PART,
                    DisplayMessageCategory.PRIME_COMMUNITY_GIFT,
                    DisplayMessageCategory.PRIME_PAID_UPGRADE,
                    DisplayMessageCategory.R9K,
                    DisplayMessageCategory.RAID,
                    DisplayMessageCategory.RAID_CANCEL,
                    DisplayMessageCategory.RESUB,
                    DisplayMessageCategory.REWARD_GIFT,
                    DisplayMessageCategory.RITUAL,
                    DisplayMessageCategory.SLOW,
                    DisplayMessageCategory.STANDARD_PAY_FORWARD,
                    DisplayMessageCategory.SUB,
                    DisplayMessageCategory.SUB_EXTEND,
                    DisplayMessageCategory.SUB_GIFT,
                    DisplayMessageCategory.SUB_ONLY,
                    DisplayMessageCategory.TIMEOUT,
                    DisplayMessageCategory.UNHOST
                ],
                maxDisplayedMessages: 5
            }
        },
        twitchChatClient: true
    },
    moduleConfig: {
        epicPlayer: {
            audioDir: process.env.hasOwnProperty('USB_VOLUME_NAME') ? `/mnt/${process.env.USB_VOLUME_NAME}/audio/` : `${__dirname}/../../public/audio/`,
            // list of playlists
            playlists: [
                GreenPlaylist,
                YellowAlertPlaylist,
                RedAlertPlaylist,
                QuantumTravelPlaylist
            ],
            // starting playlist
            startingPlaylist: GreenPlaylist,
            // begin playing the starting playlist immediately if true, paused if false
            playOnStart: true,
            // 0 = silent, 1 = full volume
            defaultVolume: 0.3
        },
        twitch: {
            clientId: `${process.env.TWITCH_CLIENT_ID}`,
            clientSecret: `${process.env.TWITCH_CLIENT_SECRET}`,
            redirectUri: process.env.hasOwnProperty('TWITCH_CLIENT_REDIRECT_URI') ? process.env.TWITCH_CLIENT_REDIRECT_URI : 'http://127.0.0.1:4001/twitch/auth',
            channel: `${process.env.TWITCH_CHANNEL}`,
            scopes: [
                'chat:edit',
                'chat:read'
            ]
        }
    }
}

export { config };