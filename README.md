# OBS Web Toolkit

This project enhances live video stream engagement in Open Broadcasting Software (OBS) through a connected web server. It's designed to delight stream audiences with included OBS browser overlays, while also opening up experimental opportunities to plug in custom hardware and software.

The included server accepts REST requests from programs such as VoiceAttack, triggering eye and ear candy in included OBS browser overlays. It will eventually also subscribe to Twitch channel events and broadcast those for overlay and other custom use via socket.io.

## Features

### "Epic Player" (current focus)

Play music playlists of local audio files in an OBS overlay, triggered by VoiceAttack (or other app) to set the mood of a live stream.

Examples (all configured to taste):

- Say "red alert" to quickly transition audio to battle music with an initial optional alert sound.
- Say "engage jump drive" to slowly fade to serine exploration music.

Make Twitch, YouTube, Facebook, Mixer and other live stream background music Digital Media Copyright Act (DMCA) Compliant by downloading and using licensed royalty free music from services such as [Artlist](https://artlist.io/Christopher-1010035) (affiliate link). This will help prevent live streams from being banned as major music companies are now able to detect live and past streams for licensed music.

#### REST API

**Set audio playlist by id**

PUT: `/epic-player/playlist`
request body example: `{ "playlist": "red-alert"}`

Playlists and their IDs as referenced above are set in:

- backend/src/config/config.ts
- backend/src/config/epic-player/playlists/

Audio files mentioned in playlists are placed in:

- backend/src/config/epic-player/audio/

**Play/pause audio**

PUT: `/epic-player/play`
request body example: `{ "play": true}`

true to play, false to pause

**Set audio volume**

PUT: `/epic-player/volume`
request body example: `{ "volume": 0.3}`

0.0 is silent, 1.0 is full volume

### More Features On the Way

This project is just getting started.

## How To Install and Configure

TODO: Everything here is under development at this time. Follow progress and participate in development live on [Twitch](https://www.twitch.tv/hotsparklab).

## Join Us On Twitch!

Join us on the maker/developer/gamer HotSparkLab live stream where we spend time developing software for the stream, explore hardware usage and test it all out in sci-fi games such as [Star Citizen](https://robertsspaceindustries.com/enlist?referral=STAR-5VGF-HTMG) (affiliate link).
