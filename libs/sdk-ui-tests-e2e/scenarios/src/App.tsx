// (C) 2020-2025 GoodData Corporation

import { BackendProvider } from "@gooddata/sdk-ui";

import { useAuth } from "./contexts/Auth";
import { WorkspaceListProvider } from "./contexts/WorkspaceList";
import AppRouter from "./routes/AppRouter";

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
