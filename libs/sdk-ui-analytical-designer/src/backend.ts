// (C) 2020-2026 GoodData Corporation

import { withEventing } from "@gooddata/sdk-backend-base";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { tigerFactory } from "@gooddata/sdk-backend-tiger";
import { type IExecutionDefinition } from "@gooddata/sdk-model";

import { IS_DEBUG } from "./buildParams.js";
import { withSemanticCfSimulation } from "./semanticCfSimulation.js";

const hasWindow = typeof window !== "undefined";

const noop = () => {};

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

// Renews the JWT of the host backend's auth provider in place (SetApiToken command); undefined
// when the host renews its provider itself.
export let setJwtHandler: IAdHostBackend["setJwt"] = undefined;

// Renews the API token of the host backend's auth provider in place (SetApiToken command);
// undefined when the host renews its provider itself.
export let setApiTokenHandler: IAdHostBackend["setApiToken"] = undefined;

export let clearCache: () => void = noop;
export let resetCatalogs: () => void = noop;
export let explainExecDef: IExecutionDefinition;

const withExplainEventing = (backend: IAnalyticalBackend): IAnalyticalBackend =>
    withEventing(backend, {
        beforeExecute: (execDefinition) => {
            explainExecDef = execDefinition;
        },
    });

/**
 * The backend before a host backend is adopted. Only the capabilities are readable: they are
 * static, tiger is the only backend. Any other access throws, so a request made before the
 * adoption fails loudly instead of running unauthenticated.
 */
const createUninitializedBackend = (): IAnalyticalBackend =>
    new Proxy(tigerFactory(), {
        get(target, prop, receiver) {
            if (prop === "capabilities") {
                return Reflect.get(target, prop, receiver);
            }
            throw new Error("Backend API cannot be used as it was not yet initialized!");
        },
    });

export let backend: IAnalyticalBackend = createUninitializedBackend();

/**
 * The backend of the host application AD runs against. See adoptHostBackend.
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
    /**
     * Applies an API token the SetApiToken command delivers: the first token as well as a renewal.
     * The host renews its auth provider in place or switches its backend to the token, and adopts
     * the new instance again when it did. Omit when the host handles the command itself, AD then
     * only records the token.
     */
    setApiToken?: (token: string) => void;
    /** The JWT counterpart of setApiToken. */
    setJwt?: (jwt: string, secondsBeforeTokenExpirationToCallReminder?: number) => void;
}

/**
 * Makes AD run against the host's backend instance; AD never builds a backend of its own. The
 * host's auth provider owns authentication. AD's cache-invalidation refs are wired to the host's
 * callbacks, so when the host passes the instance it runs on itself (AnalyticalDesignerInternal,
 * the dashboards), a metric edit in AD also drops the host's stale executions. The pluggable
 * module builds AD a backend of its own from the host auth, so there the resets stay with that
 * instance. The token renewals AD receives (SetApiToken) go to the host's setters when given.
 */
export const adoptHostBackend = (host: IAdHostBackend): void => {
    backend = withExplainEventing(wrapWithSemanticCfSimulation(host.instance));
    clearCache = host.resetAllCaches ?? noop;
    resetCatalogs = host.resetCatalogs ?? noop;
    setApiTokenHandler = host.setApiToken;
    setJwtHandler = host.setJwt;
};

/** Drops the adopted host backend; the backend is uninitialized again until the next adoption. */
export const resetBackend = (): void => {
    backend = createUninitializedBackend();
    clearCache = noop;
    resetCatalogs = noop;
    setApiTokenHandler = undefined;
    setJwtHandler = undefined;
};
