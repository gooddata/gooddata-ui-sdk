// (C) 2007-2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Bubble, type IBubbleProps } from "./Bubble.js";

function renderBubble(options: Partial<IBubbleProps>) {
    return render(<Bubble {...options}>lorem ipsum</Bubble>);
}

describe("Bubble", () => {
    describe("render", () => {
        it("should have correct default align points", async () => {
            renderBubble({});

            // The align points only land once the overlay has measured and aligned itself, which is
            // asynchronous; the default waitFor timeout is the budget for it. A shorter one buys
            // nothing on a passing run and turns a busy CI worker into a failure.
            await waitFor(() => {
                expect(document.querySelector(".target-bl")).toBeInTheDocument();
                expect(document.querySelector(".self-tl")).toBeInTheDocument();
            });
        });
    });
});
