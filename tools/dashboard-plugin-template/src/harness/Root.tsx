// (C) 2019-2022 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend, hasCredentialsSetup, needsAuthentication } from "./backend.js";
import { App } from "./App.js";
import { DEFAULT_WORKSPACE } from "./constants.js";

export const Root: React.FC = () => {
    if (!hasCredentialsSetup() && needsAuthentication()) {
        return (
            <div>
                The environment is not setup with credentials to use for authentication to Analytical Backend.
                Please see the .env.secrets file or the README.md in the root of your plugin project to learn
                how to set up your environment.
            </div>
        );
    }

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={process.env.WORKSPACE || DEFAULT_WORKSPACE}>
                <App />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
