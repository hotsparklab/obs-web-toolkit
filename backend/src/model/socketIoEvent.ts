export enum SocketIoEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error',

  // TODO: I wonder if this should be moved, defined in client code:
  READY = 'ready',

  // TODO: I wonder if this should be moved, defined in server code:
  CONFIG = 'config'
}
