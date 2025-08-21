// (C) 2019-2025 GoodData Corporation
import React from "react";

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { App } from "./App.js";
import { backend, hasCredentialsSetup, needsAuthentication } from "./backend.js";

export const Root = () => {
    if (!hasCredentialsSetup() && needsAuthentication()) {
        return (
            <div>
                The environment is not setup with credentials to use for authentication to Analytical Backend.
                Please see the .env.secrets file or the README.md in the root of your plugin project to learn
                how to set up your environment.
            </div>
        );
    }

    if (!process.env.WORKSPACE || !process.env.DASHBOARD_ID || !process.env.BACKEND_URL) {
        return (
            <div>
                The environment is not setup with WORKSPACE or DASHBOARD_ID or BACKEND_URL. Please see the
                .env file or the README.md in the root of your plugin project to learn how to set up your
                environment.
            </div>
        );
    }

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={process.env.WORKSPACE!}>
                <App />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
