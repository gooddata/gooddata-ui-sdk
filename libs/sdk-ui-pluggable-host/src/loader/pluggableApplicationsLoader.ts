// (C) 2026 GoodData Corporation

import {
    type PluggableApplicationRegistryItem,
    isExternalPluggableApplicationRegistryItem,
    isLocalPluggableApplicationRegistryItem,
    isRemotePluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPluggableApp } from "@gooddata/sdk-pluggable-application-model";

import { now } from "../debug.js";
import { type IAppLifecycleCallbacks } from "../types/lifecycle.js";

import { loadLocalPluggableApplication } from "./localLoader.js";
import { loadRemotePluggableApplication, preloadRemotePluggableApplication } from "./remoteLoader.js";

let registeredLifecycle: IAppLifecycleCallbacks | undefined;

/**
 * Registers app lifecycle callbacks used by the loader (e.g. for preload telemetry).
 * Called by the host or harness at startup.
 *
 * @alpha
 */
export function registerAppLifecycleCallbacks(callbacks: IAppLifecycleCallbacks): void {
    registeredLifecycle = callbacks;
}

export function getAppLifecycleCallbacks(): IAppLifecycleCallbacks | undefined {
    return registeredLifecycle;
}

interface INetworkInformation {
    saveData?: boolean;
    effectiveType?: string;
}

const PRELOAD_HOSTILE_EFFECTIVE_TYPES = ["slow-2g", "2g"];

/**
 * Whether speculative preloading should be skipped altogether.
 *
 * Preloading trades bandwidth for latency, which is a bad trade when bandwidth is the scarce
 * resource: on a very slow link the preload competes with the requests the page the user is
 * actually looking at still needs. An explicit Save-Data opt-out is respected for the same
 * reason.
 *
 * `navigator.connection` is not implemented everywhere; absent it we keep preloading.
 *
 * Exported for tests.
 */
export function shouldSkipPreload(): boolean {
    if (typeof navigator === "undefined") {
        return true;
    }

    const connection = (navigator as Navigator & { connection?: INetworkInformation }).connection;

    if (!connection) {
        return false;
    }

    return (
        connection.saveData === true ||
        (connection.effectiveType !== undefined &&
            PRELOAD_HOSTILE_EFFECTIVE_TYPES.includes(connection.effectiveType))
    );
}

export function preloadPluggableApplication(app: PluggableApplicationRegistryItem): void {
    if (shouldSkipPreload()) {
        return;
    }
    if (isLocalPluggableApplicationRegistryItem(app)) {
        registeredLifecycle?.onPreloadStarted?.(app.id);
        const start = now();
        loadLocalPluggableApplication(app.id)
            .then(() => {
                registeredLifecycle?.onPreloadCompleted?.(app.id, now() - start);
            })
            .catch(() => {
                // Load errors are logged by loadLocalPluggableApplication
            });
        return;
    }
    if (isRemotePluggableApplicationRegistryItem(app)) {
        registeredLifecycle?.onPreloadStarted?.(app.id);
        const start = now();
        preloadRemotePluggableApplication(app.remote)
            .then(() => {
                registeredLifecycle?.onPreloadCompleted?.(app.id, now() - start);
            })
            .catch(() => {
                // Load errors are logged by preloadRemotePluggableApplication
            });
    }
}

export async function loadPluggableApplication(
    app: PluggableApplicationRegistryItem,
): Promise<IPluggableApp> {
    if (isExternalPluggableApplicationRegistryItem(app)) {
        throw new Error(
            `[host-runtime/loader] External application "${app.id}" cannot be mounted in PluggableApplicationRenderer.`,
        );
    }

    if (isLocalPluggableApplicationRegistryItem(app)) {
        return loadLocalPluggableApplication(app.id);
    }

    if (isRemotePluggableApplicationRegistryItem(app)) {
        return loadRemotePluggableApplication(app.remote);
    }

    throw new Error(`[host-runtime/loader] Unknown application type for "${JSON.stringify(app)}".`);
}
