// (C) 2026 GoodData Corporation

import { RecommendedCachingConfiguration, withCaching } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend, type NotAuthenticatedHandler } from "@gooddata/sdk-backend-spi";
import {
    ContextDeferredAuthProvider,
    type JwtIsAboutToExpireHandler,
    type SetJwtCallback,
    TigerJwtAuthProvider,
    TigerTokenAuthProvider,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { type IAuthCredentials } from "@gooddata/sdk-pluggable-application-model";

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
}

export interface IBackendFactory {
    getBackend: () => IAnalyticalBackend;
    getAuthCredentials: () => IAuthCredentials;
    setNotAuthenticatedHandler: (handler: NotAuthenticatedHandler) => void;
    setApiToken: (token: string) => void;
    setJwt: (jwt: string, secondsBeforeTokenExpirationToCallReminder?: number) => void;
}

const decorateBackend = (backend: IAnalyticalBackend): IAnalyticalBackend => {
    return withCaching(backend, RecommendedCachingConfiguration);
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
    };

    const packageVersion =
        options.packageVersion ??
        (typeof window === "undefined" || !window.COMMITHASH ? "dev" : window.COMMITHASH);
    let currentAuth: IAuthCredentials = options.auth ?? getDefaultAuthCredentials();
    let notAuthenticatedErrorHandler: NotAuthenticatedHandler | undefined;

    const baseBackend = tigerFactory(undefined, {
        packageName: options.packageName ?? "@gooddata/sdk-ui-pluggable-host",
        packageVersion,
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

    let backend: IAnalyticalBackend = decorateBackend(getBackendImplementation(currentAuth));

    const setNotAuthenticatedHandler = (handler: NotAuthenticatedHandler) => {
        notAuthenticatedErrorHandler = handler;
    };

    const setApiToken = (token: string) => {
        currentAuth = { type: "apiToken", token };
        if (setApiTokenHandler) {
            setApiTokenHandler(token);
            return;
        }
        backend = decorateBackend(getBackendImplementation(currentAuth));
    };

    const setJwt: IBackendFactory["setJwt"] = (jwt, secondsBeforeTokenExpirationToCallReminder) => {
        currentAuth = { type: "jwt", token: jwt, secondsBeforeTokenExpirationToCallReminder };
        if (setJwtHandler) {
            setJwtHandler(jwt, secondsBeforeTokenExpirationToCallReminder);
            return;
        }
        backend = decorateBackend(getBackendImplementation(currentAuth));
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
