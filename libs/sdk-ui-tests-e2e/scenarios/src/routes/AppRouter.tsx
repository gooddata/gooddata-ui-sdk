// (C) 2022-2025 GoodData Corporation

import { Route, BrowserRouter as Router } from "react-router-dom";

import ComponentResolver from "./ComponentResolver";

export default function AppRouter() {
    return (
        <div>
            <Router>
                <Route path="/" component={ComponentResolver} />
            </Router>
        </div>
    );
}
