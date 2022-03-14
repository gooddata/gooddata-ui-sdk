// (C) 2019-2022 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { idRef } from "@gooddata/sdk-model";

import { DashboardLoader } from "./DashboardLoader";
import { createBackend } from "./backend";
import { getDashboardPluginTestConfig } from "./setup";

const testConfig = getDashboardPluginTestConfig(window);

// Get config from test
const backend = createBackend(testConfig);

/**
 * @internal
 */
export const App: React.FC = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <DashboardLoader dashboardRef={idRef(testConfig.dashboardId)} />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
