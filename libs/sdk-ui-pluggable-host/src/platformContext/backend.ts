// (C) 2026 GoodData Corporation

import {
    type CacheControl,
    RecommendedCachingConfiguration,
    withCaching,
    withCustomWorkspaceSettings,
} from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend, type NotAuthenticatedHandler } from "@gooddata/sdk-backend-spi";
import {
    ContextDeferredAuthProvider,
    type JwtIsAboutToExpireHandler,
    type SetJwtCallback,
    TigerJwtAuthProvider,
    TigerTokenAuthProvider,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { type ISettings } from "@gooddata/sdk-model";
import { type IAuthCredentials } from "@gooddata/sdk-pluggable-application-model";

import { notifyContractExpired } from "./contractExpired.js";
import { createNotAuthenticatedHandler } from "./tigerNotAuthenticatedHandler.js";

export interface ICreateBackendOptions {
    /**
     * Package name reported to the backend for telemetry.
     * Defaults to `"@gooddata/sdk-ui-pluggable-host"`.
     */
    packageName?: string;
    /**
     * Optional override for the package version reported to backend.
     *
     * @remarks
     * By default, this is taken from `window.COMMITHASH` (same as AD), falling back to `"dev"`.
     */
    packageVersion?: string;
    auth?: IAuthCredentials;
    /**
     * Called when the JWT of the auth provider is about to expire. An embedded application uses
     * it to ask its parent page for a renewal, which it then applies through `setJwt`.
     */
    onJwtIsAboutToExpire?: () => void;
}

/**
 * The backend of a pluggable application or the host, with its auth and cache lifecycle.
 */
export interface IBackendFactory {
    getBackend: () => IAnalyticalBackend;
    getAuthCredentials: () => IAuthCredentials;
    setNotAuthenticatedHandler: (handler: NotAuthenticatedHandler) => void;
    /** Renews the API token in place when the auth type stays; otherwise rebuilds the backend. */
    setApiToken: (token: string) => void;
    /** The JWT counterpart of setApiToken. */
    setJwt: (jwt: string, secondsBeforeTokenExpirationToCallReminder?: number) => void;
    /** Resets ALL caches of the backend's caching decorator. */
    resetAllCaches: () => void;
    /** Resets the catalog cache of the backend's caching decorator. */
    resetCatalogs: () => void;
}

/**
 * E2E tests set `window.customWorkspaceSettings` before the page loads. They win over the
 * workspace settings from the backend, so `ctx.settings`, `ctx.workspaceSettings` and the host
 * UI (for example the AI chat) see the same values as the pluggable applications.
 */
const getCustomWorkspaceSettings = (): ISettings | undefined => {
    if (typeof window === "undefined") {
        return undefined;
    }
    return (window as { customWorkspaceSettings?: ISettings }).customWorkspaceSettings;
};

/**
 * Merges `window.customWorkspaceSettings` over `settings`. Used both for the workspace settings
 * decorator and for the current-user settings read at bootstrap, which the decorator does not reach.
 */
export function applyCustomWorkspaceSettings<T extends ISettings>(settings: T): T {
    const customSettings = getCustomWorkspaceSettings();
    return customSettings ? { ...settings, ...customSettings } : settings;
}

export const wrapWithCustomWorkspaceSettings = (backend: IAnalyticalBackend): IAnalyticalBackend => {
    if (!getCustomWorkspaceSettings()) {
        return backend;
    }
    return withCustomWorkspaceSettings(backend, {
        commonSettingsWrapper: applyCustomWorkspaceSettings,
    });
};

const EMBEDDED_PATH_PREFIX = "/embedded/";
const EXTERNAL_PROVIDER_ID_PARAM = "externalproviderid";

function readExternalProviderIdFromUrl(): string | undefined {
    if (typeof window === "undefined" || !window.location.pathname.startsWith(EMBEDDED_PATH_PREFIX)) {
        return undefined;
    }
    const fromQuery = (query: string): string | undefined => {
        for (const [key, value] of new URLSearchParams(query)) {
            if (key.toLowerCase() === EXTERNAL_PROVIDER_ID_PARAM && value) {
                return value;
            }
        }
        return undefined;
    };
    const hash = window.location.hash;
    const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
    return fromQuery(window.location.search.replace(/^\?/, "")) ?? fromQuery(hashQuery);
}

function getDefaultAuthCredentials(): IAuthCredentials {
    const apiToken =
        typeof TIGER_API_TOKEN === "string" && TIGER_API_TOKEN.length ? TIGER_API_TOKEN : undefined;

    if (apiToken) {
        return { type: "apiToken", token: apiToken };
    }

    const externalProviderId = readExternalProviderIdFromUrl();
    return externalProviderId ? { type: "contextDeferred", externalProviderId } : { type: "contextDeferred" };
}

export function createBackendFactory(options: ICreateBackendOptions = {}): IBackendFactory {
    let setApiTokenHandler: ((token: string) => void) | undefined = undefined;
    let setJwtHandler: SetJwtCallback | undefined = undefined;
    const jwtIsAboutToExpire: JwtIsAboutToExpireHandler = (setJwt) => {
        setJwtHandler = setJwt;
        options.onJwtIsAboutToExpire?.();
    };

    // The cache controls of the current backend; replaced whenever the backend is rebuilt.
    let cacheControl: CacheControl | undefined;
    const decorateBackend = (backend: IAnalyticalBackend): IAnalyticalBackend =>
        withCaching(wrapWithCustomWorkspaceSettings(backend), {
            ...RecommendedCachingConfiguration,
            onCacheReady: (control) => {
                cacheControl = control;
            },
        });

    const packageVersion =
        options.packageVersion ??
        (typeof window === "undefined" || !window.COMMITHASH ? "dev" : window.COMMITHASH);
    let currentAuth: IAuthCredentials = options.auth ?? getDefaultAuthCredentials();
    let notAuthenticatedErrorHandler: NotAuthenticatedHandler | undefined;

    const baseBackend = tigerFactory(undefined, {
        packageName: options.packageName ?? "@gooddata/sdk-ui-pluggable-host",
        packageVersion,
        onContractExpired: notifyContractExpired,
    });

    const externalProviderId =
        currentAuth.type === "contextDeferred" ? currentAuth.externalProviderId : undefined;
    const defaultNotAuthenticatedHandler = createNotAuthenticatedHandler(externalProviderId);
    const backendNotAuthenticatedHandler: NotAuthenticatedHandler = (context, error) => {
        const handler = notAuthenticatedErrorHandler;
        if (handler) {
            handler(context, error);
            return;
        }
        defaultNotAuthenticatedHandler(context, error);
    };

    const getBackendImplementation = (auth: IAuthCredentials): IAnalyticalBackend => {
        switch (auth.type) {
            case "apiToken": {
                const tigerTokenAuthProvider = new TigerTokenAuthProvider(
                    auth.token,
                    backendNotAuthenticatedHandler,
                );
                setApiTokenHandler = tigerTokenAuthProvider.updateApiToken;
                return baseBackend.withAuthentication(tigerTokenAuthProvider);
            }
            case "jwt": {
                const jwtAuthProvider = new TigerJwtAuthProvider(
                    auth.token,
                    backendNotAuthenticatedHandler,
                    jwtIsAboutToExpire,
                    auth.secondsBeforeTokenExpirationToCallReminder,
                );
                setJwtHandler = jwtAuthProvider.updateJwt;
                return baseBackend.withAuthentication(jwtAuthProvider);
            }
            case "contextDeferred":
                return baseBackend.withAuthentication(
                    new ContextDeferredAuthProvider(backendNotAuthenticatedHandler),
                );
        }
    };

    // A rebuild drops the update handlers of the previous provider, so a later renewal of that
    // auth type cannot reach a provider the backend no longer uses.
    const rebuildBackend = (auth: IAuthCredentials): IAnalyticalBackend => {
        setApiTokenHandler = undefined;
        setJwtHandler = undefined;
        return decorateBackend(getBackendImplementation(auth));
    };

    let backend: IAnalyticalBackend = rebuildBackend(currentAuth);

    const setNotAuthenticatedHandler = (handler: NotAuthenticatedHandler) => {
        notAuthenticatedErrorHandler = handler;
    };

    const setApiToken = (token: string) => {
        const previousAuth = currentAuth;
        currentAuth = { type: "apiToken", token };
        if (previousAuth.type === "apiToken" && setApiTokenHandler) {
            setApiTokenHandler(token);
            return;
        }
        backend = rebuildBackend(currentAuth);
    };

    const setJwt: IBackendFactory["setJwt"] = (jwt, secondsBeforeTokenExpirationToCallReminder) => {
        const previousAuth = currentAuth;
        currentAuth = { type: "jwt", token: jwt, secondsBeforeTokenExpirationToCallReminder };
        if (previousAuth.type === "jwt" && setJwtHandler) {
            setJwtHandler(jwt, secondsBeforeTokenExpirationToCallReminder);
            return;
        }
        backend = rebuildBackend(currentAuth);
    };

    /**
     * Returns a snapshot of the current auth credentials.
     *
     * Note: callers receive a point-in-time snapshot. If tokens change after
     * the snapshot is taken, the caller must re-invoke `getAuthCredentials()`
     * or the host must push an updated context via `updateContext`.
     */
    const getAuthCredentials = (): IAuthCredentials => currentAuth;

    return {
        getBackend: () => backend,
        getAuthCredentials,
        setNotAuthenticatedHandler,
        setApiToken,
        setJwt,
        resetAllCaches: () => cacheControl?.resetAll(),
        resetCatalogs: () => cacheControl?.resetCatalogs(),
    };
}

let runtimePackageName = "@gooddata/sdk-ui-pluggable-host";
let backendFactory: IBackendFactory | undefined;

function getOrCreateFactory(): IBackendFactory {
    if (!backendFactory) {
        backendFactory = createBackendFactory({ packageName: runtimePackageName });
    }
    return backendFactory;
}

/**
 * Sets the package name reported to the backend for telemetry.
 * Must be called before the first backend request (i.e., before Root renders).
 *
 * @alpha
 */
export function setRuntimePackageName(name: string): void {
    runtimePackageName = name;
}

/**
 * Recreates backend lifecycle instance with new auth configuration.
 */
export function reinitializeBackend(auth?: IAuthCredentials): void {
    backendFactory = createBackendFactory({ packageName: runtimePackageName, auth });
}

/**
 * @alpha
 */
export function getBackend(): IAnalyticalBackend {
    return getOrCreateFactory().getBackend();
}

export function getAuthCredentials(): IAuthCredentials {
    return getOrCreateFactory().getAuthCredentials();
}

export function setNotAuthenticatedHandler(handler: NotAuthenticatedHandler): void {
    getOrCreateFactory().setNotAuthenticatedHandler(handler);
}

export function setApiToken(token: string): void {
    getOrCreateFactory().setApiToken(token);
}

export function setJwt(jwt: string, secondsBeforeTokenExpirationToCallReminder?: number): void {
    getOrCreateFactory().setJwt(jwt, secondsBeforeTokenExpirationToCallReminder);
}
