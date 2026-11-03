// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CopilotHandler } from "./CopilotHandler.js";
import { CopilotInteractionComposing } from "./CopilotInteractionComposing.js";
import { CopilotInteractionComposingWithHandler } from "./CopilotInteractionComposingWithHandler.js";

describe("CopilotInteractionComposing", () => {
    it.each(["generating", "building"] as const)("shows loading without a banner while %s", (status) => {
        render(
            <CopilotInteractionComposing status={status}>
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );

        expect(screen.getByText("Editor")).toBeInTheDocument();
        expect(screen.getByTestId("gd-copilot-composing-overlay")).toHaveAttribute("aria-hidden", "true");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows and updates reasoning without a dashboard or chat provider", () => {
        const { rerender } = render(
            <CopilotInteractionComposing status="generating" reasoningTitle="Choosing metrics">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Choosing metrics");

        rerender(
            <CopilotInteractionComposing status="building" reasoningTitle="Arranging visualizations">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("Arranging visualizations");
    });

    it("renders reasoning as plain text and clears the banner when the title is removed", () => {
        const { container, rerender } = render(
            <CopilotInteractionComposing status="building" reasoningTitle="<b>Choosing a layout</b>">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );
        expect(screen.getByRole("status")).toHaveTextContent("<b>Choosing a layout</b>");
        expect(container.querySelector("b")).not.toBeInTheDocument();

        rerender(
            <CopilotInteractionComposing status="building" reasoningTitle="">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByTestId("gd-copilot-composing-overlay")).toBeInTheDocument();
    });

    it("keeps notices and reply actions outside potentially inert host content", () => {
        const { container } = render(
            <CopilotInteractionComposing status="waiting" onReplyInChat={vi.fn()}>
                <div inert>Locked editor</div>
            </CopilotInteractionComposing>,
        );
        const content = container.querySelector(".gd-copilot-interaction-composing__content");
        expect(content).not.toContainElement(screen.getByRole("status"));
        expect(content).not.toContainElement(screen.getByRole("button", { name: "Reply now" }));
        screen.getByRole("button", { name: "Reply now" }).focus();
        expect(screen.getByRole("button", { name: "Reply now" })).toHaveFocus();
    });

    it("gives waiting precedence over reasoning and invokes the reply callback once", () => {
        const onReplyInChat = vi.fn();
        render(
            <CopilotInteractionComposing
                status="waiting"
                reasoningTitle="Previous reasoning"
                onReplyInChat={onReplyInChat}
            >
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );

        expect(screen.getByRole("status")).toHaveTextContent("Waiting for your reply");
        expect(screen.queryByText("Previous reasoning")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Reply now" }));
        expect(onReplyInChat).toHaveBeenCalledTimes(1);
    });

    it("shows waiting without a reply button when the host provides no callback", () => {
        render(
            <CopilotInteractionComposing status="waiting">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );

        expect(screen.getByRole("status")).toHaveTextContent("Waiting for your reply");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides all composing UI when idle even with a stale title", () => {
        render(
            <CopilotInteractionComposing status="idle" reasoningTitle="Previous reasoning">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );

        expect(screen.queryByTestId("gd-copilot-composing-overlay")).not.toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.queryByText("Previous reasoning")).not.toBeInTheDocument();
    });

    it("evaluates visibility on render without unmounting or resetting wrapped content", () => {
        const unmounted = vi.fn();
        function Editor() {
            useEffect(() => unmounted, []);
            return <input aria-label="Draft" defaultValue="Initial draft" />;
        }
        let visible = true;
        const isVisible = vi.fn(() => visible);
        const content = (
            <CopilotInteractionComposing status="waiting" isVisible={isVisible} onReplyInChat={vi.fn()}>
                <Editor />
            </CopilotInteractionComposing>
        );
        const { rerender } = render(content);
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "Edited draft" } });

        visible = false;
        rerender(
            <CopilotInteractionComposing status="waiting" isVisible={isVisible}>
                <Editor />
            </CopilotInteractionComposing>,
        );
        expect(screen.queryByTestId("gd-copilot-composing-overlay")).not.toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBe(input);
        expect(input).toHaveValue("Edited draft");
        expect(unmounted).not.toHaveBeenCalled();

        visible = true;
        rerender(content);
        expect(screen.getByRole("status")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBe(input);
        expect(isVisible).toHaveBeenCalledTimes(3);
        expect(unmounted).not.toHaveBeenCalled();
    });

    it("does not delay children while a locale bundle loads", async () => {
        render(
            <CopilotInteractionComposing status="waiting" locale="de-DE">
                <div>Editor</div>
            </CopilotInteractionComposing>,
        );

        expect(screen.getByText("Editor")).toBeInTheDocument();
        expect(await screen.findByRole("status")).toHaveTextContent("Waiting for your reply");
    });
});

describe("CopilotInteractionComposingWithHandler", () => {
    it("subscribes to a custom workflow, reasoning, waiting, and continuation", () => {
        const copilot = new CopilotHandler<"report">({ registrations: [] });
        const scope = { type: "report" as const };
        const { unmount } = render(
            <CopilotInteractionComposingWithHandler copilot={copilot} scope={scope}>
                <div>Report editor</div>
            </CopilotInteractionComposingWithHandler>,
        );
        expect(screen.queryByTestId("gd-copilot-composing-overlay")).not.toBeInTheDocument();

        act(() => {
            copilot.startGeneration("report");
            copilot.handleEvent({
                type: "chatUserMessage",
                threadId: "thread",
                question: "Build",
                objects: [],
            });
            copilot.handleEvent({ type: "chatReasoning", threadId: "thread", title: "Selecting a layout" });
        });
        expect(screen.getByRole("status")).toHaveTextContent("Selecting a layout");

        act(() =>
            copilot.handleEvent({
                type: "chatAssistantMessage",
                useCase: "GENERAL",
                threadId: "thread",
                responseCompleted: true,
            }),
        );
        expect(screen.getByRole("status")).toHaveTextContent("Waiting for your reply");

        act(() =>
            copilot.handleEvent({
                type: "chatUserMessage",
                threadId: "thread",
                question: "Continue",
                objects: [],
            }),
        );
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByTestId("gd-copilot-composing-overlay")).toBeInTheDocument();

        const dispose = vi.spyOn(copilot, "dispose");
        unmount();
        expect(dispose).not.toHaveBeenCalled();
    });

    it("isolates instances and releases the old subscription when replacing the handler", () => {
        const first = new CopilotHandler<"report">({ registrations: [] });
        const second = new CopilotHandler<"report">({ registrations: [] });
        const subscribe = first.subscribe;
        const unsubscribe = vi.fn();
        vi.spyOn(first, "subscribe").mockImplementation((listener) => {
            const stop = subscribe(listener);
            return () => {
                unsubscribe();
                stop();
            };
        });
        const scope = { type: "report" as const };
        const { rerender } = render(
            <CopilotInteractionComposingWithHandler copilot={first} scope={scope}>
                <div>Editor</div>
            </CopilotInteractionComposingWithHandler>,
        );
        act(() => second.startGeneration("report"));
        expect(screen.queryByTestId("gd-copilot-composing-overlay")).not.toBeInTheDocument();

        rerender(
            <CopilotInteractionComposingWithHandler copilot={second} scope={scope}>
                <div>Editor</div>
            </CopilotInteractionComposingWithHandler>,
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("gd-copilot-composing-overlay")).toBeInTheDocument();
        act(() => first.startGeneration("report"));
        expect(second.getStatus(scope)).toBe("generating");
    });

    it("filters unrelated build types and targets", () => {
        const copilot = new CopilotHandler<"report" | "metric">({ registrations: [] });
        copilot.startGeneration("metric");
        render(
            <CopilotInteractionComposingWithHandler
                copilot={copilot}
                scope={{ type: "report", objectId: "a" }}
            >
                <div>Report editor</div>
            </CopilotInteractionComposingWithHandler>,
        );
        act(() => {
            copilot.definitionApplicationStarted({ target: { type: "report", objectId: "b" } });
        });
        expect(screen.queryByTestId("gd-copilot-composing-overlay")).not.toBeInTheDocument();
        act(() => {
            copilot.definitionApplicationStarted({ target: { type: "report", objectId: "a" } });
        });
        expect(screen.getByTestId("gd-copilot-composing-overlay")).toBeInTheDocument();
    });
});
