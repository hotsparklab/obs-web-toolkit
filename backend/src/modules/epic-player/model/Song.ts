/**
 * Single song in a playlist
 */
export interface Song {
    // URI to audio file relative to audio folder
    // Example: 'music.mp3' or 'the-playlist/music.mp3' for easier organization
    audioUri: String;

    // song title
    title?: String;

    // song artist
    by?: String;
    
    // URL to song/album artwork file
    artworkUrl?: String;

    // Link to artist/song if available and sharing in chat.
    artistUrl?: String;
}