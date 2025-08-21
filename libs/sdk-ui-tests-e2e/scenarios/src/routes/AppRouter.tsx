// (C) 2022-2025 GoodData Corporation
import React from "react";

import { Route, BrowserRouter as Router } from "react-router-dom";

import ComponentResolver from "./ComponentResolver";
import { WorkspaceProvider } from "../contexts/Workspace";

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
