// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { useDashboardDispatch } from "../../../model/react/DashboardStoreProvider.js";
import { configActions } from "../../../model/store/config/index.js";
import { render } from "../tests/render.test.utils.js";

import { DashboardInteractionLock } from "./DashboardInteractionLock.js";

function ModeControls() {
    const dispatch = useDashboardDispatch();
    return (
        <>
            <button onClick={() => dispatch(configActions.setAiMode("waiting"))}>Wait</button>
            <button onClick={() => dispatch(configActions.setAiMode("building"))}>Build</button>
            <button onClick={() => dispatch(configActions.setAiMode("active"))}>Finish</button>
        </>
    );
}

describe("DashboardInteractionLock", () => {
    it.each(["active", "generating", "building", "waiting", null, undefined] as const)(
        "limits the lock and blocking overlay to the appropriate AI modes: %s",
        (aiMode) => {
            const { container, getByText } = render(
                <DashboardInteractionLock className="dashboard-content">
                    <button>Dashboard control</button>
                </DashboardInteractionLock>,
                { state: { config: { config: { aiMode } } } },
            );
            const isLocked = aiMode === "generating" || aiMode === "building" || aiMode === "waiting";

            expect(
                container.querySelector(".gd-dashboard-interaction-lock__content")?.hasAttribute("inert"),
            ).toBe(isLocked);
            expect(container.querySelector(".dashboard-content")).toBeInTheDocument();
            expect(
                container
                    .querySelector(".dashboard-content")
                    ?.classList.contains("gd-dashboard-interaction-lock--active"),
            ).toBe(isLocked);
            expect(container.querySelectorAll(".gd-dashboard-ai-building-overlay")).toHaveLength(
                isLocked ? 1 : 0,
            );
            expect(
                Array.from(container.querySelectorAll(".gd-dashboard-ai-building-overlay"), (overlay) =>
                    overlay.getAttribute("aria-hidden"),
                ),
            ).toEqual(isLocked ? ["true"] : []);
            expect(getByText("Dashboard control")).toBeInTheDocument();
        },
    );

    it("blurs dashboard focus while leaving controls outside the content boundary available", async () => {
        const { getByRole, user } = render(
            <>
                <DashboardInteractionLock>
                    <button autoFocus>Dashboard control</button>
                </DashboardInteractionLock>
                <button>Cancel</button>
            </>,
            { state: { config: { config: { aiMode: "building" } } } },
        );

        expect(getByRole("button", { name: "Dashboard control", hidden: true })).not.toHaveFocus();
        await user.click(getByRole("button", { name: "Cancel" }));
        expect(getByRole("button", { name: "Cancel" })).toHaveFocus();
    });

    it("keeps content mounted and releases interaction when building or waiting finishes", async () => {
        const { container, getByRole, user } = render(
            <>
                <DashboardInteractionLock>
                    <button>Dashboard control</button>
                </DashboardInteractionLock>
                <ModeControls />
            </>,
            { state: { config: { config: { aiMode: "active" } } } },
        );
        const control = getByRole("button", { name: "Dashboard control" });
        const content = container.querySelector(".gd-dashboard-interaction-lock__content");
        control.focus();

        for (const mode of ["Build", "Wait"]) {
            await user.click(getByRole("button", { name: mode }));
            expect(content).toHaveAttribute("inert");
            expect(control).not.toHaveFocus();
            expect(getByRole("button", { name: mode })).toHaveFocus();
            expect(container.querySelector(".gd-dashboard-ai-building-overlay")).toBeInTheDocument();
        }
        await user.click(getByRole("button", { name: "Finish" }));
        expect(content).not.toHaveAttribute("inert");
        expect(container.querySelector(".gd-dashboard-ai-building-overlay")).not.toBeInTheDocument();
        expect(getByRole("button", { name: "Dashboard control" })).toBe(control);
        control.focus();
        expect(control).toHaveFocus();
    });
});
