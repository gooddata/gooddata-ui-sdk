// (C) 2026 GoodData Corporation

import { isInaccessible } from "@testing-library/dom";
import { describe, expect, it } from "vitest";

import { useDashboardDispatch } from "../../../model/react/DashboardStoreProvider.js";
import { configActions } from "../../../model/store/config/index.js";
import { render } from "../tests/render.test.utils.js";

import { DashboardInteractionComposing } from "./DashboardInteractionComposing.js";
import { DashboardInteractionLock } from "./DashboardInteractionLock.js";

function ModeControls() {
    const dispatch = useDashboardDispatch();
    return (
        <>
            <button onClick={() => dispatch(configActions.setAiMode("waiting"))}>Wait</button>
            <button onClick={() => dispatch(configActions.setAiMode("building"))}>Build</button>
            <button onClick={() => dispatch(configActions.setAiMode("active"))}>Finish</button>
            <button onClick={() => dispatch(configActions.setAiReasoningTitle("Choosing charts"))}>
                Update title
            </button>
            <button onClick={() => dispatch(configActions.setAiReasoningTitle(undefined))}>
                Clear title
            </button>
        </>
    );
}

describe("DashboardInteractionComposing", () => {
    it.each(["generating", "building"] as const)(
        "shows and replaces the reasoning title in %s mode without changing the overlay or lock",
        async (aiMode) => {
            const { container, getByRole, queryByRole, queryByText, user } = render(
                <>
                    <DashboardInteractionComposing>
                        <DashboardInteractionLock>
                            <button>Dashboard control</button>
                        </DashboardInteractionLock>
                    </DashboardInteractionComposing>
                    <ModeControls />
                </>,
                { state: { config: { config: { aiMode, aiReasoningTitle: "Exploring data" } } } },
            );

            expect(getByRole("status")).toHaveTextContent("Exploring data");
            expect(getByRole("status").closest('[aria-hidden="true"], [inert]')).toBeNull();
            await user.click(getByRole("button", { name: "Update title" }));
            expect(getByRole("status")).toHaveTextContent("Choosing charts");
            expect(queryByText("Exploring data")).not.toBeInTheDocument();
            expect(container.querySelectorAll(".gd-dashboard-ai-composing-overlay rect")).toHaveLength(4);
            expect(container.querySelector(".gd-dashboard-interaction-lock__content")).toHaveAttribute(
                "inert",
            );

            await user.click(getByRole("button", { name: "Clear title" }));
            expect(queryByRole("status")).not.toBeInTheDocument();
            expect(container.querySelector(".gd-dashboard-interaction-composing__status")).toHaveClass(
                "hidden",
            );
            expect(container.querySelector(".gd-dashboard-interaction-composing__status")).toHaveAttribute(
                "aria-hidden",
                "true",
            );
            expect(container.querySelectorAll(".gd-dashboard-ai-composing-overlay rect")).toHaveLength(4);
            expect(container.querySelector(".gd-dashboard-interaction-lock__content")).toHaveAttribute(
                "inert",
            );
        },
    );

    it("prioritizes waiting, resumes the latest title and hides a lingering title when finished", async () => {
        const { getByRole, queryByRole, queryByText, user } = render(
            <>
                <DashboardInteractionComposing>
                    <button>Dashboard control</button>
                </DashboardInteractionComposing>
                <ModeControls />
            </>,
            { state: { config: { config: { aiMode: "building", aiReasoningTitle: "Exploring data" } } } },
        );

        expect(getByRole("status")).toHaveTextContent("Exploring data");
        await user.click(getByRole("button", { name: "Wait" }));
        expect(getByRole("status")).toHaveTextContent("Reply in chat to continue.");
        expect(queryByText("Exploring data")).not.toBeInTheDocument();
        await user.click(getByRole("button", { name: "Clear title" }));
        expect(getByRole("status")).toHaveTextContent("Reply in chat to continue.");
        await user.click(getByRole("button", { name: "Update title" }));
        expect(getByRole("status")).toHaveTextContent("Reply in chat to continue.");
        expect(queryByText("Choosing charts")).not.toBeInTheDocument();
        await user.click(getByRole("button", { name: "Build" }));
        expect(getByRole("status")).toHaveTextContent("Choosing charts");
        await user.click(getByRole("button", { name: "Finish" }));
        expect(queryByRole("status")).not.toBeInTheDocument();
    });

    it.each(["active", null, undefined] as const)(
        "does not expose a lingering reasoning title in %s mode",
        (aiMode) => {
            const { container, queryByRole } = render(
                <DashboardInteractionComposing>Dashboard content</DashboardInteractionComposing>,
                { state: { config: { config: { aiMode, aiReasoningTitle: "Exploring data" } } } },
            );

            expect(queryByRole("status")).not.toBeInTheDocument();
            expect(
                isInaccessible(container.querySelector(".gd-dashboard-interaction-composing__status")!),
            ).toBe(true);
            expect(container.querySelector(".gd-dashboard-ai-composing-overlay")).not.toBeInTheDocument();
        },
    );

    it("renders markup in the title as plain text", () => {
        const aiReasoningTitle = '<img src="x" onerror="alert(1)"> **Choosing charts**';
        const { getByRole } = render(
            <DashboardInteractionComposing>Dashboard content</DashboardInteractionComposing>,
            { state: { config: { config: { aiMode: "generating", aiReasoningTitle } } } },
        );

        expect(getByRole("status").textContent).toBe(aiReasoningTitle);
        expect(getByRole("status").children).toHaveLength(0);
    });

    it.each(["generating", "building"] as const)(
        "does not expose an empty reasoning title in %s mode",
        (aiMode) => {
            const { queryByRole } = render(
                <DashboardInteractionComposing>Dashboard content</DashboardInteractionComposing>,
                { state: { config: { config: { aiMode, aiReasoningTitle: "" } } } },
            );

            expect(queryByRole("status")).not.toBeInTheDocument();
        },
    );

    it.each(["active", "generating", "building", "waiting", null, undefined] as const)(
        "limits the beam, lock and accessible notice to the appropriate AI modes: %s",
        (aiMode) => {
            const { container, getByText, queryByRole } = render(
                <DashboardInteractionComposing>
                    <DashboardInteractionLock className="dashboard-content">
                        <button>Dashboard control</button>
                    </DashboardInteractionLock>
                </DashboardInteractionComposing>,
                { state: { config: { config: { aiMode } } } },
            );

            expect(container.querySelectorAll(".gd-dashboard-ai-composing-overlay rect")).toHaveLength(
                aiMode === "generating" || aiMode === "building" || aiMode === "waiting" ? 4 : 0,
            );
            const content = container.querySelector(".gd-dashboard-interaction-lock__content");
            expect(content?.hasAttribute("inert")).toBe(
                aiMode === "generating" || aiMode === "building" || aiMode === "waiting",
            );
            expect(container.querySelector(".dashboard-content")).not.toBeNull();
            expect(queryByRole("status")?.textContent ?? null).toBe(
                aiMode === "waiting" ? "Reply in chat to continue." : null,
            );
            expect(isInaccessible(getByText("Reply in chat to continue."))).toBe(aiMode !== "waiting");
        },
    );

    it("blurs dashboard focus while leaving controls outside the content boundary available", async () => {
        const { getByRole, user } = render(
            <>
                <DashboardInteractionComposing>
                    <DashboardInteractionLock>
                        <button autoFocus>Dashboard control</button>
                    </DashboardInteractionLock>
                </DashboardInteractionComposing>
                <button>Cancel</button>
            </>,
            { state: { config: { config: { aiMode: "building" } } } },
        );

        expect(getByRole("button", { name: "Dashboard control", hidden: true })).not.toHaveFocus();
        await user.click(getByRole("button", { name: "Cancel" }));
        expect(getByRole("button", { name: "Cancel" })).toHaveFocus();
    });

    it("shows the notice on entering waiting and removes it when building resumes or finishes", async () => {
        const { getByRole, getByText, queryByRole, user } = render(
            <>
                <DashboardInteractionComposing>
                    <button>Dashboard control</button>
                </DashboardInteractionComposing>
                <ModeControls />
            </>,
            { state: { config: { config: { aiMode: "building" } } } },
        );

        expect(queryByRole("status")).not.toBeInTheDocument();
        expect(isInaccessible(getByText("Reply in chat to continue."))).toBe(true);
        await user.click(getByRole("button", { name: "Wait" }));
        expect(getByRole("status")).toHaveTextContent("Reply in chat to continue.");
        expect(isInaccessible(getByText("Reply in chat to continue."))).toBe(false);
        expect(getByRole("status").closest('[aria-hidden="true"], [inert]')).toBeNull();
        expect(getByRole("button", { name: "Wait" })).toHaveFocus();

        await user.click(getByRole("button", { name: "Build" }));
        expect(queryByRole("status")).not.toBeInTheDocument();
        expect(isInaccessible(getByText("Reply in chat to continue."))).toBe(true);
        await user.click(getByRole("button", { name: "Wait" }));
        expect(getByRole("status")).toBeInTheDocument();
        await user.click(getByRole("button", { name: "Finish" }));
        expect(queryByRole("status")).not.toBeInTheDocument();
        expect(isInaccessible(getByText("Reply in chat to continue."))).toBe(true);
        expect(getByRole("button", { name: "Dashboard control" })).toBeInTheDocument();
    });
});
