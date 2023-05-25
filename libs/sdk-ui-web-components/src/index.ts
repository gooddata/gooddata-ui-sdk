// (C) 2022 GoodData Corporation
/**
 * This module registers GoodData's Custom Elements for Dashboard and Insight embedding.
 *
 * @remarks
 * The package registers two custom elements with the browser:
 *  - <gd-dashboard> to embed a complete dashboard into your webpage
 *  - <gd-insight> to embed a single insight into your webpage
 *
 * @packageDocumentation
 */

import { CustomElementContext, getContext, setContext } from "./context.js";
import { Insight } from "./visualizations/Insight.js";
import { Dashboard } from "./visualizations/Dashboard.js";
import initializeAutoAuth from "./autoAuth.js";

// Include styles async to use native link injection from MiniCssExtractPlugin
import("./visualizations/components.css").catch((error) => {
    console.error("Failed to load analytics styles", error);
});

initializeAutoAuth(import.meta.url).catch((error) => {
    console.error("Failed to configure automatic authentication flow", error);
});

// Register custom elements with the browser
window.customElements.define("gd-insight", Insight);
window.customElements.define("gd-dashboard", Dashboard);

// Expose context accessors in case user wants to configure custom
//  authentication flow
export { getContext, setContext, CustomElementContext };
