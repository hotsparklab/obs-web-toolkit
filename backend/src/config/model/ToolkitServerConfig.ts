import { ClientConfig } from './ClientConfig';
import { ModuleConfig } from './ModuleConfig';

export interface ToolkitServerConfig
{
    port: number,
    clientConfig: ClientConfig
    moduleConfig: ModuleConfig
}