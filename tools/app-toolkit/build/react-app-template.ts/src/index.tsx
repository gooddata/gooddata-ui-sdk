// (C) 2019-2022 GoodData Corporation
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import "./index.css";

ReactDOM.render(<App />, document.getElementById("root"));
