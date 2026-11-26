// (C) 2007-2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type ITab, type ITabsProps, Tabs } from "./Tabs.js";

const tabDefinitions = [{ id: "tab1" }, { id: "tab2" }];

const messages = {
    tab1: "Tab 1",
    tab2: "Tab 2",
    tabWithCount: "Unread ({count})",
};

const renderTabs = (options?: ITabsProps, tabs: ITab[] = tabDefinitions) => {
    const defaultProps: ITabsProps = {
        tabs,
    };

    const Wrapper = withIntlForTest(Tabs, "en-US", messages);

    return render(<Wrapper {...options} {...defaultProps} />);
};

describe("Tabs", () => {
    it("should render all tabs", () => {
        renderTabs();

        expect(screen.getAllByRole("tab")).toHaveLength(tabDefinitions.length);
    });

    it("should name tabs by their translated message, not by message id", () => {
        renderTabs(undefined, [{ id: "tabWithCount", values: { count: 3 } }, { id: "tab2" }]);

        expect(screen.getByRole("tab", { name: "Unread (3)" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Tab 2" })).toBeInTheDocument();
        expect(screen.queryByRole("tab", { name: "tabWithCount" })).not.toBeInTheDocument();
        expect(screen.queryByRole("tab", { name: "tab2" })).not.toBeInTheDocument();
    });

    it("should name icon-only tabs by their translated message", () => {
        renderTabs(undefined, [{ id: "tab1", iconOnly: true, icon: "icon-class" }]);

        expect(screen.getByRole("tab", { name: "Tab 1" })).toBeInTheDocument();
    });

    it("should name tabs by their label message and keep the id in test ids", () => {
        renderTabs(undefined, [
            { id: "first", label: { id: "tab1" }, iconOnly: true, icon: "icon-class" },
            { id: "second", label: { id: "tab2" } },
        ]);

        expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("data-testid", "s-tab-first");
        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("data-testid", "s-tab-second");
    });

    it("should render first tab selected by default", () => {
        renderTabs();
        expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveClass("is-active");
        expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("tab", { name: "Tab 2" })).not.toHaveClass("is-active");
    });

    it("should select tab by selectedTabId", () => {
        renderTabs({
            selectedTabId: tabDefinitions[1].id,
        });

        expect(screen.getByRole("tab", { name: "Tab 1" })).not.toHaveClass("is-active");
        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveClass("is-active");
    });

    it("should call callback on tab select", async () => {
        const tabSelectStub = vi.fn();
        renderTabs({ onTabSelect: tabSelectStub });
        await userEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
        await waitFor(() => {
            expect(tabSelectStub).toBeCalledWith(expect.objectContaining({ id: "tab2" }));
        });

        await userEvent.click(screen.getByRole("tab", { name: "Tab 1" }));
        await waitFor(() => {
            expect(tabSelectStub).toBeCalledWith(expect.objectContaining({ id: "tab1" }));
        });
    });

    it("should switch second tab to be active on click", async () => {
        renderTabs();
        await userEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
        await waitFor(() => {
            expect(screen.getByRole("tab", { name: "Tab 1" })).not.toHaveClass("is-active");
        });

        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveClass("is-active");
    });
});
