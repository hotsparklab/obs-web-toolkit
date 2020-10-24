import { DataSource } from './DataSource';
import { DisplayMessageCategory } from './DisplayMessageCategory';

export interface DisplayMessage {
    // A unique id for the message, generated if not provided
    id?: string,
    
    // category grouping of a message
    category?: DisplayMessageCategory,

    // Can this message be removed quickly if another message comes in
    // after max displayed message count? For example, a new subscription notice
    // should not be deleted quickly as a quick 'someone chatted for the first time today'
    // type message.
    canOverride?: boolean,

    // Displayable message
    message: string,

    // Where the message came from
    source: DataSource,

    // Time to live in milliseconds while at the top of the queue
    timeToLive?: number,

    // Personal note provided with some messages, with bits/cheers for example.
    userNote?: string,

    // Username that triggered message, example: new subscriber
    userNickname?: string,

    // User ID that can be used for additional system lookups
    userId?: string,

    // User profile image url
    userAvatar?: string,
}