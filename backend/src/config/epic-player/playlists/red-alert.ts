import { Playlist } from '../../../modules/epic-player/model/Playlist';

const RedAlertPlaylist: Playlist = {
    id: 'red-alert',
    fadeInTime: 500,
    startSoundUri: 'effects/red-alert.mp3',
    shuffle: true,
    songs: [
        {
            audioUri: 'red-alert/ElectricChase by IanPost Artlist.mp3'
        },
        {
            audioUri: 'red-alert/FuturisticWar by IanPost Artlist.mp3'
        },
        {
            audioUri: 'red-alert/Hypnotize by IamDayLight Artlist.mp3'
        },
        {
            audioUri: 'red-alert/IntotheBattle by IanPost Artlist.mp3'
        },
        {
            audioUri: 'red-alert/Olas by TomasNovoa Artlist.mp3'
        },
        {
            audioUri: 'red-alert/TheGreatEscape by IanPost Artlist.mp3'
        },
        {
            audioUri: 'red-alert/Volcn by TomasNovoa Artlist.mp3'
        }
    ]
}

export { RedAlertPlaylist };