import React, { useEffect } from 'react';
import io from "socket.io-client";
import { config } from '../../config';
import { PlaylistEvent } from './model/PlaylistEvent';
import { VolumeEvent } from './model/VolumeEvent';
import { PlayEvent } from './model/PlayEvent';
import { Song } from './model/Song';
import { Playlist } from './model/Playlist';
import { Howl } from 'howler';

// TODO: Concerned about scope on this, currently addressed in cleanup()
const SOCKET = io.connect(`${config.SOCKET_URL}/epic-player`);

function EpicPlayer() {  
  
  // If only calling useEffect once, will I need to deal with useState in non-visual api?
  // TODO: This feels wrong. Let's discuss (socket server + non-visual component + useEffect = #*&^*#&^#!)
  useEffect(() => {
    // Push new players. Unload and shift old players.
    let musicPlayers:Howl[] = [];
    let effectPlayer: Howl;
    let playlist: Playlist = {
      id: 'default',
      songs: [{ audioUri: '' }] as Song[]
    };
    let volume = 0.25;
    let unplayedSongs: Song[] = [];

    /**
     * Create a new howler sound player with optional event callbacks
     */
    const createHowlerSound = (audioSrc: string, onLoaded?: any, onFinished?: any): Howl => {
      const sound = new Howl({
        src: [audioSrc],
        autoplay: false,
        loop: false,
        volume: 0,
      });

      // Once loaded
      sound.once('load', () => {
        if (onLoaded) {
          onLoaded();
        }
      });

      // When finished playing
      sound.on('end', () => {
        if (onFinished) {
          onFinished();
        }
      });
      
      return sound;
    }

    /**
     * Once music is loaded, either play immediately as previous song finishes, or fade in if new playlist is in place.
     */
    const onMusicLoaded = (): void => {
      // TODO: More brain power needed here. At the least, a QA person will laugh as he/she breaks the hell out of this...
      // For personal use, this will work for now, suggestions/PRs welcome.
      // Example: If there's a list of fast playing sounds with slower fade, BOOM.
      if (musicPlayers.length === 1 || !playlist.hasOwnProperty('fadeInTime')) {
        // TODO: This is only if not a new playlist when a fade isn't needed
        musicPlayers[musicPlayers.length - 1].volume(volume);
        musicPlayers[musicPlayers.length - 1].play();
      } else {
        // If there's more than one song in array, it's likely due to new playlist instruction.
        // Fade out and remove old song on fade out. Note that fade events apply to fade in and out,
        // somewhat troublesome at this late hour Start with a timeout.
        musicPlayers[musicPlayers.length - 1].volume(0.0);
        musicPlayers[musicPlayers.length - 1].play();
        musicPlayers[musicPlayers.length - 1].fade(0.0, volume, playlist.fadeInTime as number); // Note: We're checking for property typed as number first.
        musicPlayers[0].fade(volume, 0.0, playlist.fadeInTime as number);
        setTimeout(() => {
          // Unload and remove first song from array
          musicPlayers[0].unload();
          musicPlayers.shift();
        }, playlist.fadeInTime as number + 100)
      }
    };

    /**
     * Once music is finished playing, unload the current/first player in the array, the request a new song to load.
     */
    const onMusicFinished = (): void => {
      // Unload and remove first song from array
      musicPlayers[0].unload();
      musicPlayers.shift();

      // Load a new song to play.
      loadNewSong(unplayedSongs);
    }

    /**
     * Load a new song to play after load, pretty darn fast if loaded locally.
     * TODO: If running as a remote server (good time to add security before that), may need to preload NEXT song.
     */
    const loadNewSong = (songs: Song[]): void => {
      // If there are no songs left to play, reset with current playlist songs if playlist loop is set to true.
      if (songs.length <= 0 && playlist.loop === true) {
        songs = playlist.songs; // TODO: This is a parameter. May I mutate this directly?
      }

      // Songs will eventually stop here if playlist.loop is set to false
      if (songs.length >= 1) {
        // Get a random song if shuffle is on, otherwise the next song
        const newSong = playlist.shuffle ? songs.splice(Math.floor(Math.random() * songs.length) , 1)[0] : songs.shift();
        unplayedSongs = songs;
        if (newSong) {
          // Make a new music player and load audio.
          const newAudioSrc = `${config.SOCKET_URL}/audio/${newSong.audioUri}`;
          console.log(`Going to play: ${newAudioSrc}`);
          musicPlayers.push(createHowlerSound(newAudioSrc, onMusicLoaded, onMusicFinished));
        }
      }
    }

    /**
     * Start loading a new audio source to the unused track.
     */
    const initNewMusic = (songs: Song[]): void => {
      // Reset unplayed songs with new playlist.
      unplayedSongs = songs;

      // Get an audio file to play
      loadNewSong(songs);
    }

    /**
     * Play the effect when it loads.
     */
    const onEffectLoaded = (): void => {
      effectPlayer.volume(1.0);
      effectPlayer.play();
    }

    /**
     * Unload the effect after it plays.
     */
    const onEffectFinished = (): void => {
      effectPlayer.unload();
    }

    /**
     * When a new playlist is received, start new music from that list. 
     */
    const onNewPlaylist = (newPlaylist: Playlist): void => {
      // Store playlist for later use.
      playlist = newPlaylist;

      // Init new audio to play (currently will need to preload before play)
      // Let audio buffer at this point, continuing in onAudioLoad().
      initNewMusic(newPlaylist.songs);

      // TODO: play optional one-time sound
      if (playlist.startSoundUri) {
        const newAudioSrc = `${config.SOCKET_URL}/audio/${playlist.startSoundUri}`;
        console.log('effect', newAudioSrc);
        effectPlayer = createHowlerSound(newAudioSrc, onEffectLoaded, onEffectFinished);
      }
    }

    /**
     * Cleanup socket.io connection to prevent memory leaks.
     */
    const cleanup = (): void => {
      SOCKET.removeAllListeners();
      SOCKET.close();

      for (const player of musicPlayers) {
        player.unload(); // will remove event listeners with that
      }
    }

    // Subscribe to playlist request events.
    SOCKET.on('playlist', (event: PlaylistEvent) => {
      if (event.playlist.id !== 'default') {
        onNewPlaylist(event.playlist);
      }
    });

    // Subscribe to play request events.
    SOCKET.on('play', (event: PlayEvent) => {
      if (event.play === true) {
        musicPlayers[musicPlayers.length - 1].play();
      } else {
        musicPlayers[musicPlayers.length - 1].pause();
      }
    });

    // Subscribe to volume request events.
    SOCKET.on('volume', (event: VolumeEvent) => {
      musicPlayers[musicPlayers.length - 1].volume(event.volume);
    });

    // Emit 'ready' event to receive first batch of socket events.
    SOCKET.emit('ready');

    return cleanup;
  }, []); // TODO: #$#&^#&^@%#! I don't understand proper use of dependencies/state yet for socket comms/non-visual stuff. To discuss.
  
  // Nothing to show at this time.
  return (
    <React.Fragment></React.Fragment>
  );
}

export default EpicPlayer;
