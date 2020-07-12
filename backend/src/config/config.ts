import { ToolkitServerConfig } from './model/toolkit-server-config';
import { GreenPlaylist } from './epic-player/playlists/green';
import { QuantumTravelPlaylist } from './epic-player/playlists/quantum-travel';
import { RedAlertPlaylist } from './epic-player/playlists/red-alert';
import { YellowAlertPlaylist } from './epic-player/playlists/yellow-alert';

const config: ToolkitServerConfig = {
    port: 4001,
    clientConfig: {
        epicPlayerEnabled: true
    },
    moduleConfig: {
        epicPlayer: {
            // list of playlists
            // Note: key is id used in rest requests
            playlists: [
                GreenPlaylist,
                YellowAlertPlaylist,
                RedAlertPlaylist,
                QuantumTravelPlaylist
            ],
            // starting playlist
            startingPlaylist: GreenPlaylist,
            // begin playing the starting playlist immediately if true, paused if false
            playOnStart: true,
            // 0 = silent, 1 = full volume
            defaultVolume: 0.3
        }
    }
}

export { config };