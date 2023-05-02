// (C) 2019-2022 GoodData Corporation
import "@babel/polyfill";
import React from "react";
import { createRoot } from "react-dom/client";

import "react-datepicker/dist/react-datepicker.css";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { App } from "./App";
import "./react-ga";

const rootDOMNode = document.createElement("div");
rootDOMNode.className = "root";
document.body.appendChild(rootDOMNode);

const root = createRoot(rootDOMNode);
root.render(<App />);
