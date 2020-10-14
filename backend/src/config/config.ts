import { ToolkitServerConfig } from './model/toolkit-server-config';
import { GreenPlaylist } from './epic-player/playlists/green';
import { QuantumTravelPlaylist } from './epic-player/playlists/quantum-travel';
import { RedAlertPlaylist } from './epic-player/playlists/red-alert';
import { YellowAlertPlaylist } from './epic-player/playlists/yellow-alert';
import { config as dotenv } from 'dotenv';
import { DisplayMessageCategory } from '../../../frontend/src/components/DisplayMessageStore/model/DisplayMessageCategory';

dotenv();

const config: ToolkitServerConfig = {
    port: 4001,
    clientConfig: {
        epicPlayerEnabled: true,
        retroMessageConsole: {
            enabled: true,
            props: {
                width: 500,
                top: 100,
                left: 50,
                fontSize: 32,
                typeDelay: 15,
                typeCursor: '▋',
                messageCategories: [
                    DisplayMessageCategory.ERROR,
                    DisplayMessageCategory.INFO,
                    DisplayMessageCategory.LOG,
                    DisplayMessageCategory.WARN,
                    
                    DisplayMessageCategory.PLAY,
                    DisplayMessageCategory.PLAYLIST,
                    DisplayMessageCategory.PAUSE,
                    DisplayMessageCategory.VOLUME
                ],
                maxDisplayedMessages: 5
            }
        }
    },
    moduleConfig: {
        epicPlayer: {
            audioDir: process.env.hasOwnProperty('USB_VOLUME_NAME') ? `/mnt/${process.env.USB_VOLUME_NAME}/audio/` : `${__dirname}/../../public/audio/`,
            // list of playlists
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