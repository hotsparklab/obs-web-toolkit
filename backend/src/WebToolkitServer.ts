// Thanks: https://medium.com/@rossbulat/typescript-live-chat-express-and-socket-io-server-setup-8d24fe13d00
// Thanks: https://www.valentinog.com/blog/socket-react/

import express from 'express';
import * as bodyParser from 'body-parser';
import socketIo from 'socket.io';
import { createServer, Server } from 'http';
import { SocketIoEvent } from './model/socketIoEvent';
import { get } from 'lodash';
import { EpicPlayer } from './modules/epic-player/epic-player';
import { ToolkitServerConfig } from './config/model/toolkit-server-config';
import cors from 'cors';
import path from 'path';

export class WebToolkitServer {    
    protected _app: express.Application;
    protected server: Server;
    protected router: express.Router;
    protected io: SocketIO.Server;
    protected port: number;
    protected config: ToolkitServerConfig;
    protected epicPlayer: EpicPlayer;
    
    constructor (config: ToolkitServerConfig) {
      this.config = config;
      this.port = get(this.config, 'port', 4001);
      this.router = express.Router();

      this._app = express();
      this._app.use(cors());
      this._app.options('*', cors());
      this._app.use(bodyParser.json());
      this._app.use(bodyParser.urlencoded({ extended: true }));
      this._app.use(this.router);
      this._app.use(express.static(__dirname + '/../public'));

      this.server = createServer(this._app);
      this.io = socketIo(this.server);

      this.initBaseRoutes();
      this.enableModules();
      this.listen();
    }

    protected listen(): void {
      this.server.listen(this.port, () => {
        console.log('Running server on port %s', this.port);
      });
  
      this.io.on(SocketIoEvent.CONNECT, (socket: socketIo.Socket) => {
        console.log(`Connected client on port ${this.port}.`);
  
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

        // Client React App is ready to receive client settings.
        socket.on(SocketIoEvent.READY, () => {
          const clientConfig = get(this.config, 'clientConfig', { error: 'There is no client config set.' });
          socket.emit('clientConfig', clientConfig);
        });
      });
    }

    /**
     * Enable connected modules
     */
    protected enableModules(): void {
        // Enable epic player
        const epicPlayerEnabled = get(this.config, 'clientConfig.epicPlayerEnabled', false);
        if (epicPlayerEnabled) {
            this.epicPlayer = new EpicPlayer(this.config.moduleConfig.epicPlayer, this.app, this.router, this.io);
        }
    }

    /**
     * Initial base web toolkit server routes.
     */
    protected initBaseRoutes(): void {
      /*
      this.router.get("/", (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
      });
      */
    }

    /**
     * Return the express app
     */
    get app(): express.Application {
      return this._app;
    }
}