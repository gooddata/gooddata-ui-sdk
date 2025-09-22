// (C) 2020-2025 GoodData Corporation

import { useMemo } from "react";

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { createBackend } from "./backend";
import AppRouter from "./routes/AppRouter";

function App() {
    // only create the backend instance once
    const backend = useMemo(() => {
        return createBackend();
    }, []);

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={WORKSPACE_ID}>
                <AppRouter />
            </WorkspaceProvider>
        </BackendProvider>
    );
}

export default App;
