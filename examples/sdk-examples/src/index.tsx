// (C) 2019 GoodData Corporation
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";

import "@gooddata/goodstrap/lib/styles.scss";
import "react-datepicker/dist/react-datepicker.css";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";

import { App } from "./App";
import { AppProviders } from "./context";

const root = document.createElement("div");
root.className = "root";
document.body.appendChild(root);
ReactDOM.render(
    <AppProviders>
        <App />
    </AppProviders>,
    root,
);
