// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { Tabs, ITabsProps } from "../Tabs.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

const tabDefinitions = [{ id: "tab1" }, { id: "tab2" }];

const renderTabs = (options?: ITabsProps) => {
    const messages = {
        tab1: "Tab 1",
        tab2: "Tab 2",
    };

    const defaultProps: ITabsProps = {
        tabs: tabDefinitions,
    };

    const Wrapper = withIntl(Tabs, "en-US", messages);

    return render(<Wrapper {...options} {...defaultProps} />);
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
