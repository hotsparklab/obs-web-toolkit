/**
 * Enumerator of message category keys used in broadcasting and grouping messages
 */
export enum DisplayMessageCategory {
    // Console related messages
    ERROR = 'error',
    WARN = 'warn',
    LOG = 'log',
    INFO = 'info',

    // EpicPlayer
    PLAYLIST = 'playlist',
    PLAY = 'play',
    PAUSE = 'pause',
    VOLUME = 'volume',

    // Twitch related messages
    CONNECTED = 'connected',
    ACTION = 'action',
    AUTHENTICATION_FAILURE = 'authenticationFailure',
    BAN = 'ban',
    BITS_BADGE_UPGRADE = 'bitsBadgeUpgrade',
    CHAT_CLEAR = 'chatClear',
    COMMUNITY_PAY_FORWARD = 'communityPayForward',
    COMMUNITY_SUB = 'communitySub',
    EMOTE_ONLY = 'emoteOnly',
    FOLLOWERS_ONLY = 'followersOnly',
    GIFT_PAID_UPGRADE = 'giftPaidUpgrade',
    HOST = 'host',
    HOSTED = 'hosted',
    HOSTS_REMAINING = 'hostsRemaining',
    JOIN = 'join',
    MESSAGE = 'message',
    MESSAGE_FAILED = 'messageFailed',
    MESSAGE_RATE_LIMIT = 'messageRateLimit',
    MESSAGE_REMOVE = 'messageRemove',
    NO_PERMISSION = 'noPermission',
    PART = 'part',
    PRIME_COMMUNITY_GIFT = 'primeCommunityGift',
    PRIME_PAID_UPGRADE = 'primePaidUpdate',
    R9K = 'r9K',
    RAID = 'raid',
    RAID_CANCEL = 'raidCancel',
    RESUB = 'resub',
    REWARD_GIFT = 'rewardGift',
    RITUAL = 'ritual',
    SLOW = 'slow',
    STANDARD_PAY_FORWARD = 'standardPayForward',
    SUB = 'sub',
    SUB_EXTEND = 'subExtend',
    SUB_GIFT = 'subGift',
    SUB_ONLY = 'subOnly',
    TIMEOUT = 'timeout',
    UNHOST = 'unhost',
    WHISPER = 'whisper'
}