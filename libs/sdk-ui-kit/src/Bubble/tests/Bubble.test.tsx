// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Bubble, IBubbleProps } from "../Bubble.js";

function renderBubble(options: Partial<IBubbleProps>) {
    return render(<Bubble {...options}>lorem ipsum</Bubble>);
}

describe("Bubble", () => {
    describe("render", () => {
        it("should have correct default align points", async () => {
            renderBubble({});

            await waitFor(
                () => {
                    expect(document.querySelector(".target-bl")).toBeInTheDocument();
                    expect(document.querySelector(".self-tl")).toBeInTheDocument();
                },
                { timeout: 100 },
            );
        });
    });
});
