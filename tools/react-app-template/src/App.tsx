// (C) 2019-2023 GoodData Corporation
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
                    <h1>Hello GoodWorld!</h1>
                    <p>
                        Edit <code>/src/App.[[language]]x</code> to get started. Learn more about this
                        template in <code>README.md</code>.
                    </p>
                    <pre>
                        <code>
                            &lt;InsightView insight=&#123;Md.Insights.ProductCategoriesPieChart&#125; /&gt;
                        </code>
                    </pre>
                    <figure>
                        <InsightView insight={Md.Insights.ProductCategoriesPieChart} showTitle />
                    </figure>
                    <footer>
                        <img src={img} alt="" />
                        <a
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
