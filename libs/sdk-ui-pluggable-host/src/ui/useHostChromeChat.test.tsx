// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { type IGenAIChatProps } from "./GenAIChat.js";
import { type IHostChromeChat } from "./useHostChromeChat.js";
import { type IHostChromeWorkspaceFeatures } from "./useHostChromeWorkspaceFeatures.js";

vi.mock("@gooddata/sdk-ui-gen-ai", () => ({
    useGenAiChatAvailability: () => true,
}));

vi.mock("../platformContext/backend.js", () => ({
    getBackend: () => ({}),
}));

vi.mock("./GenAIChat.js", () => ({
    GenAIChat: () => null,
}));

vi.resetModules();
const { useHostChromeChat } = await import("./useHostChromeChat.js");

const features: IHostChromeWorkspaceFeatures = {
    isWorkspaceApp: true,
    workspaceId: "workspace-1",
    settings: {} as IPlatformContext["settings"],
    canUseAiAssistant: true,
    canManageProject: true,
    canAnalyzeWorkspace: true,
    canAccessWorkbench: false,
    canFullControl: false,
    showSearch: false,
    showChat: true,
};

const ctx = { workspaceSettings: {} } as IPlatformContext;
const userContext: IGenAIUserContext = {
    view: { dashboard: { ref: idRef("dashboard-1"), title: "Dashboard", widgets: [] } },
};

function chatProps(chat: IHostChromeChat): IGenAIChatProps {
    return (chat.element as ReactElement<IGenAIChatProps>).props;
}

function useChat() {
    return useHostChromeChat({
        features,
        ctx,
        telemetry: undefined,
        publisherDocumentSaved: undefined,
        dashboardSaved: undefined,
    });
}

describe("useHostChromeChat conversation selection", () => {
    it("does not select a conversation on a normal open", () => {
        const { result } = renderHook(useChat);

        act(() => result.current.open());

        expect(chatProps(result.current)).toMatchObject({
            open: true,
            conversationId: undefined,
            askSeq: 0,
        });
    });

    it("forwards the conversation ID and clears a previous seeded question and context", () => {
        const { result } = renderHook(useChat);
        act(() => result.current.askAiAssistant("Summarize", "agent-1", userContext, true, true, "HIGH"));

        act(() => result.current.openAiAssistant(undefined, undefined, undefined, "conversation-1"));

        expect(chatProps(result.current)).toMatchObject({
            open: true,
            conversationId: "conversation-1",
            askedQuestion: null,
            userContext: undefined,
            agentId: undefined,
            effort: undefined,
            appendToChat: false,
            replaceUserContext: false,
            askSeq: 2,
        });
    });

    it("increments the request token on repeated selection but not rerenders or ordinary reopen", () => {
        const { result, rerender } = renderHook(useChat);
        act(() => result.current.openAiAssistant(undefined, undefined, undefined, "conversation-1"));
        expect(chatProps(result.current).askSeq).toBe(1);

        rerender();
        act(() => result.current.close());
        act(() => result.current.open());
        expect(chatProps(result.current)).toMatchObject({ conversationId: "conversation-1", askSeq: 1 });

        act(() => result.current.openAiAssistant(undefined, undefined, undefined, "conversation-1"));
        expect(chatProps(result.current)).toMatchObject({ conversationId: "conversation-1", askSeq: 2 });
    });

    it("clears conversation selection when a new question is asked", () => {
        const { result } = renderHook(useChat);
        act(() => result.current.openAiAssistant(undefined, undefined, undefined, "conversation-1"));

        act(() => result.current.askAiAssistant("Summarize", "agent-1", userContext));

        expect(chatProps(result.current)).toMatchObject({
            conversationId: undefined,
            askedQuestion: "Summarize",
            agentId: "agent-1",
            userContext,
            askSeq: 2,
        });
    });

    it("clears conversation selection when opening with context instead", () => {
        const { result } = renderHook(useChat);
        act(() => result.current.openAiAssistant(undefined, undefined, undefined, "conversation-1"));

        act(() => result.current.openAiAssistant(userContext, true, "agent-1"));

        expect(chatProps(result.current)).toMatchObject({
            conversationId: undefined,
            userContext,
            replaceUserContext: true,
            agentId: "agent-1",
            askSeq: 2,
        });
    });
});
