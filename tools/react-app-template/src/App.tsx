// (C) 2019-2023 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { backend } from "./backend";
import logo from "./assets/gooddata-logo.svg";
import * as Md from "./catalog";

export const App: React.FC = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="demo">
                <div className="container">
                    <div className="header">
                        <div className="logo">
                            <Link className="logo-link" href="https://sdk.gooddata.com/gooddata-ui">
                                <img alt="GoodData logo" className="logo-link-image" src={logo} />
                                <h1 className="logo-link-title">GoodData.UI</h1>
                            </Link>
                        </div>
                        <div className="navigation">
                            <Link href="https://sdk.gooddata.com/gooddata-ui">📚 Official documentation</Link>
                            <Link href="https://sdk.gooddata.com/gooddata-ui/docs/quickstart.html">
                                🚀 Getting started
                            </Link>
                            <Link href="https://gdui-examples.herokuapp.com/">📊 Examples Gallery</Link>
                            <Link href="https://sdk.gooddata.com/gooddata-ui-apidocs/">⚙️ API reference</Link>
                        </div>
                    </div>
                    <div className="content">
                        {/* Embed a GoodData dashboard into the application */}
                        <Dashboard dashboard={Md.Dashboards._1Overview} />
                    </div>
                    <div className="footer">
                        Powered by <Link href="https://sdk.gooddata.com/gooddata-ui">GoodData.UI</Link>
                    </div>
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
};

const Link: React.FC<{ className?: string; href: string }> = ({ className, href, children }) => (
    <a href={href} className={className ?? "navigation-link"} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);
