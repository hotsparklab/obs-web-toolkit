import { DisplayMessageCategory } from "../../DisplayMessageStore/model/DisplayMessageCategory";

export interface RetroMessageConsoleProps {
    width: number;
    top: number;
    left: number;
    fontSize: number;
    typeDelay: number;
    typeCursor: string;
    messageCategories: DisplayMessageCategory[]; 
    maxDisplayedMessages: number;
}