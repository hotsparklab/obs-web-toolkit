import { DisplayMessageCategory } from "./DisplayMessageCategory";

export interface DisplayMessageGroupConfig {
    messageCategories: DisplayMessageCategory[],
    maxDisplayedMessages: number;
}