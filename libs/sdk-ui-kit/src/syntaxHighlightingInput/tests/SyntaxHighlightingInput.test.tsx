// (C) 2020-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { mount } from "enzyme";

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
    return mount(<SyntaxHighlightingInput.SyntaxHighlightingInput {...defaultProps} {...props} />);
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
        const wrapper = renderComponent();

        expect(wrapper.find(".s-input-syntax-highlighting-input")).toHaveLength(1);
    });

    it("should render correct value and classname", () => {
        const props: SyntaxHighlightingInput.ISyntaxHighlightingInputProps = {
            ...defaultProps,
            value: "this is a text content",
            className: "this-is-a-classname",
        };
        const wrapper = renderComponent(props);
        const value = wrapper.find("textarea").text();

        expect(value).toEqual(props.value);
        expect(wrapper.find(`textarea.${props.className}`)).toHaveLength(1);
    });

    it("should call onChangeHandler function on value change", async () => {
        const onChange = jest.fn();
        const newValue = "new text content";
        const wrapper = renderComponent({ onChange });

        wrapper.find("textarea").simulate("change", { target: { value: newValue } });
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    describe("onCursor", () => {
        it("should call onCursor function with expected parameters on cursor position change", () => {
            const onCursor = jest.fn();
            const wrapper = renderComponent({ onCursor, value: multiLineValue });
            wrapper.find("textarea").simulate("change", { target: { value: multiLineValue } });

            expect(onCursor).toHaveBeenCalledWith(8, 8);
        });
    });
});
