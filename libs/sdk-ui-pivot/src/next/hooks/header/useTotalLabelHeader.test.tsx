// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ITotalLabelTarget } from "../../features/aggregations/totalLabelTarget.js";
import { useTotalLabelContextMock } from "../../testing/contextMocks.test.helpers.js";

import { type useTotalLabelHeader as UseTotalLabelHeaderType } from "./useTotalLabelHeader.js";

vi.mock("../../context/TotalLabelContext.js", () => ({
    useTotalLabelContext: useTotalLabelContextMock,
}));

// Several other test files (real usages and other mocks) also touch TotalLabelContext.js, and the
// suite runs with isolate: false (see vitest.config.ts's own comment on this exact pattern) - without
// resetting modules and re-importing dynamically, whichever file's resolution of that module happens
// to be cached first "wins" for the whole worker, so this file's own vi.mock above can silently not
// apply.
let useTotalLabelHeader: typeof UseTotalLabelHeaderType;

beforeEach(async () => {
    vi.resetModules();
    ({ useTotalLabelHeader } = await import("./useTotalLabelHeader.js"));
});

const TARGET: ITotalLabelTarget = {
    type: "sum",
    attributeIdentifier: "row-attribute",
    bucketType: "attribute",
};

function mockClickEvent() {
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const event = { preventDefault, stopPropagation } as unknown as MouseEvent<HTMLDivElement>;
    return { event, preventDefault, stopPropagation };
}

describe("useTotalLabelHeader", () => {
    it("returns no label and no onClick when there is no target", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        const { result } = renderHook(() => useTotalLabelHeader(header, undefined));

        expect(result.current.label).toBeUndefined();
        expect(result.current.onClick).toBeUndefined();
        expect(getCustomTotalLabel).toHaveBeenCalledWith(undefined);
    });

    it("returns the custom alias as the label and opens the menu on click when there is a target", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => "Grand Total");
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        const { result } = renderHook(() => useTotalLabelHeader(header, TARGET));

        expect(result.current.label).toBe("Grand Total");
        expect(result.current.onClick).toBeInstanceOf(Function);

        const { event, preventDefault, stopPropagation } = mockClickEvent();
        act(() => {
            result.current.onClick?.(event);
        });

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(stopPropagation).toHaveBeenCalledOnce();
        expect(openTotalLabelMenu).toHaveBeenCalledWith({ ...TARGET, anchor: header });
    });

    it("returns no onClick for a target when the feature is disabled, so the header does not swallow clicks meant for AG Grid's own listeners", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => "Grand Total");
        useTotalLabelContextMock.mockReturnValue({ enabled: false, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        const { result } = renderHook(() => useTotalLabelHeader(header, TARGET));

        expect(result.current.onClick).toBeUndefined();
    });

    it("sets aria-haspopup=menu on the AG Grid header when there is a target and the feature is enabled, and clears it on unmount", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        const { unmount } = renderHook(() => useTotalLabelHeader(header, TARGET));

        expect(header).toHaveAttribute("aria-haspopup", "menu");

        unmount();

        expect(header).not.toHaveAttribute("aria-haspopup");
    });

    it("preserves a pre-existing aria-haspopup value on the header instead of clobbering it - AG Grid owns this element and may already carry one for its own reasons", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        header.setAttribute("aria-haspopup", "true");
        const { unmount } = renderHook(() => useTotalLabelHeader(header, TARGET));

        expect(header).toHaveAttribute("aria-haspopup", "menu");

        unmount();

        expect(header).toHaveAttribute("aria-haspopup", "true");
    });

    it("does not set aria-haspopup when there is no target", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        renderHook(() => useTotalLabelHeader(header, undefined));

        expect(header).not.toHaveAttribute("aria-haspopup");
    });

    it("does not set aria-haspopup when there is a target but the feature is disabled", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: false, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        renderHook(() => useTotalLabelHeader(header, TARGET));

        expect(header).not.toHaveAttribute("aria-haspopup");
    });

    it("opens the menu when onClick is invoked with a keyboard event, not just a mouse click (the caller forwards Enter/Space from its own useHeaderSpaceKey into this same handler)", () => {
        const openTotalLabelMenu = vi.fn();
        const getCustomTotalLabel = vi.fn(() => undefined);
        useTotalLabelContextMock.mockReturnValue({ enabled: true, openTotalLabelMenu, getCustomTotalLabel });

        const header = document.createElement("div");
        const { result } = renderHook(() => useTotalLabelHeader(header, TARGET));

        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const keyboardEvent = { key: "Enter", preventDefault, stopPropagation } as unknown as KeyboardEvent;

        act(() => {
            result.current.onClick?.(keyboardEvent);
        });

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(stopPropagation).toHaveBeenCalledOnce();
        expect(openTotalLabelMenu).toHaveBeenCalledWith({ ...TARGET, anchor: header });
    });
});
