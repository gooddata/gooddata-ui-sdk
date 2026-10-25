// (C) 2020-2026 GoodData Corporation

import {
    type IWorkspaceSettingsConfiguration,
    RecommendedCachingConfiguration,
    withCaching,
    withCustomWorkspaceSettings,
    withEventing,
} from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    ContextDeferredAuthProvider,
    type JwtIsAboutToExpireHandler,
    type SetJwtCallback,
    TigerJwtAuthProvider,
    TigerTokenAuthProvider,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";
import { type IExecutionDefinition } from "@gooddata/sdk-model";

import { IS_DEBUG } from "./buildParams.js";
import { emitApiTokenIsAboutToExpire } from "./postMessageApi/outgoing/set_api_token_events.js";
import { withSemanticCfSimulation } from "./semanticCfSimulation.js";
import { createNotAuthenticatedHandler } from "./tigerNotAuthenticatedHandler.js";

const hasWindow = typeof window !== "undefined";

const wrapWithCustomSettings = (backend: IAnalyticalBackend) => {
    if (hasWindow && window["customWorkspaceSettings"]) {
        const settingsConfig: IWorkspaceSettingsConfiguration = {
            commonSettingsWrapper: (originalSettings) => {
                return {
                    ...originalSettings,
                    ...window["customWorkspaceSettings"],
                };
            },
        };
        return withCustomWorkspaceSettings(backend, settingsConfig);
    }
    return backend;
};

const wrapWithSemanticCfSimulation = (backend: IAnalyticalBackend): IAnalyticalBackend => {
    if (IS_DEBUG && hasWindow && window["semanticCfSimConfig"]) {
        return withSemanticCfSimulation(backend, window["semanticCfSimConfig"]);
    }
    return backend;
};

export type ApiTokenType = "gooddata" | "jwt";

export interface IApiToken {
    apiToken?: string;
    apiTokenType?: ApiTokenType;
    secondsBeforeTokenExpirationToCallReminder?: number;
}

export const isValidApiTokenType = (type?: ApiTokenType) =>
    type === undefined || type === "gooddata" || type === "jwt";

// reference to a callback that can update token in existing JWT analytical backend auth provider instance
// without necessity to exchange the instance for a new one
export let setJwtHandler: SetJwtCallback = undefined;

// reference to a callback that can update token in existing Tiger API token analytical backend auth provider
// instance without necessity to exchange the instance for a new one
export let setApiTokenHandler: (token: string) => void = undefined;

export const jwtIsAboutToExpire: JwtIsAboutToExpireHandler = (setJwt) => {
    setJwtHandler = setJwt;
    emitApiTokenIsAboutToExpire();
};

const getBackendImplementation = (
    apiTokenConfiguration?: IApiToken,
    externalProviderId?: string,
): IAnalyticalBackend => {
    const backend = tigerFactory(undefined, {
        packageName: "@gooddata/sdk-ui-analytical-designer",
        packageVersion: hasWindow && typeof window.COMMITHASH === "string" ? window.COMMITHASH : "dev",
    });

    const { apiToken, apiTokenType, secondsBeforeTokenExpirationToCallReminder } = apiTokenConfiguration;

    if (apiToken && apiTokenType === "gooddata") {
        /*
         * Authentication using Tiger API Token is the only viable way at the moment because Tiger
         * cross-origin dev support is flaky.
         */
        // oxlint-disable-next-line eslint-js/no-console
        console.log("Using Tiger API Token for authentication");

        const notAuthenticatedHandler = createNotAuthenticatedHandler();
        const tigerTokenAuthProvider = new TigerTokenAuthProvider(apiToken, notAuthenticatedHandler);

        // Store the reference to Tiger API Token update callback (used by postMessage API saga).
        setApiTokenHandler = tigerTokenAuthProvider.updateApiToken;

        return wrapWithCustomSettings(backend.withAuthentication(tigerTokenAuthProvider));
    } else if (apiToken && apiTokenType === "jwt") {
        // oxlint-disable-next-line eslint-js/no-console
        console.log("Using JWT for authentication");

        const notAuthenticatedHandler = createNotAuthenticatedHandler();

        const jwtAuthProvider = new TigerJwtAuthProvider(
            apiToken,
            notAuthenticatedHandler,
            jwtIsAboutToExpire,
            secondsBeforeTokenExpirationToCallReminder,
        );

        // Store the reference to JWT update callback (used by postMessage API saga).
        setJwtHandler = jwtAuthProvider.updateJwt;

        return wrapWithCustomSettings(backend.withAuthentication(jwtAuthProvider));
    }

    const handler = createNotAuthenticatedHandler(externalProviderId);
    return wrapWithCustomSettings(backend.withAuthentication(new ContextDeferredAuthProvider(handler)));
};

export let clearCache: () => void = () => {};
export let resetCatalogs: () => void = () => {};
export let explainExecDef: IExecutionDefinition;

const withExplainEventing = (backend: IAnalyticalBackend): IAnalyticalBackend =>
    withEventing(backend, {
        beforeExecute: (execDefinition) => {
            explainExecDef = execDefinition;
        },
    });

const decorateBackend = (backend: IAnalyticalBackend): IAnalyticalBackend => {
    return withExplainEventing(
        wrapWithSemanticCfSimulation(
            withCaching(backend, {
                ...RecommendedCachingConfiguration,
                onCacheReady: (callbacks) => {
                    clearCache = callbacks.resetAll;
                    resetCatalogs = callbacks.resetCatalogs;
                },
            }),
        ),
    );
};

const decorateWithNoAccessProxy = (backend: IAnalyticalBackend) =>
    new Proxy(backend, {
        get(target, prop, receiver) {
            // capabilities are OK to use, these are static — tiger is the only backend
            // and will not change when backend is re-initiated with new API token
            if (prop === "capabilities") {
                return Reflect.get(target, prop, receiver);
            }
            throw new Error("Backend API cannot be used as it was not yet initialized!");
        },
    });

// Optional compile-time global with a safe default: this file evaluates it at module scope, so
// without the guard every consumer bundling the runtime would have to DefinePlugin it or crash on
// chunk load. Builds that define it (the standalone/iframe AD app) fold this to the defined value.
const DEFAULT_TIGER_API_TOKEN: string | undefined =
    typeof TIGER_API_TOKEN === "undefined" ? undefined : TIGER_API_TOKEN;

export let backend: IAnalyticalBackend = decorateWithNoAccessProxy(
    decorateBackend(
        getBackendImplementation({ apiToken: DEFAULT_TIGER_API_TOKEN, apiTokenType: "gooddata" }),
    ),
);

export const reinitializeBackend = (
    apiToken: IApiToken = { apiToken: DEFAULT_TIGER_API_TOKEN, apiTokenType: "gooddata" },
    externalProviderId?: string,
) => {
    backend = decorateBackend(getBackendImplementation(apiToken, externalProviderId));
    isHostBackendAdopted = false;
};

/**
 * A host-owned backend the hosted-component AD adopts instead of building its own instance.
 * See adoptHostBackend.
 */
export interface IAdHostBackend {
    /**
     * The host's decorated backend instance. Its authentication provider and caching decorator
     * are the host's — AD adds only its own eventing decorator on top (explain support).
     */
    instance: IAnalyticalBackend;
    /** Resets ALL caches of the host's caching decorator; backs the clearCache ref. */
    resetAllCaches?: () => void;
    /** Resets the catalog cache of the host's caching decorator; backs the resetCatalogs ref. */
    resetCatalogs?: () => void;
}

export let isHostBackendAdopted = false;

/**
 * Makes AD run against the host's backend instance instead of creating its own — the
 * hosted-component counterpart of reinitializeBackend. The host's auth provider owns
 * authentication and token renewal (there is no AD-side provider to update, so the SetApiToken
 * handlers are cleared) and the host's cache is shared: AD's cache-invalidation refs are wired to
 * the host's callbacks, so e.g. a metric edit in AD also drops the host's stale executions.
 */
export const adoptHostBackend = (host: IAdHostBackend): void => {
    backend = withExplainEventing(wrapWithSemanticCfSimulation(host.instance));
    clearCache = host.resetAllCaches ?? (() => {});
    resetCatalogs = host.resetCatalogs ?? (() => {});
    setApiTokenHandler = undefined;
    setJwtHandler = undefined;
    isHostBackendAdopted = true;
};
