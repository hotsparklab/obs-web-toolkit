import { ToolkitServerConfig } from './model/ToolkitServerConfig';
import { GreenPlaylist } from './EpicPlayer/playlists/GreenPlaylist';
import { QuantumTravelPlaylist } from './EpicPlayer/playlists/QuantumTravelPlaylist';
import { RedAlertPlaylist } from './EpicPlayer/playlists/RedAlertPlaylist';
import { YellowAlertPlaylist } from './EpicPlayer/playlists/YellowAlertPlaylist';
import { config as dotenv } from 'dotenv';
import { DisplayMessageCategory } from './model/DisplayMessageCategory';

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