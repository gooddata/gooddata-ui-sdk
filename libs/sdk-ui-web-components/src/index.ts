// (C) 2022-2025 GoodData Corporation
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

declare let __webpack_public_path__: string;

const w = window as any;
if (window && typeof w.__GD_ASSET_PATH__ === "string") {
    __webpack_public_path__ = w.__GD_ASSET_PATH__;
}

import initializeAutoAuth from "./autoAuth.js";
import { CustomElementContext, getContext, setContext } from "./context.js";
import { GenAIAssistant } from "./gen-ai/GenAiAssistant.js";
import { Dashboard } from "./visualizations/Dashboard.js";
import { Insight } from "./visualizations/Insight.js";

// Include styles async to use native link injection from MiniCssExtractPlugin
import("./visualizations/components.css").catch((error) => {
    console.error("Failed to load analytics styles", error);
});
import("./gen-ai/components.css").catch((error) => {
    console.error("Failed to load ai chat styles", error);
});

initializeAutoAuth(import.meta.url).catch((error) => {
    console.error("Failed to configure automatic authentication flow", error);
});

// Register custom elements with the browser
window.customElements.define("gd-insight", Insight);
window.customElements.define("gd-dashboard", Dashboard);
window.customElements.define("gd-ai-assistant", GenAIAssistant);

class GenAIChat extends GenAIAssistant {}
window.customElements.define("gd-ai-chat", GenAIChat);

// Expose context accessors in case user wants to configure custom
//  authentication flow
export type { CustomElementContext };
export { getContext, setContext };
