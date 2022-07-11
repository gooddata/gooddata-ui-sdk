// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

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
};

let contextPromiseResolve: (context: CustomElementContext) => void;
let contextPromiseResolved = false;
const contextPromise: Promise<CustomElementContext> = new Promise((resolve) => {
    contextPromiseResolve = resolve;
});

/**
 * A setter function for a singleton context.
 *
 * @public
 */
export const setContext = (context: CustomElementContext) => {
    if (contextPromiseResolved) {
        throw new Error("Context is already set.");
    }

    contextPromiseResolved = true;
    contextPromiseResolve(context);
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
    return contextPromise;
};
