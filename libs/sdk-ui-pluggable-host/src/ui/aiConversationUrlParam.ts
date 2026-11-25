// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { AI_CONVERSATION_URL_PARAM, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

let isConsumedOnThisPage = false;

/**
 * Whether the page may open the host chat from {@link AI_CONVERSATION_URL_PARAM}.
 *
 * @remarks
 * An iframe embedder controls the chat entry points of its page, so a link into the iframe does not
 * open the chat. An export renders a static page, so it never opens the chat.
 */
export function canOpenChatFromUrl(
    showChat: boolean,
    ctx: Pick<IPlatformContext, "embeddingMode" | "isExportMode">,
    isAppEmbedded: boolean | undefined,
): boolean {
    return showChat && !ctx.isExportMode && ctx.embeddingMode !== "iframe" && !isAppEmbedded;
}

export function readAiConversationParam(search: string): string | undefined {
    return new URLSearchParams(search).get(AI_CONVERSATION_URL_PARAM) || undefined;
}

export function removeAiConversationParam(): void {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(AI_CONVERSATION_URL_PARAM)) {
        return;
    }
    url.searchParams.delete(AI_CONVERSATION_URL_PARAM);
    // Keep the router state, so that the application router does not see a new history entry.
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Opens the host chat on the conversation that the page URL names in {@link AI_CONVERSATION_URL_PARAM}.
 *
 * @remarks
 * Acts at most once per page load, at the first render where `isEnabled` is true, and then removes the
 * parameter from the URL so that a reload or a shared link does not open the conversation again.
 */
export function useOpenChatFromUrl(isEnabled: boolean, openConversation: (conversationId: string) => void) {
    useEffect(() => {
        if (!isEnabled || isConsumedOnThisPage) {
            return;
        }
        const conversationId = readAiConversationParam(window.location.search);
        if (!conversationId) {
            return;
        }
        isConsumedOnThisPage = true;
        removeAiConversationParam();
        openConversation(conversationId);
    }, [isEnabled, openConversation]);
}
