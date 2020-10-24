import { RetroMessageConsoleConfig } from './RetroMessageConsoleConfig';

export interface ClientConfig
{
    epicPlayer: boolean,
    retroMessageConsole?: RetroMessageConsoleConfig,
    twitchChatClient: boolean
}