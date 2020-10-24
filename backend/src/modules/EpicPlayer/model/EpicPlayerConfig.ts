import { Playlist } from '../../../modules/EpicPlayer/model/Playlist';

export interface EpicPlayerConfig
{
    // where audio files live
    audioDir: string,
    // dictionary of playlists with ids representing each playlist to be used in REST requests
    playlists: Playlist[],
    // starting playlist
    startingPlaylist: Playlist,
    // Enable epic player in general
    playOnStart?: boolean,
    // 0 = silent, 1 = full volume
    defaultVolume?: number
}