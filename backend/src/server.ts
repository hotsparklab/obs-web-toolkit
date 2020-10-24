import { WebToolkitServer } from './WebToolkitServer';
import { config } from './config/config';

let app = new WebToolkitServer(config).app;

export { app };