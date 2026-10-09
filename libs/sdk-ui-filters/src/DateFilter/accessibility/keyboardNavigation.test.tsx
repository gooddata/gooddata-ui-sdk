// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createDateFilterKeyboardHandler } from "./keyboardNavigation.js";

function DateFilterContainer() {
    const dateFilterContainerRef = useRef<HTMLDivElement>(null);
    const dateFilterBodyRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={dateFilterContainerRef}
            onKeyDown={createDateFilterKeyboardHandler({ dateFilterContainerRef, dateFilterBodyRef })}
        >
            <div ref={dateFilterBodyRef}>
                <input aria-label="To" />
                <div style={{ display: "none" }}>
                    <div tabIndex={0} />
                </div>
                <button>Cancel</button>
            </div>
        </div>
    );
}

describe("createDateFilterKeyboardHandler", () => {
    it("moves Tab focus past an element hidden by CSS", () => {
        render(<DateFilterContainer />);
        const input = screen.getByRole("textbox", { name: "To" });
        input.focus();

        fireEvent.keyDown(input, { key: "Tab", code: "Tab" });

        expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    });

    it("moves Shift+Tab focus past an element hidden by CSS", () => {
        render(<DateFilterContainer />);
        const button = screen.getByRole("button", { name: "Cancel" });
        button.focus();

        fireEvent.keyDown(button, { key: "Tab", code: "Tab", shiftKey: true });

        expect(screen.getByRole("textbox", { name: "To" })).toHaveFocus();
    });
});
