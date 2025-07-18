// (C) 2019-2025 GoodData Corporation
import { createRoot } from "react-dom/client";

import "@gooddata/sdk-ui-filters/styles/scss/main.scss";
import "@gooddata/sdk-ui-charts/styles/scss/main.scss";
import "@gooddata/sdk-ui-geo/styles/scss/main.scss";
import "@gooddata/sdk-ui-pivot/styles/scss/main.scss";
import "@gooddata/sdk-ui-kit/styles/scss/main.scss";
import "@gooddata/sdk-ui-ext/styles/scss/main.scss";
import "@gooddata/sdk-ui-dashboard/styles/scss/main.scss";
import "@gooddata/sdk-ui-semantic-search/styles/scss/internal.scss";
import "@gooddata/sdk-ui-gen-ai/styles/scss/main.scss";

import { App } from "./App.js";

const rootDOMNode = document.createElement("div");
rootDOMNode.className = "root";
rootDOMNode.style.height = "100%";
document.body.appendChild(rootDOMNode);

const root = createRoot(rootDOMNode);
root.render(<App />);
