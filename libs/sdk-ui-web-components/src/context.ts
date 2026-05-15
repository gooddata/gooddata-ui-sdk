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
    currentContext = context;
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
