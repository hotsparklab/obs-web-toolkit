import { Song } from './Song';

/**
 * A song playlist with fade-in time for transitioning into playlist from another.
 */
export interface Playlist {
    // Songs contained within the playlist
    songs: Song[];
    
    // Number of milliseconds to fade in a new playlist.
    // Example: For a red alert playlist, it could be 0/instant so that emergency music can play right away.
    // Example: For a slow transition to quantum drive, 3000 could be a good fade in for exploration music from the previous playlist.
    // suggested client default: 1000 (one second)
    fadeInTime?: Number;

    // The sound that plays at playlist start, overlapping fades and music.
    // suggested client default: no added start sound
    startSoundUri?: string;

    // Whether or not to loop the playlist when it is complete
    // suggested client default: true
    loop?: boolean;

    // Whether or not to shuffle the playlist when playing. Otherwise it will play in sequential order.
    // suggested client default: true
    shuffle?: boolean;
}