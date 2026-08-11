// (C) 2026 GoodData Corporation

import { type ModuleFederation, createInstance } from "@module-federation/runtime";

import { type IRemotePluggableApplicationModule } from "@gooddata/sdk-model";
import { type IPluggableApp, type IHostUiModule } from "@gooddata/sdk-pluggable-application-model";

import { createHostFederationPlugin } from "./federationRuntimePlugin.js";
import { isAllowedRemoteHostname } from "./remoteUrlSecurity.js";

interface ILoadedRemotePluggableApplicationModule {
    default?: IPluggableApp;
    pluggableApp?: IPluggableApp;
}

const remoteAppPromises = new Map<string, Promise<IPluggableApp>>();
const registeredRemoteScopeUrls = new Map<string, string>();

let federation: ModuleFederation | undefined;

function getFederation(): ModuleFederation {
    if (!federation) {
        federation = createInstance({
            name: "gdc_host",
            remotes: [],
            plugins: [createHostFederationPlugin()],
        });
    }
    return federation;
}

function normalizeModuleName(moduleName: string): string {
    return moduleName.replace(/^\.\//, "");
}

function isJSEntry(url: string): boolean {
    return /\.m?js(?:$|\?)/.test(url);
}

function asPluggableApp(
    remote: IRemotePluggableApplicationModule,
    loaded: ILoadedRemotePluggableApplicationModule,
): IPluggableApp {
    const app = loaded.pluggableApp ?? loaded.default;

    if (!app || typeof app.mount !== "function") {
        throw new Error(
            `[host-runtime/remote-loader] Remote module "${remote.scope}/${remote.module}" does not export a valid pluggable app. (type: ${typeof loaded}, hasMount: ${typeof (loaded as any)?.mount}, keys: ${Object.keys(loaded ?? {})})`,
        );
    }

    return app;
}

function getCacheKey(remote: IRemotePluggableApplicationModule): string {
    return `${remote.scope}::${remote.url}::${remote.module}`;
}

function registerRemote(remote: IRemotePluggableApplicationModule): void {
    const existingUrl = registeredRemoteScopeUrls.get(remote.scope);

    if (!remote.url) {
        throw new Error(
            existingUrl
                ? `[host-runtime/remote-loader] Remote "${remote.scope}" has no URL configured. Refusing to load to avoid using previously registered URL "${existingUrl}".`
                : `[host-runtime/remote-loader] Remote "${remote.scope}" has no URL configured.`,
        );
    }

    // Security: reject remotes not hosted on the same hostname or an allowlisted hostname.
    if (!isAllowedRemoteHostname(remote.url)) {
        throw new Error(
            existingUrl
                ? `[host-runtime/remote-loader] Remote "${remote.scope}" URL "${remote.url}" is not on an allowed hostname. Refusing to load to avoid using previously registered URL "${existingUrl}".`
                : `[host-runtime/remote-loader] Remote "${remote.scope}" URL "${remote.url}" is not on an allowed hostname.`,
        );
    }

    if (existingUrl === remote.url) {
        return;
    }

    const force = existingUrl !== undefined && existingUrl !== remote.url;
    const remoteRegistration = {
        name: remote.scope,
        entry: remote.url,
        ...(isJSEntry(remote.url) ? { type: "module" as const } : {}),
    };

    try {
        getFederation().registerRemotes([remoteRegistration], force ? { force: true } : undefined);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
            `[host-runtime/remote-loader] Failed to register remote "${remote.scope}" from "${remote.url}": ${message}`,
        );
    }

    registeredRemoteScopeUrls.set(remote.scope, remote.url);
}

async function loadRemoteModule<T = ILoadedRemotePluggableApplicationModule>(
    remote: IRemotePluggableApplicationModule,
): Promise<T> {
    registerRemote(remote);

    const moduleName = normalizeModuleName(remote.module);
    const loaded = await getFederation().loadRemote<T>(`${remote.scope}/${moduleName}`);

    if (!loaded) {
        throw new Error(
            `[host-runtime/remote-loader] Remote module "${remote.scope}/${moduleName}" resolved to null.`,
        );
    }

    return loaded;
}

export function loadRemotePluggableApplication(
    remote: IRemotePluggableApplicationModule,
): Promise<IPluggableApp> {
    const cacheKey = getCacheKey(remote);
    const cached = remoteAppPromises.get(cacheKey);

    if (cached) {
        return cached;
    }

    const loadingPromise = loadRemoteModule(remote)
        .then((loaded) => asPluggableApp(remote, loaded))
        .catch((error) => {
            remoteAppPromises.delete(cacheKey);
            throw error;
        });

    remoteAppPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
}

// ---------------------------------------------------------------------------
// Host UI module loading
// ---------------------------------------------------------------------------

interface ILoadedHostUiRemoteModule {
    default?: IHostUiModule;
    hostUiModule?: IHostUiModule;
}

function asHostUiModule(
    remote: IRemotePluggableApplicationModule,
    loaded: ILoadedHostUiRemoteModule,
): IHostUiModule {
    const mod = loaded.hostUiModule ?? loaded.default;

    if (!mod || typeof mod.mount !== "function") {
        throw new Error(
            `[host-runtime/remote-loader] Remote UI module "${remote.scope}/${remote.module}" does not export a valid IHostUiModule.`,
        );
    }

    return mod;
}

export async function loadRemoteHostUiModule(
    remote: IRemotePluggableApplicationModule,
): Promise<IHostUiModule> {
    const loaded = await loadRemoteModule<ILoadedHostUiRemoteModule>(remote);
    return asHostUiModule(remote, loaded);
}

export async function preloadRemotePluggableApplication(
    remote: IRemotePluggableApplicationModule,
): Promise<void> {
    // Warm the remote's JS + CSS as <link rel="preload"> from the MF manifest without
    // executing the module — CSS is fetched but never applied, so hovering doesn't restyle
    // the page. Registration and preload run inside the try so a synchronous registration
    // failure is caught too; on any failure reject after logging, so the caller skips
    // onPreloadCompleted (matching the local and load-remote paths).
    //
    // "sync" — not "all" — deliberately: "all" additionally pulls every async chunk reachable
    // from the expose, which for these applications is hundreds of files. Downloading that
    // whole graph on hover saturated slow connections (competing with the requests the current
    // page still needs), and the browser then warned "preloaded but not used" for each chunk
    // the user never reached. The sync assets are what an actual mount needs first.
    try {
        registerRemote(remote);
        await getFederation().preloadRemote([
            {
                nameOrAlias: remote.scope,
                exposes: [normalizeModuleName(remote.module)],
                resourceCategory: "sync",
            },
        ]);
    } catch (error: unknown) {
        // warn, not error: preloading is an optimisation. MF counts an asset that has not
        // finished within the link timeout as a failure, so a slow connection alone produces
        // this — nothing is broken, the assets are simply fetched again when the app is opened.
        console.warn(
            `[host-runtime/remote-loader] Could not preload remote "${remote.scope}/${remote.module}". This is a non-fatal warm-up failure; the application still loads on demand.`,
            error,
        );
        throw error;
    }
}
