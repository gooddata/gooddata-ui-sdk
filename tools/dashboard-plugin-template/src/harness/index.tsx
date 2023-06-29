// (C) 2019-2022 GoodData Corporation
import React from "react";
import { createRoot } from "react-dom/client";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Root } from "./Root.js";

const rootDOMNode = document.getElementById("root");
const root = createRoot(rootDOMNode!);

root.render(<Root />);
