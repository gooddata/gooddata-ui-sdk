// (C) 2026 GoodData Corporation

import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render } from "../../../../test/render.js";
import { UiTabs } from "../UiTabs.js";

const requiredProps = {
    tabs: [{ id: "1", label: "Tab 1" }],
    selectedTabId: "1",
    onTabSelect: () => {},
};

describe("UiTabs", () => {
    it("should support double-clicking on tabs", async () => {
        const onTabDoubleClick = vi.fn(() => {});
        const { user } = render(
            <UiTabs
                {...requiredProps}
                tabs={[
                    { id: "100", label: "Tab 1" },
                    { id: "200", label: "Tab 2" },
                ]}
                selectedTabId="100"
                onTabDoubleClick={onTabDoubleClick}
            />,
        );

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        expect(onTabDoubleClick).toHaveBeenCalledTimes(1);
        expect(onTabDoubleClick).toHaveBeenCalledWith({ id: "200", label: "Tab 2" });
    });

    it("should not render the tab actions trigger when actions contain only a separator", () => {
        render(
            <UiTabs
                {...requiredProps}
                tabs={[{ id: "1", label: "Tab 1", actions: [{ type: "separator" }] }]}
            />,
        );

        expect(screen.queryByTestId("s-tab-actions")).not.toBeInTheDocument();
    });

    it("should render the tab actions trigger when an interactive action survives among separators", () => {
        render(
            <UiTabs
                {...requiredProps}
                tabs={[
                    {
                        id: "1",
                        label: "Tab 1",
                        actions: [
                            { id: "actionOne", label: "Action one" },
                            { type: "separator" },
                            { id: "actionTwo", label: "Action two" },
                        ],
                    },
                ]}
            />,
        );

        expect(screen.getByTestId("s-tab-actions")).toBeInTheDocument();
    });

    describe("all-tabs dropdown", () => {
        const originalScrollWidth = Object.getOwnPropertyDescriptor(Element.prototype, "scrollWidth");
        const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");

        beforeEach(() => {
            // Forces the container's overflow check (scrollWidth > clientWidth) to report an overflow in happy-dom.
            Object.defineProperty(Element.prototype, "scrollWidth", { configurable: true, get: () => 200 });
            Object.defineProperty(HTMLElement.prototype, "clientWidth", {
                configurable: true,
                get: () => 100,
            });
        });

        afterEach(() => {
            if (originalScrollWidth) {
                Object.defineProperty(Element.prototype, "scrollWidth", originalScrollWidth);
            } else {
                Reflect.deleteProperty(Element.prototype, "scrollWidth");
            }
            if (originalClientWidth) {
                Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
            } else {
                Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
            }
        });

        it("should render an actions gridcell only for tabs with interactive actions", async () => {
            const { user } = render(
                <UiTabs
                    {...requiredProps}
                    tabs={[
                        { id: "1", label: "Tab 1", actions: [{ type: "separator" }] },
                        {
                            id: "2",
                            label: "Tab 2",
                            actions: [{ id: "actionOne", label: "Action one" }],
                        },
                    ]}
                />,
            );

            await user.click(await screen.findByRole("button", { name: "Show all tabs" }));

            const rows = screen.getAllByRole("row");
            expect(within(rows[0]).queryAllByRole("gridcell")).toHaveLength(1);
            expect(within(rows[1]).queryAllByRole("gridcell")).toHaveLength(2);
        });
    });
});
