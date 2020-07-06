import { Playlist } from './Playlist';

export interface EpicPlayerConfig
{
    // dictionary of playlists with ids representing each playlist to be used in REST requests
    playlists: { [key: string]: Playlist },
    // starting playlist
    startingPlaylist: Playlist,
    // Enable epic player in general
    enabled?: boolean,
    // begin playing the starting playlist immediately if true, paused if false
    playOnStart?: boolean,
    // 0 = silent, 1 = full volume
    defaultVolume?: number
}