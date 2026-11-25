// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AI_CONVERSATION_URL_PARAM } from "@gooddata/sdk-pluggable-application-model";

async function loadModule() {
    // The "once per page load" state is module-level, so each test gets a fresh copy.
    vi.resetModules();
    return import("./aiConversationUrlParam.js");
}

function setUrl(url: string) {
    window.history.replaceState({ idx: 3 }, "", url);
}

afterEach(() => {
    setUrl("/");
});

describe("canOpenChatFromUrl", () => {
    const page = { embeddingMode: "none", isExportMode: false } as const;

    it("allows a workspace page that shows the chat", async () => {
        const { canOpenChatFromUrl } = await loadModule();

        expect(canOpenChatFromUrl(true, page, false)).toBe(true);
    });

    it.each([
        ["the chat is not shown", false, page, false],
        ["the page is an export", true, { ...page, isExportMode: true }, false],
        ["the page is embedded in an iframe", true, { ...page, embeddingMode: "iframe" as const }, false],
        ["the application reports embedded presentation", true, page, true],
    ])("refuses when %s", async (_, showChat, ctx, isAppEmbedded) => {
        const { canOpenChatFromUrl } = await loadModule();

        expect(canOpenChatFromUrl(showChat, ctx, isAppEmbedded)).toBe(false);
    });
});

describe("readAiConversationParam", () => {
    it("reads the conversation id from the search part", async () => {
        const { readAiConversationParam } = await loadModule();

        expect(readAiConversationParam(`?a=1&${AI_CONVERSATION_URL_PARAM}=conv-1`)).toBe("conv-1");
    });

    it.each(["", "?a=1", `?${AI_CONVERSATION_URL_PARAM}=`])("returns undefined for %j", async (search) => {
        const { readAiConversationParam } = await loadModule();

        expect(readAiConversationParam(search)).toBeUndefined();
    });
});

describe("removeAiConversationParam", () => {
    it("removes only the parameter and keeps the other search params, the hash and the history state", async () => {
        const { removeAiConversationParam } = await loadModule();
        setUrl(`/workspace/ws1/analyze/?a=1&${AI_CONVERSATION_URL_PARAM}=conv-1#/insight-1/edit`);

        removeAiConversationParam();

        expect(window.location.pathname).toBe("/workspace/ws1/analyze/");
        expect(window.location.search).toBe("?a=1");
        expect(window.location.hash).toBe("#/insight-1/edit");
        expect(window.history.state).toEqual({ idx: 3 });
    });
});

describe("useOpenChatFromUrl", () => {
    it("opens the conversation and removes the parameter", async () => {
        const { useOpenChatFromUrl } = await loadModule();
        setUrl(`/workspace/ws1/dashboards/?${AI_CONVERSATION_URL_PARAM}=conv-1#/dashboard/d1`);
        const openConversation = vi.fn();

        renderHook(() => useOpenChatFromUrl(true, openConversation));

        expect(openConversation).toHaveBeenCalledExactlyOnceWith("conv-1");
        expect(window.location.search).toBe("");
        expect(window.location.hash).toBe("#/dashboard/d1");
    });

    it("waits until the chat is enabled and keeps the parameter meanwhile", async () => {
        const { useOpenChatFromUrl } = await loadModule();
        setUrl(`/workspace/ws1/dashboards/?${AI_CONVERSATION_URL_PARAM}=conv-1`);
        const openConversation = vi.fn();

        const { rerender } = renderHook(({ isEnabled }) => useOpenChatFromUrl(isEnabled, openConversation), {
            initialProps: { isEnabled: false },
        });
        expect(openConversation).not.toHaveBeenCalled();
        expect(window.location.search).toBe(`?${AI_CONVERSATION_URL_PARAM}=conv-1`);

        rerender({ isEnabled: true });

        expect(openConversation).toHaveBeenCalledExactlyOnceWith("conv-1");
    });

    it("acts at most once per page load", async () => {
        const { useOpenChatFromUrl } = await loadModule();
        setUrl(`/workspace/ws1/dashboards/?${AI_CONVERSATION_URL_PARAM}=conv-1`);
        const openConversation = vi.fn();
        renderHook(() => useOpenChatFromUrl(true, openConversation));

        setUrl(`/workspace/ws1/dashboards/?${AI_CONVERSATION_URL_PARAM}=conv-2`);
        renderHook(() => useOpenChatFromUrl(true, openConversation));

        expect(openConversation).toHaveBeenCalledExactlyOnceWith("conv-1");
    });

    it("does nothing without the parameter", async () => {
        const { useOpenChatFromUrl } = await loadModule();
        setUrl("/workspace/ws1/dashboards/?a=1");
        const openConversation = vi.fn();

        renderHook(() => useOpenChatFromUrl(true, openConversation));

        expect(openConversation).not.toHaveBeenCalled();
        expect(window.location.search).toBe("?a=1");
    });
});
