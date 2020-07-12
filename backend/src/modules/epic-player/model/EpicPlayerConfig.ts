import { Playlist } from './Playlist';

export interface EpicPlayerConfig
{
    // dictionary of playlists with ids representing each playlist to be used in REST requests
    playlists: Playlist[],
    // starting playlist
    startingPlaylist: Playlist,
    // Enable epic player in general
    playOnStart?: boolean,
    // 0 = silent, 1 = full volume
    defaultVolume?: number
}