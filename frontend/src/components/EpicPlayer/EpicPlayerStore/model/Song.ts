/**
 * Single song in a playlist
 * Note: This could expand to include artist info if that opportunity presents itself legally (proper artist licensing outside royalty free is hard!)
 */
export interface Song {
    // URI to audio file relative to audio folder
    // Example: 'music.mp3' or 'the-playlist/music.mp3' for easier organization
    audioUri: String;
}