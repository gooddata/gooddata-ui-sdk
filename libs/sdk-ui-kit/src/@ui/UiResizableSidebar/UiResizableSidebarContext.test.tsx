// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState } from "./types.js";
import { UiResizableSidebarProvider, useUiResizableSidebar } from "./UiResizableSidebarContext.js";

const provided: IUiResizableSidebarState = {
    width: 300,
    expandedWidth: 300,
    min: 230,
    max: 500,
    canResize: true,
    setWidth: () => {},
    canCollapse: false,
    isCollapsed: false,
    hasRail: false,
    setCollapsed: () => {},
};

const fallback: IUiResizableSidebarState = {
    ...provided,
    width: 230,
    expandedWidth: 230,
    max: 230,
    canResize: false,
};

describe("useUiResizableSidebar", () => {
    it("returns the provided state and ignores the fallback", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <UiResizableSidebarProvider value={provided}>{children}</UiResizableSidebarProvider>
        );

        const { result } = renderHook(() => useUiResizableSidebar(fallback), { wrapper });

        expect(result.current).toBe(provided);
    });

    it("returns the fallback outside a provider", () => {
        const { result } = renderHook(() => useUiResizableSidebar(fallback));

        expect(result.current).toBe(fallback);
    });

    it("throws outside a provider when no fallback is given", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => renderHook(() => useUiResizableSidebar())).toThrow(
            "`useUiResizableSidebar` must be used within `UiResizableSidebarProvider`",
        );
    });
});
