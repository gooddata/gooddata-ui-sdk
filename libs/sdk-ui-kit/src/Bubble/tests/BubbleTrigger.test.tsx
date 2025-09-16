// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Bubble } from "../Bubble.js";
import { BubbleFocusTrigger, BubbleFocusTriggerProps } from "../BubbleFocusTrigger.js";
import { BubbleHoverTrigger, IBubbleHoverTriggerProps } from "../BubbleHoverTrigger.js";

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

        it("should show bubble on mouseEnter and hide bubble on mouseLeave", async () => {
            renderBubbleHoverTrigger({});

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();

            fireEvent.mouseEnter(screen.queryByText("Hover me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
            });

            fireEvent.mouseLeave(screen.queryByText("Hover me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
            });
        });

        it("should hide bubble on mouse enter after set delay", async () => {
            renderBubbleHoverTrigger({ hoverHideDelay: 500 });

            fireEvent.mouseEnter(screen.queryByText("Hover me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
            });
        });

        it("should not hide bubble on mouse enter after delay by default", async () => {
            renderBubbleHoverTrigger({});

            fireEvent.mouseEnter(screen.queryByText("Hover me"));

            await waitFor(
                () => {
                    expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
                },
                { timeout: 1000 },
            );
        });
    });

    describe("BubbleFocusTrigger", () => {
        it("should show bubble on focus and hide bubble on blur", async () => {
            renderBubbleFocusTrigger({});

            expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();

            fireEvent.focus(screen.queryByText("Focus me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).toBeInTheDocument();
            });

            fireEvent.blur(screen.queryByText("Focus me"));

            await waitFor(() => {
                expect(screen.queryByText("Bubble with some content")).not.toBeInTheDocument();
            });
        });
    });
});
