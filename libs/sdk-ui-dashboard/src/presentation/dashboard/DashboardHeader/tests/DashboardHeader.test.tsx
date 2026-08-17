// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { PointerEventsCheckLevel, userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { render } from "../../../../../test/render.js";
import { DashboardTabsWrapper } from "../DashboardHeader.js";

type SetupState = NonNullable<Parameters<typeof render>[1]>["state"];

const tabsState = () => ({
    activeTabLocalIdentifier: "100",
    tabs: [
        { localIdentifier: "100", title: "Tab 1" },
        { localIdentifier: "200", title: "Tab 2" },
    ],
});

function setup(state: SetupState) {
    /**
     * `delay: null` makes the user events resolve without waiting for a real timer between every single
     * keystroke / pointer event and `PointerEventsCheckLevel.Never` skips the repeated (and in jsdom
     * rather expensive) `getComputedStyle` based pointer-events checks. Neither of them is needed here,
     * as the tab renaming is not driven by any timers.
     */
    const user = userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never });

    render(<DashboardTabsWrapper />, { state });

    return { user };
}

describe("DashboardTabsWrapper", () => {
    it("should support double-click tab renaming in edit mode", async () => {
        const { user } = setup({ renderMode: { renderMode: "edit" }, tabs: tabsState() });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        const input = screen.getByDisplayValue("Tab 2");
        expect(input).toBeVisible();

        await user.clear(input);
        await user.type(input, "Tab 2 (renamed){enter}");

        expect(screen.getByRole("tab", { name: "Tab 2 (renamed)" })).toBeVisible();
        expect(screen.queryByDisplayValue("Tab 2 (renamed)")).not.toBeInTheDocument();
    });

    it("should not allow double-click tab renaming in non-edit mode", async () => {
        const { user } = setup({ tabs: tabsState() });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));

        expect(screen.queryByDisplayValue("Tab 2")).not.toBeInTheDocument();
    });

    it("should return focus back to original tab after tab renaming", async () => {
        const { user } = setup({ renderMode: { renderMode: "edit" }, tabs: tabsState() });

        await user.dblClick(screen.getByRole("tab", { name: "Tab 2" }));
        await user.type(screen.getByDisplayValue("Tab 2"), "{enter}");

        expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveFocus();
    });
});
