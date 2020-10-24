import io from "socket.io-client";
import { config } from '../../config';
import { makeObservable, observable } from 'mobx';
import DisplayMessageStore from '../DisplayMessageStore';
import { DataSource } from '../DisplayMessageStore/model/DataSource';
import { DisplayMessageCategory } from '../DisplayMessageStore/model/DisplayMessageCategory';

class TwitchChatStore { 
  
  private static instance: TwitchChatStore;

  protected socket: SocketIOClient.Socket;

  protected displayMessageStore: DisplayMessageStore;

  constructor() {
    if (TwitchChatStore.instance) {
      throw new Error("Error - use TwitchChatStore.getInstance()");
    }

    // Enable writing messages/logs to be displayed.
    this.displayMessageStore = DisplayMessageStore.getInstance();

    // Allow other components to react to state changes.
    // TODO: Relaying basic messages to DisplayMessageStore for now
    /*
    makeObservable(this, {
      
    });
    */

    // Connect to socket server and events
    this.socket = io.connect(`${config.SOCKET_URL}/twitch`);
    this.subscribeToSocketEvents();

    // Set singleton instance
    TwitchChatStore.instance = this;
  }

  /**
   * Get singleton instance (one and only one Epic Player running at once)
   */
  public static getInstance = (): TwitchChatStore => {
    TwitchChatStore.instance = TwitchChatStore.instance || new TwitchChatStore();
    return TwitchChatStore.instance;
  }

  /**
   * Subscribe to playlist request events.
   */
  protected subscribeToSocketEvents = (): void => {
    this.socket.on(DisplayMessageCategory.CONNECTED, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.ACTION}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.CONNECTED
      });
    });

    this.socket.on(DisplayMessageCategory.ACTION, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.ACTION}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.ACTION
      });
    });

    this.socket.on(DisplayMessageCategory.AUTHENTICATION_FAILURE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.AUTHENTICATION_FAILURE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.AUTHENTICATION_FAILURE
      });
    });

    this.socket.on(DisplayMessageCategory.BAN, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.BAN}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.BAN
      });
    });

    this.socket.on(DisplayMessageCategory.BITS_BADGE_UPGRADE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.BITS_BADGE_UPGRADE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.BITS_BADGE_UPGRADE
      });
    });

    this.socket.on(DisplayMessageCategory.CHAT_CLEAR, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.CHAT_CLEAR}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.CHAT_CLEAR
      });
    });

    this.socket.on(DisplayMessageCategory.COMMUNITY_PAY_FORWARD, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.COMMUNITY_PAY_FORWARD}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.COMMUNITY_PAY_FORWARD
      });
    });

    this.socket.on(DisplayMessageCategory.COMMUNITY_SUB, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.COMMUNITY_SUB}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.COMMUNITY_SUB
      });
    });

    this.socket.on(DisplayMessageCategory.EMOTE_ONLY, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.EMOTE_ONLY}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.EMOTE_ONLY
      });
    });

    this.socket.on(DisplayMessageCategory.FOLLOWERS_ONLY, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.FOLLOWERS_ONLY}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.FOLLOWERS_ONLY
      });
    });

    this.socket.on(DisplayMessageCategory.GIFT_PAID_UPGRADE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.GIFT_PAID_UPGRADE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.GIFT_PAID_UPGRADE
      });
    });

    this.socket.on(DisplayMessageCategory.HOST, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.HOST}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.HOST
      });
    });

    this.socket.on(DisplayMessageCategory.HOSTED, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.HOSTED}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.HOSTED
      });
    });

    this.socket.on(DisplayMessageCategory.HOSTS_REMAINING, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.HOSTS_REMAINING}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.HOSTS_REMAINING
      });
    });

    this.socket.on(DisplayMessageCategory.JOIN, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.JOIN}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.JOIN
      });
    });

    this.socket.on(DisplayMessageCategory.MESSAGE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.MESSAGE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.MESSAGE
      });
    });

    this.socket.on(DisplayMessageCategory.MESSAGE_FAILED, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.MESSAGE_FAILED}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.MESSAGE_FAILED
      });
    });

    this.socket.on(DisplayMessageCategory.MESSAGE_RATE_LIMIT, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.MESSAGE_RATE_LIMIT}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.MESSAGE_RATE_LIMIT
      });
    });

    this.socket.on(DisplayMessageCategory.MESSAGE_REMOVE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.MESSAGE_REMOVE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.MESSAGE_REMOVE
      });
    });

    this.socket.on(DisplayMessageCategory.NO_PERMISSION, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.NO_PERMISSION}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.NO_PERMISSION
      });
    });

    this.socket.on(DisplayMessageCategory.PART, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.PART}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.PART
      });
    });

    this.socket.on(DisplayMessageCategory.PRIME_COMMUNITY_GIFT, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.PRIME_COMMUNITY_GIFT}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.PRIME_COMMUNITY_GIFT
      });
    });

    this.socket.on(DisplayMessageCategory.PRIME_PAID_UPGRADE, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.PRIME_PAID_UPGRADE}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.PRIME_PAID_UPGRADE
      });
    });

    this.socket.on(DisplayMessageCategory.R9K, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.R9K}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.R9K
      });
    });

    this.socket.on(DisplayMessageCategory.RAID, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.RAID}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.RAID
      });
    });

    this.socket.on(DisplayMessageCategory.RAID_CANCEL, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.RAID_CANCEL}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.RAID_CANCEL
      });
    });

    this.socket.on(DisplayMessageCategory.RESUB, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.RESUB}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.RESUB
      });
    });

    this.socket.on(DisplayMessageCategory.REWARD_GIFT, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.REWARD_GIFT}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.REWARD_GIFT
      });
    });

    this.socket.on(DisplayMessageCategory.RITUAL, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.RITUAL}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.RITUAL
      });
    });

    this.socket.on(DisplayMessageCategory.SLOW, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.SLOW}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.SLOW
      });
    });

    this.socket.on(DisplayMessageCategory.STANDARD_PAY_FORWARD, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.STANDARD_PAY_FORWARD}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.STANDARD_PAY_FORWARD
      });
    });

    this.socket.on(DisplayMessageCategory.SUB, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.SUB}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.SUB
      });
    });

    this.socket.on(DisplayMessageCategory.SUB_EXTEND, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.SUB_EXTEND}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.SUB_EXTEND
      });
    });

    this.socket.on(DisplayMessageCategory.SUB_GIFT, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.SUB_GIFT}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.SUB_GIFT
      });
    });

    this.socket.on(DisplayMessageCategory.SUB_ONLY, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.SUB_ONLY}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.SUB_ONLY
      });
    });

    this.socket.on(DisplayMessageCategory.TIMEOUT, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.TIMEOUT}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.TIMEOUT
      });
    });

    this.socket.on(DisplayMessageCategory.UNHOST, (event: any) => {
      this.displayMessageStore.addMessage({
        source: DataSource.TWITCH,
        message: `${DisplayMessageCategory.UNHOST}: ${JSON.stringify(event)}`,
        category: DisplayMessageCategory.UNHOST
      });
    });

    // Handle socket errors.
    this.socket.on('connect_failed', () => {
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `TwitchChatStore: socket connection failed`,
        category: DisplayMessageCategory.ERROR
      });
    });
    this.socket.on('reconnect_failed', () => {
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `TwitchChatStore: socket failed to reconnect`,
        category: DisplayMessageCategory.ERROR
      });
    });
    this.socket.on('error', (err: Error) => {
      this.displayMessageStore.addMessage({
        source: DataSource.LOCAL,
        message: `TwitchChatStore: an error occurred: ${err.message}`,
        category: DisplayMessageCategory.ERROR
      });
    });

    // Emit 'ready' event to receive first batch of socket events.
    this.socket.emit('ready');
  }
}

export default TwitchChatStore;
