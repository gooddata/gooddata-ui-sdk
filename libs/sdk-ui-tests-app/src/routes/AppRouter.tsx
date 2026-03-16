// (C) 2022-2026 GoodData Corporation

import { Route, BrowserRouter as Router } from "react-router-dom";

import { ComponentResolver } from "./ComponentResolver";

export function AppRouter() {
    return (
        <div>
            <Router>
                <Route path="/" component={ComponentResolver} />
            </Router>
        </div>
    );
}
