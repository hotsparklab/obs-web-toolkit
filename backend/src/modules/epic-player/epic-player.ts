import { BaseModule } from '../base-module/base-module';
import * as express from 'express';
import { EpicPlayerConfig } from './model/EpicPlayerConfig';
import { get } from 'lodash';
import { Playlist } from './model/Playlist';
import { EpicPlayerEvent } from './model/EpicPlayerEvent';

/**
 * Epic Player is an epic audio player server.
 * It receives REST commands to set a music playlist, play, pause and set playback volume.
 * It then emits those requests to all listening OBS browser overlay(s) and optionally other apps/devices listening.
 */
export class EpicPlayer extends BaseModule {
    // Base route for this module
    // This will also be used as the socket.io namespace name.
    protected baseRoute = '/epic-player';
    protected config: EpicPlayerConfig;
    protected defaultConfig: EpicPlayerConfig = {
        // This is required config, so no real default here.
        playlists: {
            default: {
                songs: [
                    {
                        audioUri: ''
                    }
                ]
            }
        },
        // This is required config, so no real default here.
        startingPlaylist: {
            songs: [
                {
                    audioUri: ''
                }
            ]
        },
        enabled: true,
        playOnStart: true,
        defaultVolume: 0.3
    };

    // The current playing playlist
    protected playlist: Playlist;

    // Current volume normalized 0 - 1 (0 silent to 1 full volume)
    protected volume: number;

    // Currently set to play?
    protected playing: boolean;

    constructor(config: EpicPlayerConfig, router: express.Router, io: SocketIO.Server) {
        super(router, io);

        this.config = {
            playlists: config.playlists, // required
            startingPlaylist: config.startingPlaylist, // required
            enabled: get(config, 'enabled', this.defaultConfig.enabled),
            playOnStart: get(config, 'playOnStart', this.defaultConfig.playOnStart),
            defaultVolume: get(config, 'defaultVolume', this.defaultConfig.defaultVolume)
        };

        // Set initial state
        this.playlist = this.config.startingPlaylist;
        this.volume = this.config.defaultVolume >= 0 && this.config.defaultVolume <= 1 ? this.config.defaultVolume : 0.3;
        this.playing = this.config.playOnStart;

        // Set REST routes for apps making requests such as VoiceAttack.
        this.setRoutes();

        // Init namespace
        this.setIoConnections();
    }

    /**
     * Emit current state to new socket connections.
     */
    protected setIoConnections(): void {
        this.io.of(this.baseRoute).on('connect', socket => {
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.PLAYLIST, this.playlist);
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.PLAY, { 'play': this.playing });
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.VOLUME, { 'volume': this.volume});
        });
    }

    /**
     * Set the Express routes for this module.
     */
    protected setRoutes(): void {
        // Hello!
        this.router.get(`${this.baseRoute}`, (req, res) => {
            res.send({ response: "Epic Player is enabled, SO EPIC." }).status(200);
        });
        
        // Set playlist
        this.router.put(`${this.baseRoute}/playlist`, (req, res) => {
            this.setPlaylist(req, res);
        });

        // Set play state: true play, false pause
        this.router.put(`${this.baseRoute}/play`, (req, res) => {
            this.setPlay(req, res);
        });

        // Set volume: 0 silent, 1 full volume
        this.router.put(`${this.baseRoute}/volume`, (req, res) => {
            this.setVolume(req, res);
        });
    }

    /**
     * Set the request playlist.
     */
    protected setPlaylist(req: any, res: any): void {
        const playlistId = get(req, 'body.playlist', null);
        const playlist: Playlist = get(this.config, `playlists.${playlistId}`);
        if (playlist) {
            this.playlist = playlist;
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.PLAYLIST, this.playlist);
            res.send({ response: `now playing: ${playlistId}` }).status(200);
        } else {
            res.send({ response: `playlist of '${req.params.playlistName}' was not found.` }).status(404);
        }
    }

    /**
     * Set play state: false for paused, true for playing
     */
    protected setPlay(req: any, res: any): void {
        this.io.of(this.baseRoute).emit(EpicPlayerEvent.PLAY);
        res.send({ response: `play` }).status(200);

        const playing: boolean = get(req, 'body.play', null);
        if (playing !== null) {
            this.playing = playing;
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.PLAY, { 'play': this.playing });
            res.send({ response: `playing: ${playing}` }).status(200);
        } else {
            res.send({ response: `didn't receive a 'play' value of true or false` }).status(400);
        }
    }

    /**
     * Set volume
     */
    protected setVolume(req: any, res: any): void {
        const volume: number = get(req, 'body.volume', null);
        if (volume && volume >= 0.0 && volume <= 1.0) {
            this.volume = volume;
            this.io.of(this.baseRoute).emit(EpicPlayerEvent.VOLUME, { 'volume': this.volume});
            res.send({ response: `volume set to: ${volume}` }).status(200);
        } else {
            res.send({ response: `didn't receive a 'volume' value between 0 and 1: ${volume}` }).status(400);
        }
    }
}