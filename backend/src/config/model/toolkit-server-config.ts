import { ClientConfig } from './client-config';
import { ModuleConfig } from './module-config';

export interface ToolkitServerConfig
{
    port: number,
    clientConfig: ClientConfig
    moduleConfig: ModuleConfig
}