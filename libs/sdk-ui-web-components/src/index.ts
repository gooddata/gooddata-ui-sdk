// (C) 2022-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * This module registers GoodData's Custom Elements for Dashboard and Insight embedding.
 *
 * @remarks
 * The package registers custom elements with the browser:
 *  - <gd-dashboard-embed> as the recommended dashboard embed runtime for new integrations
 *  - <gd-insight-embed> as the recommended insight embed runtime for new integrations
 *  - <gd-dashboard> as the legacy dashboard runtime kept for existing integrations
 *  - <gd-insight> as the legacy insight runtime kept for existing integrations
 *
 * @packageDocumentation
 */

declare let __webpack_public_path__: string;

const w = window as any;
if (window && typeof w.__GD_ASSET_PATH__ === "string") {
    __webpack_public_path__ = w.__GD_ASSET_PATH__;
}

// oxlint-disable-next-line import/no-unassigned-import
import "./autoAuth.js";
import { type CustomElementContext, getContext, setContext } from "./context.js";
import { GenAIAssistant } from "./gen-ai/GenAiAssistant.js";
import { GenAIConversations } from "./gen-ai/GenAiConversations.js";
import { GenAiProvider } from "./gen-ai/GenAiProvider.js";
import { defineCustomElement } from "./utils.js";
import { Dashboard } from "./visualizations/Dashboard.js";
import { DashboardEmbed } from "./visualizations/DashboardEmbed.js";
import { Insight } from "./visualizations/Insight.js";
import { InsightEmbed } from "./visualizations/InsightEmbed.js";
// Include styles async to use native link injection from MiniCssExtractPlugin
// oxlint-disable-next-line import/no-unassigned-import
import "./visualizations/components.css";
// oxlint-disable-next-line import/no-unassigned-import
import "./gen-ai/components.css";

const GEN_AI_CHAT_CONSTRUCTOR = Symbol.for("gd.sdk-ui-web-components.genAiChatConstructor");

function getGenAIChatConstructor() {
    const globalWindow = window as typeof window & {
        [GEN_AI_CHAT_CONSTRUCTOR]?: CustomElementConstructor;
    };

    if (!globalWindow[GEN_AI_CHAT_CONSTRUCTOR]) {
        class GenAIChat extends GenAIAssistant {}
        globalWindow[GEN_AI_CHAT_CONSTRUCTOR] = GenAIChat;
    }

    return globalWindow[GEN_AI_CHAT_CONSTRUCTOR];
}

// Register custom elements with the browser
defineCustomElement("gd-insight", Insight);
defineCustomElement("gd-dashboard", Dashboard);
defineCustomElement("gd-insight-embed", InsightEmbed);
defineCustomElement("gd-dashboard-embed", DashboardEmbed);
defineCustomElement("gd-ai-assistant", GenAIAssistant);
defineCustomElement("gd-ai-chat", getGenAIChatConstructor());
defineCustomElement("gd-ai-conversations", GenAIConversations);
defineCustomElement("gd-ai-provider", GenAiProvider);

// Expose context accessors in case user wants to configure custom
//  authentication flow
export type { CustomElementContext };
export { getContext, setContext };
