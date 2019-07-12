import Context from "./context";
import DataStore from "./datastore";
import ScriptRegistry from "./script_registry";
import Poller from './poller';

interface Endpoint {
    context: Context;
    scriptRegistry: ScriptRegistry;
    poller: Poller;
    datastore: DataStore;
}

export default class EndpointRegistry {
    private endpoints: Record<string, Endpoint> = {};

    private generateId(url: string, container: string | null = null) {
        return `${url}::${container}`;
    }

    find(url: string, container: string | null = null) {
        const id = this.generateId(url, container);
        return this.endpoints[id];
    }

    create(url: string, container: string | null, keepPollingMs: number, oldestDataMs: number) {
        const id = this.generateId(url, container);
        const context = new Context(url, container);
        const datastore = new DataStore(context, oldestDataMs);
        const poller = new Poller(context, datastore, keepPollingMs);
        const scriptRegistry = new ScriptRegistry(context, poller, keepPollingMs);

        this.endpoints[id] = { context, datastore, poller, scriptRegistry };
        return this.endpoints[id];
    }

    list() {
        return Object.values(this.endpoints);
    }

}