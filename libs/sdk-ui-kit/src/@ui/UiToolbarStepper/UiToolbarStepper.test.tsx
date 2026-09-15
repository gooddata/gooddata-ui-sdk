// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { type IUiToolbarStepperProps, UiToolbarStepper } from "./UiToolbarStepper.js";

const A11Y = { ariaLabel: "Zoom", incrementLabel: "Zoom in", decrementLabel: "Zoom out" };

function renderStepper(props: Partial<IUiToolbarStepperProps> = {}) {
    const onStep = vi.fn();
    const onCommit = vi.fn();
    const result = render(
        <UiToolbarStepper
            variant="value"
            value="100%"
            onStep={onStep}
            onCommit={onCommit}
            accessibilityConfig={A11Y}
            {...props}
        />,
    );
    return { ...result, onStep, onCommit };
}

describe("UiToolbarStepper", () => {
    it("steps with the side controls", async () => {
        const { user, onStep } = renderStepper();

        await user.click(screen.getByRole("button", { name: "Zoom out" }));
        await user.click(screen.getByRole("button", { name: "Zoom in" }));

        expect(onStep.mock.calls).toEqual([[-1], [1]]);
    });

    it("steps from the keyboard even inside a dropdown-like wrapper", async () => {
        const wrapperKeyDown = vi.fn((event: KeyboardEvent) => {
            if (event.code === "Enter") {
                event.preventDefault();
            }
        });
        const onStep = vi.fn();
        const { user } = render(
            <div onKeyDown={wrapperKeyDown}>
                <UiToolbarStepper variant="value" value="100%" onStep={onStep} accessibilityConfig={A11Y} />
            </div>,
        );

        screen.getByRole("button", { name: "Zoom in" }).focus();
        await user.keyboard("{Enter}{ArrowDown}{ArrowUp}");

        expect(wrapperKeyDown).not.toHaveBeenCalled();
        expect(onStep).toHaveBeenCalledWith(1);
    });

    it("keeps popup keys of a disabled value away from a dropdown-like wrapper", async () => {
        const wrapperKeyDown = vi.fn();
        const onCommit = vi.fn();
        const { user } = render(
            <div onKeyDown={wrapperKeyDown}>
                <UiToolbarStepper
                    variant="value"
                    value="100%"
                    onStep={() => {}}
                    onCommit={onCommit}
                    accessibilityConfig={A11Y}
                    isDisabled
                />
            </div>,
        );

        screen.getByRole("textbox", { name: "Zoom" }).focus();
        await user.keyboard("{Enter}{ArrowDown}");

        expect(wrapperKeyDown).not.toHaveBeenCalled();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("disables one side at the end of the range", async () => {
        const { user, onStep } = renderStepper({ canStepUp: false });

        const increase = screen.getByRole("button", { name: "Zoom in" });
        expect(increase).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByRole("button", { name: "Zoom out" })).not.toHaveAttribute("aria-disabled");

        await user.click(increase);
        expect(onStep).not.toHaveBeenCalled();
    });

    it("commits the typed value on Enter", async () => {
        const { user, onCommit } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        await user.clear(input);
        await user.type(input, "150%");
        await user.keyboard("{Enter}");

        expect(onCommit).toHaveBeenCalledWith("150%");
    });

    it("reverts the typed value on Escape without committing", async () => {
        const { user, onCommit } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        await user.clear(input);
        await user.type(input, "150%");
        await user.keyboard("{Escape}");

        expect(input).toHaveValue("100%");
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("reverts the draft on blur and follows a new committed value", async () => {
        const { user, rerender } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        await user.clear(input);
        await user.type(input, "5");
        await user.tab();
        expect(input).toHaveValue("100%");

        rerender(
            <UiToolbarStepper
                variant="value"
                value="75%"
                onStep={() => {}}
                onCommit={() => {}}
                accessibilityConfig={A11Y}
            />,
        );
        expect(screen.getByRole("textbox", { name: "Zoom" })).toHaveValue("75%");
    });

    it("steps with ArrowUp and ArrowDown inside the input", async () => {
        const { user, onStep } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        input.focus();
        await user.keyboard("{ArrowUp}{ArrowDown}");

        expect(onStep.mock.calls).toEqual([[1], [-1]]);
    });

    it("leaves keys to the input method while it is composing", async () => {
        const { onStep, onCommit } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        input.focus();
        for (const key of ["ArrowUp", "ArrowDown", "Enter"]) {
            fireEvent.keyDown(input, { code: key, key, isComposing: true });
        }

        expect(onStep).not.toHaveBeenCalled();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("ignores vertical arrows held with a system modifier", async () => {
        const { user, onStep } = renderStepper();
        const input = screen.getByRole("textbox", { name: "Zoom" });

        input.focus();
        await user.keyboard("{Control>}{ArrowUp}{/Control}{Meta>}{ArrowDown}{/Meta}");

        expect(onStep).not.toHaveBeenCalled();
    });

    it("renders a readout for pagination and announces the value", () => {
        render(
            <UiToolbarStepper
                variant="pagination"
                value="1 / 2"
                onStep={() => {}}
                accessibilityConfig={{
                    ariaLabel: "Page",
                    incrementLabel: "Next page",
                    decrementLabel: "Previous page",
                }}
            />,
        );

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(screen.getByRole("status", { name: "Page" })).toHaveTextContent("1 / 2");
        screen.getByRole("button", { name: "Next page" });
        screen.getByRole("button", { name: "Previous page" });
    });

    it("spreads combobox attributes on the input", () => {
        renderStepper({
            isOpen: true,
            ariaAttributes: {
                role: "combobox",
                "aria-haspopup": "listbox",
                "aria-expanded": true,
                "aria-controls": "presets",
            },
        });

        const input = screen.getByRole("combobox", { name: "Zoom" });
        expect(input).toHaveAttribute("aria-controls", "presets");
        expect(input).toHaveClass("gd-ui-kit-toolbar-stepper__value--isActive");
    });
});
