// (C) 2007-2025 GoodData Corporation
import { render, waitFor, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Tabs, ITabsProps } from "../Tabs.js";
import { Intl } from "@gooddata/sdk-ui";

const tabDefinitions = [{ id: "tab1" }, { id: "tab2" }];

const renderTabs = (options?: ITabsProps) => {
    const messages = {
        tab1: "Tab 1",
        tab2: "Tab 2",
    };

    const defaultProps: ITabsProps = {
        tabs: tabDefinitions,
    };

    return render(
        <Intl customLocale="en-US" customMessages={messages}>
            <Tabs {...options} {...defaultProps} />
        </Intl>,
    );
};

describe("Tabs", () => {
    it("should render all tabs", () => {
        renderTabs();

        expect(screen.getAllByLabelText("tab", { exact: false })).toHaveLength(tabDefinitions.length);
    });

    it("should render first tab selected by default", () => {
        renderTabs();
        expect(screen.getByLabelText("tab1")).toHaveClass("is-active");
        expect(screen.queryByLabelText("tab2")).not.toHaveClass("is-active");
    });

    it("should select tab by selectedTabId", () => {
        renderTabs({
            selectedTabId: tabDefinitions[1].id,
        });

        expect(screen.queryByLabelText("tab1")).not.toHaveClass("is-active");
        expect(screen.getByLabelText("tab2")).toHaveClass("is-active");
    });

    it("should call callback on tab select", async () => {
        const tabSelectStub = vi.fn();
        renderTabs({ onTabSelect: tabSelectStub });
        await userEvent.click(screen.getByLabelText("tab2"));
        await waitFor(() => {
            expect(tabSelectStub).toBeCalledWith(expect.objectContaining({ id: "tab2" }));
        });

        await userEvent.click(screen.getByLabelText("tab1"));
        await waitFor(() => {
            expect(tabSelectStub).toBeCalledWith(expect.objectContaining({ id: "tab1" }));
        });
    });

    it("should switch second tab to be active on click", async () => {
        renderTabs();
        await userEvent.click(screen.getByLabelText("tab2"));
        await waitFor(() => {
            expect(screen.queryByLabelText("tab1")).not.toHaveClass("is-active");
        });

        expect(screen.getByLabelText("tab2")).toHaveClass("is-active");
    });
});
