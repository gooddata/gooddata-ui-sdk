// (C) 2007-2025 GoodData Corporation
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "../Input.js";
import { InputPureProps } from "../InputPure.js";
import { describe, it, expect, vi } from "vitest";

describe("Input", () => {
    function renderInput(options: Partial<InputPureProps> = {}) {
        const props = {
            onChange: vi.fn(),
            ...options,
        };
        return render(<Input {...props} />);
    }

    describe("With configured callbacks", () => {
        it("should not render prefix and suffix", () => {
            renderInput();

            expect(screen.queryByLabelText("Input prefix")).not.toBeInTheDocument();
            expect(screen.queryByLabelText("Input suffix")).not.toBeInTheDocument();
        });

        it("should render prefix", () => {
            renderInput({
                prefix: "pre",
            });

            expect(screen.getByText("pre")).toBeInTheDocument();
        });

        it("should render suffix", () => {
            renderInput({
                suffix: "post",
            });

            expect(screen.getByText("post")).toBeInTheDocument();
        });

        it("should not disable the input", () => {
            renderInput({ placeholder: "input placeholder" });

            expect(screen.getByPlaceholderText("input placeholder")).toBeEnabled();
        });

        it("should disable the input", () => {
            renderInput({
                placeholder: "input placeholder",
                disabled: true,
            });

            expect(screen.getByPlaceholderText("input placeholder")).toBeDisabled();
        });

        it("should make the input readonly", () => {
            renderInput({
                placeholder: "input placeholder",
                readonly: true,
            });

            expect(screen.getByPlaceholderText("input placeholder")).toHaveAttribute("readonly");
        });

        it("should call onChange when value changed", () => {
            const changedText = "New text";
            const onChange = vi.fn();
            renderInput({
                placeholder: "input placeholder",
                onChange,
            });

            fireEvent.change(screen.getByPlaceholderText("input placeholder"), {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).toHaveBeenCalledWith(changedText, expect.anything());
        });

        it("should not clear on Escape", () => {
            renderInput({
                placeholder: "input placeholder",
                value: "test",
            });

            fireEvent.keyDown(screen.getByPlaceholderText("input placeholder"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            expect(screen.queryByDisplayValue("test")).toBeInTheDocument();
        });

        it("should clear on Escape", () => {
            renderInput({
                placeholder: "input placeholder",
                value: "test",
                clearOnEsc: true,
            });

            expect(screen.queryByDisplayValue("test")).toBeInTheDocument();

            fireEvent.keyDown(screen.getByPlaceholderText("input placeholder"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            expect(screen.queryByDisplayValue("test")).not.toBeInTheDocument();
        });

        it("should not call onChange when value stays empty", () => {
            const changedText = "";
            const onChange = vi.fn();
            renderInput({ onChange, placeholder: "input placeholder" });
            fireEvent.change(screen.getByPlaceholderText("input placeholder"), {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).not.toHaveBeenCalled();
        });

        it("should clear input when clear icon is clicked", () => {
            renderInput({ value: "test", clearOnEsc: true });

            expect(screen.queryByDisplayValue("test")).toBeInTheDocument();

            fireEvent.click(screen.getByLabelText("Input clear"));

            expect(screen.queryByDisplayValue("test")).not.toBeInTheDocument();
        });

        it("should call onChange only once when changed twice with the same value", () => {
            const changedText = "New text";
            const onChange = vi.fn();
            renderInput({ onChange, placeholder: "input placeholder" });

            const input = screen.getByPlaceholderText("input placeholder");
            fireEvent.change(input, {
                target: {
                    value: changedText,
                },
            });
            fireEvent.change(input, {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it("should call onEscKeyPress esc key is pressed", () => {
            const onEscKeyPress = vi.fn();
            renderInput({ onEscKeyPress, placeholder: "input placeholder", value: "test" });
            fireEvent.keyDown(screen.getByPlaceholderText("input placeholder"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            expect(onEscKeyPress).toHaveBeenCalledTimes(1);
        });

        it("should call onEnterKeyPress esc key is pressed", () => {
            const onEnterKeyPress = vi.fn();
            renderInput({ onEnterKeyPress, placeholder: "input placeholder", value: "test" });
            fireEvent.keyDown(screen.getByPlaceholderText("input placeholder"), {
                key: "Enter",
                keyCode: 13,
                which: 13,
            });

            expect(onEnterKeyPress).toHaveBeenCalledTimes(1);
        });
    });
});
