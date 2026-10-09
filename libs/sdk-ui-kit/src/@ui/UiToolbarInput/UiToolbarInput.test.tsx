// (C) 2026 GoodData Corporation

import { useState } from "react";

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { type IUiToolbarInputProps, UiToolbarInput } from "./UiToolbarInput.js";

const A11Y = { ariaLabel: "Width", unitLabel: "pixels" };

function renderInput(props: Partial<IUiToolbarInputProps> = {}) {
    const onCommit = vi.fn();
    const result = render(
        <UiToolbarInput value="120" onCommit={onCommit} unit="px" accessibilityConfig={A11Y} {...props} />,
    );
    return { ...result, onCommit };
}

describe("UiToolbarInput", () => {
    it("names the field by its full name and describes it by the unit", () => {
        renderInput({ prefix: "W" });

        const input = screen.getByRole("textbox", { name: "Width" });
        expect(input).toHaveValue("120");
        expect(input).toHaveAccessibleDescription("pixels");
        expect(screen.getByText("W")).toHaveAttribute("aria-hidden", "true");
    });

    it("commits the typed text on Enter", async () => {
        const { user, onCommit } = renderInput();
        const input = screen.getByRole("textbox", { name: "Width" });

        await user.clear(input);
        await user.type(input, "240{Enter}");

        expect(onCommit).toHaveBeenCalledWith("240");
    });

    it("reverts the typed text on Escape and commits it on blur", async () => {
        const { user, onCommit } = renderInput();
        const input = screen.getByRole("textbox", { name: "Width" });

        await user.clear(input);
        await user.type(input, "5{Escape}");
        expect(input).toHaveValue("120");
        expect(onCommit).not.toHaveBeenCalled();

        await user.clear(input);
        await user.type(input, "5");
        await user.tab();
        expect(onCommit).toHaveBeenCalledWith("5");
    });

    it("does not commit an unchanged value on blur", async () => {
        const { user, onCommit } = renderInput();

        await user.click(screen.getByRole("textbox", { name: "Width" }));
        await user.tab();

        expect(onCommit).not.toHaveBeenCalled();
    });

    it("steps with the vertical arrows, by a large step while Shift is held", async () => {
        const onStep = vi.fn();
        const { user } = renderInput({ onStep });

        screen.getByRole("textbox", { name: "Width" }).focus();
        await user.keyboard("{ArrowUp}{ArrowDown}{Shift>}{ArrowUp}{/Shift}");

        expect(onStep.mock.calls).toEqual([
            [1, false],
            [-1, false],
            [1, true],
        ]);
    });

    it("shows the value a clamping parent keeps after a commit, and commits once", async () => {
        const onCommit = vi.fn();
        function Harness() {
            const [value, setValue] = useState("100");
            return (
                <UiToolbarInput
                    value={value}
                    onCommit={(text) => {
                        onCommit(text);
                        setValue(String(Math.min(Number(text), 100)));
                    }}
                    accessibilityConfig={A11Y}
                />
            );
        }
        const { user } = render(<Harness />);
        const input = screen.getByRole("textbox", { name: "Width" });

        await user.clear(input);
        await user.type(input, "500{Enter}");
        await user.tab();

        expect(input).toHaveValue("100");
        expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it("keeps the typed text while the parent marks it invalid, and commits it once", async () => {
        const onCommit = vi.fn();
        function Harness() {
            const [isInvalid, setIsInvalid] = useState(false);
            return (
                <UiToolbarInput
                    value="120"
                    onCommit={(text) => {
                        onCommit(text);
                        setIsInvalid(Number.isNaN(Number(text)));
                    }}
                    isInvalid={isInvalid}
                    accessibilityConfig={A11Y}
                />
            );
        }
        const { user } = render(<Harness />);
        const input = screen.getByRole("textbox", { name: "Width" });

        await user.clear(input);
        await user.type(input, "abc{Enter}");
        await user.tab();

        expect(input).toHaveValue("abc");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(onCommit).toHaveBeenCalledTimes(1);

        // Typing the same text again is a new attempt.
        await user.clear(input);
        await user.type(input, "abc{Enter}");
        expect(onCommit).toHaveBeenCalledTimes(2);
    });

    it("announces a stepped value with its unit but not the typed text", async () => {
        function Harness() {
            const [value, setValue] = useState("120");
            return (
                <UiToolbarInput
                    value={value}
                    onCommit={setValue}
                    onStep={(direction) => setValue((current) => String(Number(current) + direction))}
                    unit="px"
                    accessibilityConfig={A11Y}
                />
            );
        }
        const { user } = render(<Harness />);
        const input = screen.getByRole("textbox", { name: "Width" });

        input.focus();
        await user.keyboard("{ArrowUp}");
        expect(screen.getByRole("status")).toHaveTextContent("Width 121 pixels");

        await user.type(input, "5");
        expect(input).toHaveValue("1215");
        expect(screen.getByRole("status")).toHaveTextContent("Width 121 pixels");

        expect(input).toHaveAccessibleName("Width");
        expect(input).toHaveAccessibleDescription("pixels");
    });

    it("follows a new committed value", () => {
        const { rerender } = renderInput();

        rerender(<UiToolbarInput value="80" onCommit={() => {}} accessibilityConfig={A11Y} />);

        expect(screen.getByRole("textbox", { name: "Width" })).toHaveValue("80");
    });

    it("keeps a disabled field read-only", async () => {
        const onStep = vi.fn();
        const { user, onCommit } = renderInput({ isDisabled: true, onStep });
        const input = screen.getByRole("textbox", { name: "Width" });

        expect(input).toHaveAttribute("readonly");
        input.focus();
        await user.keyboard("{ArrowUp}{Enter}");
        expect(onStep).not.toHaveBeenCalled();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("marks an invalid value", () => {
        renderInput({ isInvalid: true });

        expect(screen.getByRole("textbox", { name: "Width" })).toHaveAttribute("aria-invalid", "true");
    });
});
