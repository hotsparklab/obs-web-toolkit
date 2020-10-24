import { makeObservable, observable, action } from 'mobx';
import { DisplayMessage } from './model/DisplayMessage';
import { DisplayMessageCategory } from './model/DisplayMessageCategory';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { DisplayMessageGroup } from './model/DisplayMessageGroup';
import { DisplayMessageGroupConfig } from './model/DisplayMessageGroupConfig';

/**
 * Absorb messages intended for display
 */
class DisplayMessageStore { 
  
  protected static instance: DisplayMessageStore;

  protected timer: number;
  
  public messages2: { [key: string]: DisplayMessageGroup; }  = {};

  protected defaultTimeToLive = 7000;
  protected defaultCategory = DisplayMessageCategory.INFO;
  protected defaultCanOverride = true;

  constructor() {
    if (DisplayMessageStore.instance) {
      throw new Error("Error - use MessageLogStore.getInstance()");
    }

    // Allow other components to react to state changes.
    makeObservable(this, {
      messages2: observable,
      addMessage: action,
      removeMessage: action,
      addDisplayMessageGroup: action
    });

    // Set dummy timer until first message is received
    // TODO: Better way to do this without TypeScript freaking out?
    this.timer = setTimeout(() => {});

    // Set singleton instance
    DisplayMessageStore.instance = this;
  }

  /**
   * Get singleton instance
   */
  public static getInstance = (): DisplayMessageStore => {
    DisplayMessageStore.instance = DisplayMessageStore.instance || new DisplayMessageStore();
    return DisplayMessageStore.instance;
  }

  /**
   * Add display message group for managing messages to be shown per display if it doesn't exist.
   * For example: The RetroMessageConsole will show five messages at a time of various
   * message types while a [NewSubscriberDisplay?] will show one message at a time
   * of the new subscription type only.
   */
  public addDisplayMessageGroup (groupId: string, groupConfig: DisplayMessageGroupConfig): void {
    const displayMessageGroup = get(this.messages2, groupId)
    if (!displayMessageGroup) {
      const messageGroup: DisplayMessageGroup = {
        ...groupConfig,
        messages: [],
        timer: setTimeout(() => {})
      }

      this.messages2[groupId] = messageGroup;
    } else {
      // update
      displayMessageGroup.messageCategories = groupConfig.messageCategories;
      displayMessageGroup.maxDisplayedMessages = groupConfig.maxDisplayedMessages;
    }
  }

  /**
   * Add a message to be displayed
   */
  public addMessage = (message: DisplayMessage): void => {    
    // Fill in optional parameters
    const newMessage = this.fillInMessage(message);
    
    // Get display groups to add message
    // TODO: This is a bit redundant, mainly because of optional category. To ponder... (just make it required?):
    const messageCategory: DisplayMessageCategory = get(newMessage, 'category', DisplayMessageCategory.INFO);
    const displayGroupIds = this.getDisplayGroupIdsForMessage(messageCategory);

    // Add message to applicable display groups
    for (const displayGroupId of displayGroupIds) {
      const displayGroup = this.messages2[displayGroupId];
      
      // Set an expiration timer if there isn't an active one already.
      if (displayGroup.messages.length === 0) {
        this.setMessageKillTimer(displayGroupId, Number(newMessage.timeToLive));
      }

      displayGroup.messages.push(newMessage);

      // Clear out a low priority message if there are more than max in the array
      if (displayGroup.messages.length > displayGroup.maxDisplayedMessages) {
        this.removeMessage(displayGroupId);
      }
    }
  }

  /**
   * Fill in a submitted message with default values where needed.
   */
  protected fillInMessage = (message: DisplayMessage): DisplayMessage => {
    return {
      id: get(message, 'id', uuidv4()),
      category: get(message, 'category', this.defaultCategory),
      canOverride: get(message, 'canOverride', this.defaultCanOverride),
      message: message.message,
      source: message.source,
      timeToLive: get(message, 'timeToLive', this.defaultTimeToLive),
      userNote: get(message, 'userNote'),
      userNickname: get(message, 'userNickname'),
      userId: get(message, 'userId'),
      userAvatar: get(message, 'userAvatar')
    }
  }

  /**
   * Get message group ids ready to receive the message with given category.
   */
  protected getDisplayGroupIdsForMessage = (category: DisplayMessageCategory): string[] => {
    const displayGroupKeys = Object.keys(this.messages2);
    const displayGroupIds: string[] = displayGroupKeys.filter((groupId: string) => {
      const groupCategories = this.messages2[groupId].messageCategories;
      return groupCategories.filter(groupCategory => groupCategory === category).length > 0;
    });
    return displayGroupIds;
  }

  /**
   * Set a timer to remove messages for display over time.
   */
  protected setMessageKillTimer = (displayGroupId: string, timeToLive: number): void => {
    const messageGroup = this.messages2[displayGroupId]
    clearInterval(messageGroup.timer);
    messageGroup.timer = window.setTimeout(() => {
      this.removeMessage(displayGroupId);
    }, timeToLive);
  }

  /**
   * Remove the first message when it is expired.
   */
  public removeMessage = (displayGroupId: string): void => {
    const messages = this.messages2[displayGroupId].messages;
    messages.shift();

    // Reset timer if additional messages remain.
    if (messages.length > 0) {
      const timeToLive = Number(messages[0].timeToLive);
      this.setMessageKillTimer(displayGroupId, timeToLive);
    }
  }
  
}

export default DisplayMessageStore;
