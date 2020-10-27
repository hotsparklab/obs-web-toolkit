import { EventEmitter } from 'events';
import { TwitchEvent } from './model/TwitchEvent';

/**
 * Share Twitch events with other interested server-side classes.
 */
class TwitchEventShare extends EventEmitter { 
  
  protected static instance: TwitchEventShare;

  constructor() {
    super();

    if (TwitchEventShare.instance) {
      throw new Error("Error - use TwitchEventShare.getInstance()");
    }

    // Set singleton instance
    TwitchEventShare.instance = this;
  }

  /**
   * Get singleton instance
   */
  public static getInstance = (): TwitchEventShare => {
    TwitchEventShare.instance = TwitchEventShare.instance || new TwitchEventShare();
    return TwitchEventShare.instance;
  }

  /**
   * Share a Twitch event with clients and server listeners
   */
  public shareTwitchEvent(socket: SocketIO.Namespace, eventType: TwitchEvent, event: any): void {
    // Emit to other server-side things
    this.emit(eventType, event);

    // Emit to client(s)
    socket.emit(eventType, event);
  }
  
}

export default TwitchEventShare;
