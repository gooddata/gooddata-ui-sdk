// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { type IUiResizableSidebarStateOptions } from "./types.js";
import { useUiResizableSidebarState } from "./useUiResizableSidebarState.js";

const options: IUiResizableSidebarStateOptions = {
    widthStorageKey: "test-sidebar-width",
    collapsedStorageKey: "test-sidebar-collapsed",
    minWidth: 230,
    maxWidth: 500,
    isResizable: true,
    isCollapsible: true,
};

describe("useUiResizableSidebarState", () => {
    const innerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");

    const setViewportWidth = (width: number) => {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    };

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        if (innerWidth) {
            Object.defineProperty(window, "innerWidth", innerWidth);
        }
    });

    it("starts at the minimum width and clamps every resize to the bounds", () => {
        const { result } = renderHook(() => useUiResizableSidebarState(options));

        expect(result.current).toMatchObject({ width: 230, min: 230, max: 500, canResize: true });

        act(() => result.current.setWidth(300));
        expect(result.current.width).toBe(300);

        act(() => result.current.setWidth(900));
        expect(result.current.width).toBe(500);

        act(() => result.current.setWidth(10));
        expect(result.current.width).toBe(230);
        expect(localStorage.getItem(options.widthStorageKey)).toBe("230");
    });

    it("follows the current minimum width while no width is stored", () => {
        const { result, rerender } = renderHook(
            ({ minWidth }: { minWidth: number }) => useUiResizableSidebarState({ ...options, minWidth }),
            { initialProps: { minWidth: 230 } },
        );
        expect(result.current.width).toBe(230);

        rerender({ minWidth: 160 });
        expect(result.current.width).toBe(160);

        act(() => result.current.setWidth(300));
        rerender({ minWidth: 230 });
        expect(result.current.width).toBe(300);
    });

    it("restores the persisted width", () => {
        localStorage.setItem(options.widthStorageKey, "320");

        const { result } = renderHook(() => useUiResizableSidebarState(options));

        expect(result.current.width).toBe(320);
        expect(result.current.expandedWidth).toBe(320);
    });

    it("keeps a fixed width when the sidebar is not resizable", () => {
        localStorage.setItem(options.widthStorageKey, "320");

        const { result } = renderHook(() => useUiResizableSidebarState({ ...options, isResizable: false }));

        expect(result.current).toMatchObject({ width: 230, min: 230, max: 230, canResize: false });

        act(() => result.current.setWidth(300));
        expect(result.current.width).toBe(230);
    });

    it("caps the maximum so the content keeps its minimum width", () => {
        setViewportWidth(1200);

        const { result } = renderHook(() => useUiResizableSidebarState({ ...options, minContentWidth: 960 }));

        expect(result.current.max).toBe(240);
        expect(result.current.canResize).toBe(true);

        act(() => result.current.setWidth(400));
        expect(result.current.width).toBe(240);
    });

    it("disables resizing when the content cannot keep its minimum width", () => {
        setViewportWidth(1000);

        const { result } = renderHook(() => useUiResizableSidebarState({ ...options, minContentWidth: 960 }));

        expect(result.current).toMatchObject({ width: 230, max: 230, canResize: false });
    });

    it("collapses to the collapsed width and restores the expanded width", () => {
        const { result } = renderHook(() => useUiResizableSidebarState({ ...options, hasRail: true }));

        act(() => result.current.setWidth(300));
        act(() => result.current.setCollapsed(true));

        expect(result.current).toMatchObject({
            width: 48,
            expandedWidth: 300,
            min: 48,
            max: 48,
            canResize: false,
            hasRail: true,
            isCollapsed: true,
        });
        expect(localStorage.getItem(options.collapsedStorageKey)).toBe("true");

        act(() => result.current.setWidth(400));
        expect(result.current.width).toBe(48);

        act(() => result.current.setCollapsed(false));
        expect(result.current).toMatchObject({ width: 300, isCollapsed: false, canResize: true });
    });

    it("hides the sidebar completely when collapsed by default", () => {
        const { result } = renderHook(() => useUiResizableSidebarState(options));

        act(() => result.current.setCollapsed(true));

        expect(result.current).toMatchObject({
            width: 0,
            min: 0,
            max: 0,
            hasRail: false,
            isCollapsed: true,
        });
    });

    it("falls back to the defaults when the persisted values are malformed", () => {
        localStorage.setItem(options.widthStorageKey, JSON.stringify("abc"));
        localStorage.setItem(options.collapsedStorageKey, JSON.stringify("no"));

        const { result } = renderHook(() => useUiResizableSidebarState(options));

        expect(result.current).toMatchObject({ width: 230, isCollapsed: false });
    });

    it("ignores collapsing when the sidebar is not collapsible", () => {
        const { result } = renderHook(() => useUiResizableSidebarState({ ...options, isCollapsible: false }));

        act(() => result.current.setCollapsed(true));

        expect(result.current).toMatchObject({ canCollapse: false, isCollapsed: false, width: 230 });
        expect(localStorage.getItem(options.collapsedStorageKey)).toBeNull();
    });
});
