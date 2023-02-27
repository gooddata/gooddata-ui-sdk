// (C) 2019-2023 GoodData Corporation
import React from "react";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";

import { backend } from "./backend";
import * as Md from "./catalog";
import img from "./assets/gooddata-logo.svg";

export const App: React.FC = () => {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="demo">
                <div className="app">
                    <h1>Hello GoodWorld!</h1>
                    <p>
                        Edit <code>/src/App.tsx</code> to get started. Learn more about this template in{" "}
                        <a
                            target="_blank"
                            href="https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/react-app-template/README.md"
                        >
                            Readme
                        </a>
                        .
                    </p>
                    <pre>
                        <code>
                            &lt;InsightView insight=&#123;Md.Insights.ProductCategoriesPieChart&#125; /&gt;
                        </code>
                    </pre>
                    <figure>
                        <InsightView insight={Md.Insights.Top10Customers} showTitle />
                    </figure>
                    <footer>
                        <img src={img} alt="" />
                        <a
                            target="_blank"
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
