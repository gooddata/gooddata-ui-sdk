// (C) 2022 GoodData Corporation
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import { AppProviders } from "./contexts";

import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

ReactDOM.render(
    <AppProviders>
        <App />
    </AppProviders>,
    document.getElementById("root"),
);
