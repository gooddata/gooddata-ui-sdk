// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input.js";
import { type IInputPureProps } from "./InputPure.js";

describe("Input", () => {
    function renderInput(options: Partial<IInputPureProps> = {}) {
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

    describe("With externally changed value", () => {
        it("should render the new value when the value prop changes", () => {
            const onChange = vi.fn();
            const { rerender } = render(
                <Input onChange={onChange} placeholder="input placeholder" value="old" />,
            );

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("old");

            rerender(<Input onChange={onChange} placeholder="input placeholder" value="new" />);

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("new");
            expect(onChange).toHaveBeenCalledWith("new");
        });

        it("should normalize an invalid value prop and notify the consumer", () => {
            const onChange = vi.fn();
            const { rerender } = render(
                <Input onChange={onChange} placeholder="input placeholder" value="test" />,
            );

            rerender(<Input onChange={onChange} placeholder="input placeholder" value={Number.NaN} />);

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("");
            expect(onChange).toHaveBeenCalledWith("");
        });

        it("should keep a value typed after the value prop was normalized from NaN", () => {
            const onChange = vi.fn();
            const { rerender } = render(
                <Input onChange={onChange} placeholder="input placeholder" value={Number.NaN} />,
            );

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("");

            fireEvent.change(screen.getByPlaceholderText("input placeholder"), {
                target: { value: "typed" },
            });

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("typed");

            onChange.mockClear();
            rerender(<Input onChange={onChange} placeholder="input placeholder" value={Number.NaN} />);

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("typed");
            expect(onChange).not.toHaveBeenCalled();
        });

        it("should keep the typed value when the value prop stays the same", () => {
            const onChange = vi.fn();
            const { rerender } = render(
                <Input onChange={onChange} placeholder="input placeholder" value="test" />,
            );

            fireEvent.change(screen.getByPlaceholderText("input placeholder"), {
                target: { value: "typed" },
            });
            onChange.mockClear();

            rerender(<Input onChange={onChange} placeholder="input placeholder" value="test" />);

            expect(screen.getByPlaceholderText("input placeholder")).toHaveValue("typed");
            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
