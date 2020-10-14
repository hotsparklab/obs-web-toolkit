/**
 * Enumerator of message category keys used in broadcasting and grouping messages
 */
export enum DisplayMessageCategory {
    // Console related messages
    ERROR = 'error',
    WARN = 'warn',
    LOG = 'log',
    INFO = 'info',

    // Twitch related messages
    // from webhooks
    FOLLOW = 'follow',
    STREAM_CHANGED = 'streamChanged',
    USER_CHANGED = 'userChanged',
    EXTENSION_TRANSACTION_CREATED = 'extensionTransactionCreated',
    MODERATOR_CHANGE = 'moderatorChange',
    CHANNEL_BAN = 'channelBan',
    SUBSCRIPTION = 'subscription',
    HYPE_TRAIN = 'hypeTrain',

    // from pubsub: not covered by webhooks
    BITS = 'bits',
    BITS_BADGE_UNLOCK = 'bitsCadgeUnlock',
    MOD_ACTION = 'modAction',
    POINT_REDEMPTION = 'pointRedemption',
    WHISPER = 'whisper',

    // EpicPlayer
    PLAYLIST = 'playlist',
    PLAY = 'play',
    PAUSE = 'pause',
    VOLUME = 'volume'
}