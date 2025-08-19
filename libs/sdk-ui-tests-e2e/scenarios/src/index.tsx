// (C) 2022-2025 GoodData Corporation
import React from "react";

import { createRoot } from "react-dom/client";

// eslint-disable-next-line import/no-extraneous-dependencies
import "core-js/stable";
import { provideCreateRoot } from "@gooddata/sdk-ui-ext";

import App from "./App";
import { AppProviders } from "./contexts";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

// provide React18 root API for visualization rendering
provideCreateRoot(createRoot);

const rootDOMNode = document.getElementById("root");
const root = createRoot(rootDOMNode!);

root.render(
    <AppProviders>
        <App />
    </AppProviders>,
);
