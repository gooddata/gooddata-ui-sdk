// (C) 2026 GoodData Corporation

import { type IPluggableApp } from "@gooddata/sdk-pluggable-application-model";

/**
 * @alpha
 */
export type LocalPluggableApplicationLoader = () => Promise<{
    // `default` may be an IPluggableApp (direct default export) or a module namespace
    // object (when the module has only named exports). asPluggableApp() handles both.
    default?: IPluggableApp | unknown;
    pluggableApp?: IPluggableApp;
}>;

/**
 * Shape of a module returned by a {@link LocalPluggableApplicationLoader}.
 * Kept internal so the public type alias above stays the sole source of truth.
 */
interface ILoadedLocalPluggableApplicationModule {
    default?: IPluggableApp | unknown;
    pluggableApp?: IPluggableApp;
}

let registeredLoaders: Record<string, LocalPluggableApplicationLoader> = {};

/**
 * Registers the local application loaders map. Called by the host or harness
 * before any app loading occurs.
 *
 * @alpha
 */
export function registerLocalApplicationLoaders(
    loaders: Record<string, LocalPluggableApplicationLoader>,
): void {
    registeredLoaders = loaders;
    localAppPromises.clear();
}

const localAppPromises = new Map<string, Promise<IPluggableApp>>();

function asPluggableApp(moduleId: string, loaded: ILoadedLocalPluggableApplicationModule): IPluggableApp {
    const app = loaded.pluggableApp ?? (loaded.default as IPluggableApp | undefined);
    if (!app || typeof app.mount !== "function") {
        throw new Error(
            `[host-runtime/local-loader] Local module "${moduleId}" does not export a valid pluggable app.`,
        );
    }
    return app;
}

export function loadLocalPluggableApplication(moduleId: string): Promise<IPluggableApp> {
    const cached = localAppPromises.get(moduleId);
    if (cached) {
        return cached;
    }

    const loader = registeredLoaders[moduleId];
    if (!loader) {
        return Promise.reject(
            new Error(`[host-runtime/local-loader] Unknown local module "${moduleId}" in registry.`),
        );
    }

    const loadingPromise = loader()
        .then((loaded) => asPluggableApp(moduleId, loaded))
        .catch((error) => {
            localAppPromises.delete(moduleId);
            throw error;
        });
    localAppPromises.set(moduleId, loadingPromise);
    return loadingPromise;
}
