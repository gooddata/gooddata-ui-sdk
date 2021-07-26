import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { WorkspaceProvider } from "../contexts/Workspace";

import styles from "./AppRouter.module.scss";
import Home from "./Home";

const AppRouter: React.FC = () => {
    return (
        <div className={styles.AppRouter}>
            <Router>
                <WorkspaceProvider>
                    <Route path="/" component={Home} />
                </WorkspaceProvider>
            </Router>
        </div>
    );
};

export default AppRouter;
