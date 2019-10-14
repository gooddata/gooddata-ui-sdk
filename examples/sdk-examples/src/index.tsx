// (C) 2019 GoodData Corporation
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import "@gooddata/goodstrap/lib/styles.scss";

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
