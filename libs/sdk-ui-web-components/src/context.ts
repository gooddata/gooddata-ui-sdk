// (C) 2022-2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * A context for the custom element is parsed out of script URL and includes
 * backend (with authentication) and workspaceId. It's moved to context to make
 * the setup easier.
 *
 * @public
 */
export type CustomElementContext = {
    backend: IAnalyticalBackend;
    workspaceId?: string;
    mapboxToken?: string;
    agGridToken?: string;
};

/**
 * @public
 */
export type Stores = {
    stores?: Record<string, Promise<any>>;
};

const stores: Stores = {};
let contextPromiseResolve: (context: CustomElementContext) => void;
let currentContext: CustomElementContext | undefined;
const contextPromise: Promise<CustomElementContext> = new Promise((resolve) => {
    contextPromiseResolve = resolve;
});

/**
 * A setter function for the default runtime context snapshot.
 *
 * @public
 */
export const setContext = (context: CustomElementContext) => {
    currentContext = { ...currentContext, ...context };
    contextPromiseResolve(context);
};

/**
 * A getter for the latest context snapshot.
 *
 * @public
 */
export const getContextSnapshot = (): CustomElementContext | undefined => {
    return currentContext;
};

/**
 * A getter for the context.
 * You can call this function even before the context is actually set,
 * the returned promise will resolve once the context is either set automatically
 * based on the URL or manually by user.
 *
 * @public
 */
export const getContext = (): Promise<CustomElementContext> => {
    return currentContext ? Promise.resolve(currentContext) : contextPromise;
};

/**
 * @public
 */
export interface IPromiseWithResolver<T> extends Promise<T> {
    resolve: (value: T) => void;
}

/**
 * A setter function for setting a store in the context.
 *
 * @public
 */
export const setStore = <T>(store: string, data: IPromiseWithResolver<T>) => {
    stores.stores = { ...stores.stores, [store]: data };
};

/**
 * A getter for a store in the context.
 *
 * @public
 */
export const getStore = <T>(store: string): IPromiseWithResolver<T> | undefined => {
    return stores?.stores?.[store] as IPromiseWithResolver<T> | undefined;
};
