export interface TwitchConfig {
    // Client ID obtained when creating a Twitch app at:
    // https://dev.twitch.tv/console/apps
    clientId: string;

    // Client secret obtained at Twitch app page
    clientSecret: string;

    // Redirect URI configured in Twitch app. It must match exactly in order to work.
    // Local example: http://127.0.0.1:4001/twitch/auth
    // Networked Pi example: http://192.168.0.10/twitch/auth
    redirectUri: string;

    // Channel to be monitored
    channel: string,

    // Permissions the app requires as seen at:
    // https://dev.twitch.tv/docs/authentication/#scopes
    scopes?: string[];
}