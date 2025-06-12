// (C) 2022 GoodData Corporation
/**
 * This file does not export and only configures the mock backend with Web Components,
 * as a side effect. Backend only has to be defined once per runtime.
 */

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { StorybookBackend, ReferenceWorkspaceId } from "./backend.js";

const configureWebComponentsBackend = (backend: IAnalyticalBackend, workspaceId: string) => {
    // preview-head.html loads after this file.
    // I.e. by the time this runs the global variables is not set yet
    const configureBackend = () => {
        if (typeof window.__setWebComponentsContext !== "undefined") {
            try {
                window.__setWebComponentsContext({
                    backend: backend,
                    workspaceId: workspaceId,
                });
            } catch (e) {
                // setContext will throw if the context was already set...
                clearInterval(checkInt);
            }
            clearInterval(checkInt);
        }
    };

    const checkInt = setInterval(configureBackend, 100);
};

// Configure the mock backend
configureWebComponentsBackend(StorybookBackend(), ReferenceWorkspaceId);
