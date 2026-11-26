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

function DateFilterWithListbox() {
    const dateFilterContainerRef = useRef<HTMLDivElement>(null);
    const dateFilterBodyRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={dateFilterContainerRef}
            onKeyDown={createDateFilterKeyboardHandler({ dateFilterContainerRef, dateFilterBodyRef })}
        >
            <div ref={dateFilterBodyRef}>
                <button role="tab" aria-selected="true">
                    Standard calendar
                </button>
                <div role="listbox" aria-label="Select a date range">
                    <button role="option" aria-selected={false} tabIndex={-1}>
                        All time
                    </button>
                    <button role="option" aria-selected tabIndex={0}>
                        Last 7 days
                    </button>
                    <button role="option" aria-selected={false} tabIndex={-1}>
                        Last 60 minutes
                    </button>
                </div>
                <button>Static period</button>
            </div>
        </div>
    );
}

describe("createDateFilterKeyboardHandler", () => {
    describe("list box as a single Tab stop", () => {
        it.each(["All time", "Last 7 days", "Last 60 minutes"])(
            "moves Tab focus out of the list box from %s",
            (name) => {
                render(<DateFilterWithListbox />);
                const option = screen.getByRole("option", { name });
                option.focus();

                fireEvent.keyDown(option, { key: "Tab", code: "Tab" });

                expect(screen.getByRole("button", { name: "Static period" })).toHaveFocus();
            },
        );

        it.each(["All time", "Last 7 days", "Last 60 minutes"])(
            "moves Shift+Tab focus out of the list box from %s",
            (name) => {
                render(<DateFilterWithListbox />);
                const option = screen.getByRole("option", { name });
                option.focus();

                fireEvent.keyDown(option, { key: "Tab", code: "Tab", shiftKey: true });

                expect(screen.getByRole("tab", { name: "Standard calendar" })).toHaveFocus();
            },
        );

        it("moves focus with arrows and then leaves the list box with one Tab", () => {
            render(<DateFilterWithListbox />);
            const selected = screen.getByRole("option", { name: "Last 7 days" });
            selected.focus();

            fireEvent.keyDown(selected, { key: "ArrowDown", code: "ArrowDown" });
            const next = screen.getByRole("option", { name: "Last 60 minutes" });
            expect(next).toHaveFocus();

            fireEvent.keyDown(next, { key: "Tab", code: "Tab" });
            expect(screen.getByRole("button", { name: "Static period" })).toHaveFocus();
        });

        it("enters the list box on the selected option", () => {
            render(<DateFilterWithListbox />);
            const tab = screen.getByRole("tab", { name: "Standard calendar" });
            tab.focus();

            fireEvent.keyDown(tab, { key: "Tab", code: "Tab" });

            expect(screen.getByRole("option", { name: "Last 7 days" })).toHaveFocus();
        });
    });

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
