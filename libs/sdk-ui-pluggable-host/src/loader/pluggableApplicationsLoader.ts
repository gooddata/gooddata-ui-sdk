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

export function preloadPluggableApplication(app: PluggableApplicationRegistryItem): void {
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
