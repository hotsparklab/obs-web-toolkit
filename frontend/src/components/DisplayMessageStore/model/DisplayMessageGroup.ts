import { DisplayMessage } from "./DisplayMessage";
import { DisplayMessageCategory } from "./DisplayMessageCategory";
import { DisplayMessageGroupConfig } from './DisplayMessageGroupConfig';

export interface DisplayMessageGroup extends DisplayMessageGroupConfig {
    messages: DisplayMessage[],
    timer: number
}