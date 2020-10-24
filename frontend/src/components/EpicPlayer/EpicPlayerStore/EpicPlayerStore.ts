import io from "socket.io-client";
import { config } from '../../../config';
import { PlaylistEvent } from './model/PlaylistEvent';
import { VolumeEvent } from './model/VolumeEvent';
import { PlayEvent } from './model/PlayEvent';
import { Song } from './model/Song';
import { Playlist } from './model/Playlist';
import { Howl } from 'howler';
import { makeObservable, observable } from 'mobx';
import DisplayMessageStore from '../../DisplayMessageStore';
import { DataSource } from '../../DisplayMessageStore/model/DataSource';
import { DisplayMessageCategory } from '../../DisplayMessageStore/model/DisplayMessageCategory';

class EpicPlayerStore { 
  
  private static instance: EpicPlayerStore;

  protected socket: SocketIOClient.Socket;
  protected musicPlayers:Howl[];
  protected effectPlayer: Howl;
  unplayedSongs: Song[];

  protected displayMessageStore: DisplayMessageStore;

  public volume = 0.25;
  public playing = false;
  public playlist: Playlist = {
    id: 'default',
    name: 'Default',
    songs: [{ audioUri: '' }] as Song[]
  };
  public errors: string[] = [];

  constructor() {
    if (EpicPlayerStore.instance) {
      throw new Error("Error - use EpicPlayerStore.getInstance()");
    }

    // Enable writing messages/logs to be displayed.
    this.displayMessageStore = DisplayMessageStore.getInstance();

    // Allow other components to react to state changes.
    makeObservable(this, {
      playlist: observable,
      volume: observable,
      playing: observable,
      errors: observable
    });

    this.musicPlayers = [];
    this.unplayedSongs = [];
    this.effectPlayer = this.createHowlerSound(''); // TMP

    // Connect to socket server and events
    this.socket = io.connect(`${config.SOCKET_URL}/epic-player`);
    this.subscribeToSocketEvents();

    // Set singleton instance
    EpicPlayerStore.instance = this;
  }

  /**
   * Get singleton instance (one and only one Epic Player running at once)
   */
  public static getInstance = (): EpicPlayerStore => {
    EpicPlayerStore.instance = EpicPlayerStore.instance || new EpicPlayerStore();
    return EpicPlayerStore.instance;
  }

  /**
   * Subscribe to playlist request events.
   */
  protected subscribeToSocketEvents = (): void => {
    this.socket.on('playlist', (event: PlaylistEvent) => {
      if (event.playlist.id !== 'default') {
        this.onNewPlaylist(event.playlist);
      }
    });

    // Subscribe to play request events.
    this.socket.on('play', (event: PlayEvent) => {
      this.playing = event.play;
      if (this.playing === true) {
        this.musicPlayers[this.musicPlayers.length - 1].play();
        this.displayMessageStore.addMessage({
          source: DataSource.LOCAL,
          message: `Play: ${this.playlist.name}`,
          category: DisplayMessageCategory.PLAY
        });
      } else {
        this.musicPlayers[this.musicPlayers.length - 1].pause();
        this.displayMessageStore.addMessage({
          source: DataSource.LOCAL,
          message: `Pause: ${this.playlist.name}`,
          category: DisplayMessageCategory.PAUSE
        });
      }
    });

    // Subscribe to volume request events.
    this.socket.on('volume', (event: VolumeEvent) => {
      this.volume = event.volume;
      this.musicPlayers[this.musicPlayers.length - 1].volume(this.volume);
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `Volume: ${(this.volume * 100)}%`,
        category: DisplayMessageCategory.VOLUME
      });
    });

    // Handle socket errors.
    this.socket.on('connect_failed', () => {
      this.errors.push('EpicPlayer: socket connection failed');
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `EpicPlayer: socket connection failed`,
        category: DisplayMessageCategory.ERROR
      });
    });
    this.socket.on('reconnect_failed', () => {
      this.errors.push('EpicPlayer: socket failed to reconnect');
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `EpicPlayer: socket failed to reconnect`,
        category: DisplayMessageCategory.ERROR
      });
    });
    this.socket.on('error', (err: Error) => {
      this.errors.push(`EpicPlayer: an error occurred: ${err.message}`);
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `EpicPlayer: an error occurred: ${err.message}`,
        category: DisplayMessageCategory.ERROR
      });
    });

    // Emit 'ready' event to receive first batch of socket events.
    this.socket.emit('ready');
  }

  /**
   * Create a new howler sound player with optional event callbacks
   */
  protected createHowlerSound = (audioSrc: string, onLoaded?: any, onFinished?: any): Howl => {
    const sound = new Howl({
      src: [audioSrc],
      autoplay: false,
      loop: false,
      volume: 0,
      format: ['mp3']
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
  protected onMusicLoaded = (): void => {
    if (this.musicPlayers.length === 1 || !this.playlist.hasOwnProperty('fadeInTime')) {
      // TODO: This is only if not a new playlist when a fade isn't needed
      this.musicPlayers[this.musicPlayers.length - 1].volume(this.volume);
      this.musicPlayers[this.musicPlayers.length - 1].play();
    } else {
      // If there's more than one song in array, it's likely due to new playlist instruction.
      // Fade out and remove old song on fade out. Note that fade events apply to fade in and out,
      // somewhat troublesome at this late hour Start with a timeout.
      this.musicPlayers[this.musicPlayers.length - 1].volume(0.0);
      this.musicPlayers[this.musicPlayers.length - 1].play();
      this.musicPlayers[this.musicPlayers.length - 1].fade(0.0, this.volume, this.playlist.fadeInTime as number); // Note: We're checking for property typed as number first.
      this.musicPlayers[0].fade(this.volume, 0.0, this.playlist.fadeInTime as number);
      setTimeout(() => {
        // Unload and remove first song from array
        this.musicPlayers[0].unload();
        this.musicPlayers.shift();
      }, this.playlist.fadeInTime as number + 100)
    }
  };

  /**
   * Once music is finished playing, unload the current/first player in the array, the request a new song to load.
   */
  protected onMusicFinished = (): void => {
    // Unload and remove first song from array
    this.musicPlayers[0].unload();
    this.musicPlayers.shift();

    // Load a new song to play.
    this.loadNewSong(this.unplayedSongs);
  }

  /**
   * Load a new song to play.
   */
  protected loadNewSong = (songs: Song[]): void => {
    // If there are no songs left to play, reset with current playlist songs if playlist loop is set to true.
    let unplayedSongs: Song[];
    if (songs.length <= 0 && this.playlist.loop === true) {
      unplayedSongs = this.playlist.songs;
    } else {
      unplayedSongs = songs;
    }

    // Songs will eventually stop here if playlist.loop is set to false
    if (unplayedSongs.length >= 1) {
      // Get a random song if shuffle is on, otherwise the next song
      const newSong = this.playlist.shuffle ? unplayedSongs.splice(Math.floor(Math.random() * unplayedSongs.length) , 1)[0] : songs.shift();
      this.unplayedSongs = unplayedSongs;
      if (newSong) {
        // Make a new music player and load audio.
        const newAudioSrc = `${config.SOCKET_URL}/audio/${newSong.audioUri}`;
        console.log(`Going to play: ${newAudioSrc}`);
        this.musicPlayers.push(this.createHowlerSound(newAudioSrc, this.onMusicLoaded, this.onMusicFinished));
      }
    }
  }

  /**
   * Start loading a new audio source to the unused track.
   */
  protected initNewMusic = (songs: Song[]): void => {
    // Reset unplayed songs with new playlist.
    this.unplayedSongs = songs;

    // Get an audio file to play
    this.loadNewSong(songs);
  }

  /**
   * Play the effect when it loads.
   */
  protected onEffectLoaded = (): void => {
    this.effectPlayer.volume(1.0);
    this.effectPlayer.play();
  }

  /**
   * Unload the effect after it plays.
   */
  protected onEffectFinished = (): void => {
    this.effectPlayer.unload();
  }

  /**
   * When a new playlist is received, start new music from that list. 
   */
  protected onNewPlaylist = (newPlaylist: Playlist): void => {
    // Store playlist for later use.
    this.playlist = newPlaylist;

    // Init new audio to play (currently will need to preload before play)
    // Let audio buffer at this point, continuing in onAudioLoad().
    this.initNewMusic(newPlaylist.songs);

    // Play optional one-time sound
    if (this.playlist.startSoundUri) {
      const newAudioSrc = `${config.SOCKET_URL}/audio/${this.playlist.startSoundUri}`;
      console.log('effect', newAudioSrc);
      this.effectPlayer = this.createHowlerSound(newAudioSrc, this.onEffectLoaded, this.onEffectFinished);
    }

    this.displayMessageStore.addMessage({
      source: DataSource.LOCAL,
      message: `Initialize: ${newPlaylist.name}`,
      category: DisplayMessageCategory.PLAYLIST
    });
  }

  /**
   * Cleanup socket.io connection on close to prevent memory leaks
   * NOOP: If enabled, this currently stays enabled while the app runs.
   */
  public cleanup = (): void => {
    this.socket.removeAllListeners();
    this.socket.close();

    for (const player of this.musicPlayers) {
      player.unload(); // will remove event listeners with that
    }
  }
}

export default EpicPlayerStore;
