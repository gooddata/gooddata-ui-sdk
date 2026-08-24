// (C) 2007-2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Bubble } from "./Bubble.js";
import { BubbleFocusTrigger, type BubbleFocusTriggerProps } from "./BubbleFocusTrigger.js";
import {
    BubbleHoverTrigger,
    HIDE_DELAY,
    type IBubbleHoverTriggerProps,
    SHOW_DELAY,
} from "./BubbleHoverTrigger.js";

function renderBubble() {
    return <Bubble>Bubble with some content</Bubble>;
}

function renderBubbleHoverTrigger(options: Partial<IBubbleHoverTriggerProps>) {
    return render(
        <BubbleHoverTrigger {...options}>
            <div>Hover me</div>
            {renderBubble()}
        </BubbleHoverTrigger>,
    );
}

function renderBubbleFocusTrigger(options: Partial<BubbleFocusTriggerProps>) {
    return render(
        <BubbleFocusTrigger {...options}>
            <div>Focus me</div>
            {renderBubble()}
        </BubbleFocusTrigger>,
    );
}

describe("BubbleTrigger", () => {
    describe("BubbleHoverTrigger", () => {
        // The trigger schedules the show/hide transitions with window.setTimeout. Waiting for those
        // delays in wall-clock time made the assertions race the scheduler: the "visible" window of
        // the hoverHideDelay case is only open between SHOW_DELAY and SHOW_DELAY + hoverHideDelay,
        // which a loaded CI machine can easily step over before waitFor gets to poll. Driving the
        // clock explicitly keeps the tests deterministic (and instant).
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        function advanceBy(ms: number) {
            act(() => {
                vi.advanceTimersByTime(ms);
            });
        }

        it("should render as span", () => {
            const { container } = renderBubbleHoverTrigger({});

            expect(container.querySelector("span.gd-bubble-trigger")).toBeInTheDocument();
        });

        it("should render as div", () => {
            const { container } = renderBubbleHoverTrigger({
                tagName: "div",
            });

            expect(container.querySelector("div.gd-bubble-trigger")).toBeInTheDocument();
        });

        it("should propagate data attributes", () => {
            const { container } = renderBubbleHoverTrigger({
                // @ts-expect-error data attributes are allowed in JSX but not directly in props type
                "data-attribute": "test",
            });

            expect(container.querySelector('[data-attribute="test"]')).toBeInTheDocument();
        });

        it("should show bubble on mouseEnter and hide bubble on mouseLeave", () => {
            renderBubbleHoverTrigger({});

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();

            fireEvent.mouseEnter(screen.getByText("Hover me"));
            advanceBy(SHOW_DELAY);

            expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();

            fireEvent.mouseLeave(screen.getByText("Hover me"));
            advanceBy(HIDE_DELAY);

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
        });

        it("should hide bubble on mouse enter after set delay", () => {
            const hoverHideDelay = 500;
            renderBubbleHoverTrigger({ hoverHideDelay });

            fireEvent.mouseEnter(screen.getByText("Hover me"));
            advanceBy(SHOW_DELAY);

            expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();

            advanceBy(hoverHideDelay);

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
        });

        it("should not hide bubble on mouse enter after delay by default", () => {
            renderBubbleHoverTrigger({});

            fireEvent.mouseEnter(screen.getByText("Hover me"));
            advanceBy(SHOW_DELAY);

            expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();

            advanceBy(5000);

            expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
        });
    });

    describe("BubbleFocusTrigger", () => {
        it("should show bubble on focus and hide bubble on blur", async () => {
            renderBubbleFocusTrigger({});

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();

            fireEvent.focus(screen.getByText("Focus me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
            });

            fireEvent.blur(screen.getByText("Focus me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
            });
        });
    });
});
