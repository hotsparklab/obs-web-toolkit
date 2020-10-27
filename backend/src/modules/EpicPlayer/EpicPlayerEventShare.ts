import { EventEmitter } from 'events';
import { EpicPlayerEvent } from './model/EpicPlayerEvent';

/**
 * Share EpicPlayer events with other interested server-side classes.
 */
class EpicPlayerEventShare extends EventEmitter { 
  
  protected static instance: EpicPlayerEventShare;

  constructor() {
    super();

    if (EpicPlayerEventShare.instance) {
      throw new Error("Error - use EpicPlayerEventShare.getInstance()");
    }

    // Set singleton instance
    EpicPlayerEventShare.instance = this;
  }

  /**
   * Get singleton instance
   */
  public static getInstance = (): EpicPlayerEventShare => {
    EpicPlayerEventShare.instance = EpicPlayerEventShare.instance || new EpicPlayerEventShare();
    return EpicPlayerEventShare.instance;
  }

  /**
   * Share a EpicPlayer event with clients and server listeners
   */
  public shareEpicPlayerEvent(socket: SocketIO.Namespace, eventType: EpicPlayerEvent, event: any): void {
    // Emit to other server-side things
    this.emit(eventType, event);

    // Emit to client(s)
    socket.emit(eventType, event);
  }
  
}

export default EpicPlayerEventShare;
