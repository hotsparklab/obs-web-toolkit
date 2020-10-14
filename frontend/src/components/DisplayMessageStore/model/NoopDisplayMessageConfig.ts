import { DisplayMessageCategory } from './DisplayMessageCategory';

export interface DisplayMessageConfig {
    // Max messages to make available at once for display purposes while keeping others in a queue.
    maxActiveMessages: number;
    
    // Default time for a message at beginning of shown messages to show before removed
    defaultTimeToLive?: number;

    // Default category grouping for a message.
    defaultCategory: DisplayMessageCategory;

    defaultCanOverride: boolean;
}