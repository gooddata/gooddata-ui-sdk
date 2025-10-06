// (C) 2022-2025 GoodData Corporation

/**
 * This file does not export and only configures the mock backend with Web Components,
 * as a side effect. Backend only has to be defined once per runtime.
 */

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { ReferenceWorkspaceId, StorybookBackend } from "./backend.js";

let isBackendSet = false;

const configureWebComponentsBackend = (
    backend: IAnalyticalBackend,
    workspaceId: string,
    doneCallback: () => void,
) => {
    if (isBackendSet) {
        doneCallback();
        return;
    }
    // preview-head.html loads after this file.
    // I.e. by the time this runs the global variables is not set yet
    const configureBackend = () => {
        if (typeof window.__setWebComponentsContext !== "undefined") {
            try {
                window.__setWebComponentsContext({
                    backend: backend,
                    workspaceId: workspaceId,
                });
            } catch {
                // setContext will throw if the context was already set...
                clearInterval(checkInt);
            }

            isBackendSet = true;
            doneCallback();

            clearInterval(checkInt);
        }
    };

    const checkInt = setInterval(configureBackend, 100);
};

export const setWebComponentsContext = (doneCallback: () => void) => {
    // Configure the mock backend
    configureWebComponentsBackend(StorybookBackend(), ReferenceWorkspaceId, doneCallback);
};
