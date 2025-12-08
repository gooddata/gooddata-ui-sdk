// (C) 2024-2025 GoodData Corporation

import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { backend } from "./backend.js";
import { Example } from "./example/Example.js";

// Workspace ID is injected by bundler based on the value in package.json
const workspaceId = WORKSPACE_ID;

export function App() {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspaceId}>
                <div className="app">
                    <Example />
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
