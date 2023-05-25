// (C) 2019-2023 GoodData Corporation
import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

// Include GoodData styles, needed for correct visualizations rendering
// You may exclude some file if you're not planning to use all visualizations
// For example, you can exclude sdk-ui-geo styles if you're not planning to use PushPin GeoChart
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-geo/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import "./index.css";

const rootDOMNode = document.getElementById("root");
const root = createRoot(rootDOMNode!);

root.render(<App />);
