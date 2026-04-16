// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../../../test/render.js";
import { DashboardTabsWrapper } from "../DashboardHeader.js";

describe("DashboardTabsWrapper", () => {
    it("should support double-click tab renaming in edit mode", async () => {
        const { user } = render(<DashboardTabsWrapper />, {
            state: {
                renderMode: { renderMode: "edit" },
                tabs: {
                    activeTabLocalIdentifier: "100",
                    tabs: [
                        { localIdentifier: "100", title: "Tab 1" },
                        { localIdentifier: "200", title: "Tab 2" },
                    ],
                },
            },
        });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        expect(screen.getByDisplayValue("Tab 2")).toBeVisible();

        const input = screen.getByDisplayValue("Tab 2");
        await user.clear(input);
        await user.type(input, "Tab 2 (renamed){enter}");

        expect(screen.getByRole("tab", { name: "Tab 2 (renamed)" })).toBeVisible();
        expect(screen.queryByDisplayValue("Tab 2 (renamed)")).not.toBeInTheDocument();
    });

    it("should not allow double-click tab renaming in non-edit mode", async () => {
        const { user } = render(<DashboardTabsWrapper />, {
            state: {
                tabs: {
                    activeTabLocalIdentifier: "100",
                    tabs: [
                        { localIdentifier: "100", title: "Tab 1" },
                        { localIdentifier: "200", title: "Tab 2" },
                    ],
                },
            },
        });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        expect(screen.queryByDisplayValue("Tab 2")).not.toBeInTheDocument();
    });

    it("should return focus back to original tab after tab renaming", async () => {
        const { user } = render(<DashboardTabsWrapper />, {
            state: {
                renderMode: { renderMode: "edit" },
                tabs: {
                    activeTabLocalIdentifier: "100",
                    tabs: [
                        { localIdentifier: "100", title: "Tab 1" },
                        { localIdentifier: "200", title: "Tab 2" },
                    ],
                },
            },
        });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));
        await user.type(screen.getByDisplayValue("Tab 2"), "{enter}");

        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveFocus();
    });
});
