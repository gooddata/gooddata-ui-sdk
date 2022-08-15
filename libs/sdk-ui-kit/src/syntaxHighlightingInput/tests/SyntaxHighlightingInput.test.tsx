// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as SyntaxHighlightingInput from "../SyntaxHighlightingInput";

const defaultProps: SyntaxHighlightingInput.ISyntaxHighlightingInputProps = {
    value: "",
    onChange: jest.fn(),
};

(window as any).document.body.createTextRange = jest.fn(() => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    getBoundingClientRect: jest.fn(),
    getClientRects: jest.fn(() => ({ length: null })),
}));

const renderComponent = (props?: Partial<SyntaxHighlightingInput.ISyntaxHighlightingInputProps>) => {
    return render(<SyntaxHighlightingInput.SyntaxHighlightingInput {...defaultProps} {...props} />);
};

const multiLineValue = "01234\n01234\n01234";

describe("SyntaxHighlightingInput", () => {
    beforeAll(() => {
        jest.spyOn(SyntaxHighlightingInput, "SyntaxHighlightingInput").mockImplementation(
            ({
                onChange,
                value,
                className,
                onCursor,
            }: SyntaxHighlightingInput.ISyntaxHighlightingInputProps) => {
                const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    onChange(e.target.value);

                    if (value === multiLineValue) {
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
        jest.clearAllMocks();
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
        const onChange = jest.fn();
        const newValue = "new text content";
        renderComponent({ onChange });

        fireEvent.change(screen.getByRole("textbox"), { target: { value: newValue } });
        await waitFor(() => {
            expect(onChange).toBeCalledWith(expect.stringContaining(newValue));
        });
    });

    describe("onCursor", () => {
        it("should call onCursor function with expected parameters on cursor position change", async () => {
            const onCursor = jest.fn();
            renderComponent({ onCursor, value: multiLineValue });

            await userEvent.type(screen.getByRole("textbox"), multiLineValue);
            await waitFor(() => {
                expect(onCursor).toHaveBeenCalledWith(8, 8);
            });
        });
    });
});
