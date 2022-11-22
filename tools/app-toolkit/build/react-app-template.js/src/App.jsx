// (C) 2019-2022 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { backend } from "./backend";
import { workspace } from "./constants";
import logo from "./assets/gooddata-logo.svg";
import * as Md from "./md/full";

const Content = () => {
    return (
        <div className="container">
            <div className="header">
                <div className="logo">
                    <a className="logo-link" href="https://sdk.gooddata.com/gooddata-ui">
                        <img className="logo-link-image" src={logo} />
                        <h1 className="logo-link-title">GoodData.UI</h1>
                    </a>
                </div>
                <div className="navigation">
                    <a className="navigation-link" href="https://sdk.gooddata.com/gooddata-ui" target="blank">
                        📚 Official documentation
                    </a>
                    <a
                        className="navigation-link"
                        href="https://sdk.gooddata.com/gooddata-ui/docs/quickstart.html"
                        target="blank"
                    >
                        🚀 Getting started
                    </a>
                    <a className="navigation-link" href="https://gdui-examples.herokuapp.com/" target="blank">
                        📊 Examples Gallery
                    </a>
                    <a
                        className="navigation-link"
                        href="https://sdk.gooddata.com/gooddata-ui-apidocs/"
                        target="blank"
                    >
                        ⚙️ API reference
                    </a>
                </div>
            </div>
            <div className="content">
                <Dashboard dashboard={Md.Dashboards.DashboardEmbedding} />
            </div>
            <div className="footer">
                Powered by{" "}
                <a href="https://sdk.gooddata.com/gooddata-ui" target="_blank" rel="noopener noreferrer">
                    GoodData.UI
                </a>
            </div>
        </div>
    );
};

export const App = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <Content />
            </WorkspaceProvider>
        </BackendProvider>
    );
};
