// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState, UiResizableSidebarProvider } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../../localization/IntlWrapper.js";

import { SidebarHeaderToggle } from "./SidebarHeaderToggle.js";

const baseState: IUiResizableSidebarState = {
    width: 230,
    expandedWidth: 230,
    min: 230,
    max: 500,
    canResize: true,
    setWidth: () => {},
    canCollapse: true,
    isCollapsed: false,
    hasRail: false,
    setCollapsed: () => {},
};

describe("SidebarHeaderToggle", () => {
    const renderToggle = (state: Partial<IUiResizableSidebarState>) =>
        render(
            <IntlWrapper locale="en-US">
                <UiResizableSidebarProvider value={{ ...baseState, ...state }}>
                    <SidebarHeaderToggle />
                </UiResizableSidebarProvider>
            </IntlWrapper>,
        );

    it("renders nothing while the sidebar is visible", () => {
        renderToggle({ isCollapsed: false });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders nothing when the sidebar cannot collapse", () => {
        renderToggle({ canCollapse: false, isCollapsed: true, width: 0 });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders nothing when the sidebar collapses to an icon rail with its own toggle", () => {
        renderToggle({
            isCollapsed: true,
            width: 48,
            min: 48,
            max: 48,
            canResize: false,
            hasRail: true,
        });

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("restores a completely hidden sidebar", () => {
        const setCollapsed = vi.fn();
        renderToggle({ isCollapsed: true, width: 0, min: 0, max: 0, canResize: false, setCollapsed });

        const button = screen.getByRole("button", { name: "Expand panel" });
        expect(button).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(button);
        expect(setCollapsed).toHaveBeenCalledExactlyOnceWith(false);
    });

    it("renders nothing outside the dashboard provider", () => {
        render(
            <IntlWrapper locale="en-US">
                <SidebarHeaderToggle />
            </IntlWrapper>,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
