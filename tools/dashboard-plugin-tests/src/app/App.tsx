// (C) 2019-2022 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider, ErrorComponent } from "@gooddata/sdk-ui";
import { idRef } from "@gooddata/sdk-model";
import { PluginLoader } from "./PluginLoader";
import { createBackend } from "./backend";
import { LOCAL_PLUGINS_CONFIG } from "../plugins";

const backend = createBackend(LOCAL_PLUGINS_CONFIG);

export const App: React.FC = () => {
    const hash = window.location.hash;
    const dashboardId = hash.replace("#", "");

    if (!hash) {
        return <ErrorComponent message="Please specify dashboard id" />;
    }

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE}>
                <PluginLoader dashboardRef={idRef(dashboardId)} />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
