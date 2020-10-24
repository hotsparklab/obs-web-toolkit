import { EpicPlayerConfig } from '../../modules/EpicPlayer/model/EpicPlayerConfig';
import { TwitchConfig } from '../../modules/Twitch/model/TwitchConfig';

export interface ModuleConfig
{
    epicPlayer?: EpicPlayerConfig,
    twitch?: TwitchConfig
}