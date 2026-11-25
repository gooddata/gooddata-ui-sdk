// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
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
