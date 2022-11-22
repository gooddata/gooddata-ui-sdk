// (C) 2019-2023 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

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

ReactDOM.render(<App />, document.getElementById("root"));
