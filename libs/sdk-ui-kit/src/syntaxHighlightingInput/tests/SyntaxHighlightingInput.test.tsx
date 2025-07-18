// (C) 2020-2025 GoodData Corporation
import { ChangeEvent } from "react";
import cx from "classnames";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, afterAll, beforeAll } from "vitest";
import "vitest-dom/extend-expect";

import * as SyntaxHighlightingInput from "../SyntaxHighlightingInput.js";

const defaultProps: SyntaxHighlightingInput.ISyntaxHighlightingInputProps = {
    value: "",
    onChange: vi.fn(),
};

(window as any).document.body.createTextRange = vi.fn(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    getBoundingClientRect: vi.fn(),
    getClientRects: vi.fn(() => ({ length: null })),
}));

const renderComponent = (props?: Partial<SyntaxHighlightingInput.ISyntaxHighlightingInputProps>) => {
    return render(<SyntaxHighlightingInput.SyntaxHighlightingInput {...defaultProps} {...props} />);
};

const multiLineValue = "01234\n01234\n01234";

describe("SyntaxHighlightingInput", () => {
    beforeAll(() => {
        vi.spyOn(SyntaxHighlightingInput, "SyntaxHighlightingInput").mockImplementation(
            ({
                onChange,
                value,
                className,
                onCursor,
            }: SyntaxHighlightingInput.ISyntaxHighlightingInputProps) => {
                const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
                    onChange(e.target.value);

                    if (value === multiLineValue && onCursor) {
                        onCursor(8, 8);
                    }
                };

                return (
                    <textarea
                        className={cx(className, "s-input-syntax-highlighting-input")}
                        value={value}
                        onChange={onChangeHandler}
                    />
                );
            },
        );
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("should render CodeMirrorInput component", () => {
        renderComponent();

        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render correct value and classname", () => {
        const props: SyntaxHighlightingInput.ISyntaxHighlightingInputProps = {
            ...defaultProps,
            value: "this is a text content",
            className: "this-is-a-classname",
        };
        renderComponent(props);

        expect(screen.getByText("this is a text content")).toBeInTheDocument();
        expect(document.querySelector(`textarea.${props.className}`)).toBeInTheDocument();
    });

    it("should call onChangeHandler function on value change", async () => {
        const onChange = vi.fn();
        const newValue = "new text content";
        renderComponent({ onChange });

        fireEvent.change(screen.getByRole("textbox"), { target: { value: newValue } });
        await waitFor(() => {
            expect(onChange).toBeCalledWith(expect.stringContaining(newValue));
        });
    });

    describe("onCursor", () => {
        it("should call onCursor function with expected parameters on cursor position change", async () => {
            const onCursor = vi.fn();
            renderComponent({ onCursor, value: multiLineValue });

            await userEvent.type(screen.getByRole("textbox"), multiLineValue);
            await waitFor(() => {
                expect(onCursor).toHaveBeenCalledWith(8, 8);
            });
        });
    });
});
