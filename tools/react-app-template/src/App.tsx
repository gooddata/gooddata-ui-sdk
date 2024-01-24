// (C) 2019-2024 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { backend } from "./backend.js";
import * as Md from "./catalog.js";
import img from "./assets/gooddata-logo.svg";

// Workspace ID is injected by WebPack based on the value in package.json
const workspaceId = WORKSPACE_ID;

export const App: React.FC = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspaceId}>
                <div className="app">
                    <h1 className="app-title">Hello GoodWorld!</h1>
                    <p className="app-paragraph">
                        Edit <code className="app-code">/src/App.[[language]]x</code> to get started. Learn
                        more about this template in <code className="app-code">README.md</code>.
                    </p>
                    <pre className="app-preformatted">
                        <code className="app-code">
                            &lt;InsightView insight=&#123;Md.Insights.ProductCategoriesPieChart&#125; /&gt;
                        </code>
                    </pre>
                    <figure className="app-figure">
                        <InsightView insight={Md.Insights.ProductCategoriesPieChart} showTitle />
                    </figure>
                    <footer className="app-footer">
                        <img src={img} alt="" />
                        <a
                            className="app-link"
                            target="_blank"
                            rel="noreferrer"
                            href="https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html"
                        >
                            GoodData.UI docs
                        </a>
                    </footer>
                </div>
            </WorkspaceProvider>
        </BackendProvider>
    );
};
