export interface TwitchAuthResponse {
    access_token: string,
    refresh_token: string,
    expires_in: string,
    scope: string[],
    token_type: string
}