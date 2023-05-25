// (C) 2019-2022 GoodData Corporation
// this line is to avoid the TS2580 error. We do have the required dependencies but the error still happens.
declare const require: any;
if (process.env.WDYR === "true") {
    // we do not want to fetch this dependency while the functionality is disabled
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
        include: [/WithLoading/],
    });
}
import "@babel/polyfill";
import React from "react";
import { createRoot } from "react-dom/client";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { App } from "./App.js";

const rootDOMNode = document.createElement("div");
rootDOMNode.className = "root";
document.body.appendChild(rootDOMNode);

const root = createRoot(rootDOMNode);
root.render(<App />);
