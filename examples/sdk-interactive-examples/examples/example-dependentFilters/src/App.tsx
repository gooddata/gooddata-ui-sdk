// (C) 2019-2023 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { backend } from "./backend.js";
import Example from "./example/Example.js";

// Workspace ID is injected by bundler based on the value in package.json
const workspaceId = WORKSPACE_ID;

export const App: React.FC = () => {
    // backend.config
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspaceId}>
                <div className="app">
                    <Example />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
