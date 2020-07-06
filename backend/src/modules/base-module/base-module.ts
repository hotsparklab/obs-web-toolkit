import * as express from 'express';
import * as socketIo from 'socket.io';

export class BaseModule {
    // Base route for this module
    // Note: Replace this with the extended module directory name.
    protected baseRoute = '/base-module';

    protected router: express.Router;
    protected io: SocketIO.Server;

    constructor(router: express.Router, io: SocketIO.Server) {
        this.router = router;
        this.io = io;
    }

    /**
     * Set the Express routes for this module (nothing by default)
     */
    protected setRoutes(): void {
        // Example:
        /*
        router.get(`${this.baseRoute}/echo/:echoThis`, (req, res) => {
            this.echoThis(req, res);
        });
        */
    }

    // Example: 
    /*
    protected echoThis(req: any, res: any): void {
        res.send({ response: `Let's echo this: ${req.params.echoThis}` }).status(200);
    }
    */
}