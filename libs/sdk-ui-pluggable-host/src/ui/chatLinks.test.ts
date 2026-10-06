// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";

import { handleChatLinkClick } from "./chatLinks.js";

function linkOf(overrides: Partial<LinkHandlerEvent> = {}): LinkHandlerEvent {
    return {
        type: "report",
        id: "r1",
        workspaceId: "ws",
        newTab: false,
        itemUrl: "/workspace/ws/publisher/report/r1",
        preventDefault: vi.fn(),
        action: "open",
        ...overrides,
    };
}

describe("handleChatLinkClick", () => {
    const assign = vi.fn();
    const open = vi.fn();

    function stubNavigation() {
        vi.stubGlobal("location", {
            ...window.location,
            assign,
            pathname: "/workspace/ws/dashboards",
            hash: "",
        });
        vi.stubGlobal("open", open);
    }

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("navigates to the link when no app handles it", () => {
        stubNavigation();

        const result = handleChatLinkClick(linkOf(), { embedded: false, onAppLinkClick: () => false });

        expect(assign).toHaveBeenCalledWith("/workspace/ws/publisher/report/r1");
        expect(result).toBe("/workspace/ws/publisher/report/r1");
    });

    it("keeps the page when the app handled the click", () => {
        stubNavigation();
        const link = linkOf();
        const onAppLinkClick = vi.fn().mockReturnValue(true);

        handleChatLinkClick(link, { embedded: false, onAppLinkClick });

        expect(onAppLinkClick).toHaveBeenCalledWith(link);
        expect(assign).not.toHaveBeenCalled();
        expect(open).not.toHaveBeenCalled();
        expect(link.preventDefault).toHaveBeenCalled();
    });

    it.each([
        ["did not handle", false],
        ["handled", true],
    ])("opens a new tab for a new-tab click the app %s", (_description, isHandledByApp) => {
        stubNavigation();

        handleChatLinkClick(linkOf({ newTab: true }), {
            embedded: false,
            onAppLinkClick: () => isHandledByApp,
        });

        expect(open).toHaveBeenCalledWith("/workspace/ws/publisher/report/r1", "_blank");
        expect(assign).not.toHaveBeenCalled();
    });

    it("never navigates while embedded, and still lets the app handle the click", () => {
        stubNavigation();
        const link = linkOf();
        const onAppLinkClick = vi.fn().mockReturnValue(false);

        handleChatLinkClick(link, { embedded: true, onAppLinkClick });

        expect(onAppLinkClick).toHaveBeenCalledWith(link);
        expect(assign).not.toHaveBeenCalled();
        expect(open).not.toHaveBeenCalled();
    });

    it("stays on a link to the page that is already open", () => {
        stubNavigation();

        handleChatLinkClick(linkOf({ itemUrl: "/workspace/ws/dashboards" }), {
            embedded: false,
            onAppLinkClick: () => false,
        });

        expect(assign).not.toHaveBeenCalled();
    });

    it("does not navigate for a copy action", () => {
        stubNavigation();

        handleChatLinkClick(linkOf({ action: "copy" }), { embedded: false, onAppLinkClick: () => false });

        expect(assign).not.toHaveBeenCalled();
    });
});
