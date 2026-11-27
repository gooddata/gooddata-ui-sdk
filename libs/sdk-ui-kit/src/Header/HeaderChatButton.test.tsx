// (C) 2026 GoodData Corporation

import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeaderChatButton } from "./HeaderChatButton.js";

function Harness({ isOpen }: { isOpen: boolean }) {
    return (
        <>
            <HeaderChatButton title="Open AI Assistant" isOpen={isOpen} onClick={() => {}} />
            {isOpen ? <input aria-label="Ask here" autoFocus /> : null}
            <button type="button">Other</button>
        </>
    );
}

describe("HeaderChatButton", () => {
    it("should be a collapsed pop-up button when closed", () => {
        render(<Harness isOpen={false} />);

        const button = screen.getByRole("button", { name: "Open AI Assistant" });
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should not repeat its name as its description", () => {
        render(<Harness isOpen={false} />);

        const button = screen.getByRole("button", { name: "Open AI Assistant" });
        expect(button).not.toHaveAttribute("title");
        expect(button).not.toHaveAccessibleDescription("Open AI Assistant");
    });

    it("should show its visual tooltip on keyboard focus without making it the description", async () => {
        render(<Harness isOpen={false} />);

        const button = screen.getByRole("button", { name: "Open AI Assistant" });
        act(() => button.focus());

        const tooltip = await screen.findByText("Open AI Assistant", { selector: "[role='tooltip']" });
        expect(tooltip).toHaveAttribute("aria-hidden", "true");
        expect(button).not.toHaveAccessibleDescription("Open AI Assistant");

        act(() => button.blur());
        await waitFor(() =>
            expect(screen.queryByText("Open AI Assistant", { selector: "[role='tooltip']" })).toBeNull(),
        );
    });

    it("should not show the tooltip while the panel is open", () => {
        render(<Harness isOpen />);

        act(() => screen.getByRole("button", { name: "Open AI Assistant" }).focus());

        expect(screen.queryByText("Open AI Assistant", { selector: "[role='tooltip']" })).toBeNull();
    });

    it("should be expanded when open", () => {
        render(<Harness isOpen />);

        expect(screen.getByRole("button", { name: "Open AI Assistant" })).toHaveAttribute(
            "aria-expanded",
            "true",
        );
    });

    it("should take back the focus lost by closing the panel, already collapsed", () => {
        const { rerender } = render(<Harness isOpen />);
        screen.getByRole("textbox", { name: "Ask here" }).focus();

        rerender(<Harness isOpen={false} />);

        const button = screen.getByRole("button", { name: "Open AI Assistant" });
        expect(button).toHaveFocus();
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should not steal the focus when it was not lost", () => {
        const { rerender } = render(<Harness isOpen />);
        const other = screen.getByRole("button", { name: "Other" });
        other.focus();

        rerender(<Harness isOpen={false} />);

        expect(other).toHaveFocus();
    });
});
