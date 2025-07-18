// (C) 2022-2025 GoodData Corporation
import { BrowserRouter as Router, Route } from "react-router-dom";

import { WorkspaceProvider } from "../contexts/Workspace";

import ComponentResolver from "./ComponentResolver";

export default function AppRouter() {
    return (
        <div>
            <Router>
                <WorkspaceProvider>
                    <Route path="/" component={ComponentResolver} />
                </WorkspaceProvider>
            </Router>
        </div>
    );
}
