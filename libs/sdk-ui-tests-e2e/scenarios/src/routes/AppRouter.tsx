import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { WorkspaceProvider } from "../contexts/Workspace";

import Login from "./Login";

import styles from "./AppRouter.module.scss";
import { DashboardScenario } from "../components/Dashboard/Dashboard";

const AppRouter: React.FC = () => {
    return (
        <div className={styles.AppRouter}>
            <Router>
                <WorkspaceProvider>
                    <Route exact path="/dashboard" component={DashboardScenario} />
                    <Route exact path="/login" component={Login} />
                </WorkspaceProvider>
            </Router>
        </div>
    );
};

export default AppRouter;
