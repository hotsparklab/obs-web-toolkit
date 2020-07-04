// Thanks: https://medium.com/@rossbulat/typescript-live-chat-express-and-socket-io-server-setup-8d24fe13d00
// Thanks: https://www.valentinog.com/blog/socket-react/

// TODO: Set REST routes in a modular way
// TODO: Plug in socket.io capabilities in a modular way

import * as express from 'express';
import * as socketIo from 'socket.io';
import { createServer, Server } from 'http';
import { SocketIoEvent } from './model/socketIoEvent';

// TODO: Update and test this:
const cors = require('cors');

export class WebToolkitServer {
    // TODO: Move this to config
    public static readonly PORT: number = 8080;
    
    protected _app: express.Application;
    protected server: Server;
    protected router: express.Router;
    protected io: SocketIO.Server;
    protected port: string | number;
    
    constructor () {
      this._app = express();

      // TODO: Move this to config
      this.port = process.env.PORT || WebToolkitServer.PORT;

      this._app.use(cors());
      this._app.options('*', cors());
      this.server = createServer(this._app);
      this.router = express.Router();
      this.initSocket();
      this.initRoutes();
      this.listen();
    }

    protected listen (): void {
      this.server.listen(this.port, () => {
        console.log('Running server on port %s', this.port);
      });
  
      this.io.on(SocketIoEvent.CONNECT, (socket: socketIo.Socket) => {
        console.log(`Connected client on port ${this.port}.`);
  
        // TODO: Consider what to do with individual socket connections once connected.
        // Plug in other modules if possible right here? subscribeToAllEvents?
        // Namespaces! Rooms?
        /*
        socket.on(SocketIoEvent.MESSAGE, (m: SomeMessage) => {
          console.log('[server](message): %s', JSON.stringify(m));
          this.io.emit('message', m);
        });
        */
  
        // Fired when the client is going to be disconnected (but hasn’t left its rooms yet).
        socket.on(SocketIoEvent.DISCONNECTING, (reason: string) => {
          console.log('Client disconnecting but has not left room(s) yet');
        });

        // Fired upon disconnection.
        socket.on(SocketIoEvent.DISCONNECT, (reason: string) => {
          console.log('Client disconnected');
        });

        // TODO: Replace 'any' if possible
        socket.on(SocketIoEvent.ERROR, (error: any) => {
          console.log('Client error');
        });
      });

    }

    /**
     * 
     */
    protected initSocket(): void {
      this.io = socketIo(this.server);
    }

    /**
     * 
     */
    protected initRoutes(): void {
      // TODO: Make this for real. Make it scale.
      this.router.get("/", (req, res) => {
        res.send({ response: "I am alive" }).status(200);
      });

      this._app.use(this.router);
    }

    /**
     * Return the express app
     */
    get app (): express.Application {
      return this._app;
    }
}