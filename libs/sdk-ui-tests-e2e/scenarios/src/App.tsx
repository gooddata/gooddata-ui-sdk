// (C) 2020-2025 GoodData Corporation
import React from "react";

import { createRoot } from "react-dom/client";

import { BackendProvider } from "@gooddata/sdk-ui";
import { provideCreateRoot } from "@gooddata/sdk-ui-ext";

import { useAuth } from "./contexts/Auth";
import { WorkspaceListProvider } from "./contexts/WorkspaceList";
import AppRouter from "./routes/AppRouter";

// provide React18 root API for visualization rendering
provideCreateRoot(createRoot);

function App() {
    const { backend } = useAuth();

    return (
        <BackendProvider backend={backend}>
            <WorkspaceListProvider>
                <AppRouter />
            </WorkspaceListProvider>
        </BackendProvider>
    );
}

export default App;
