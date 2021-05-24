// (C) 2019-2021 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend } from "./backend";
import { App } from "./App";

export const Root: React.FC = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <App />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
