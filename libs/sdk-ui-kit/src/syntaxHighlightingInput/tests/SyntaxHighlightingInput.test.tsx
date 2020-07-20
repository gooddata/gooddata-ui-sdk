// (C) 2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper as MountWrapper } from "enzyme";
import { UnControlled as CodeMirrorInput } from "react-codemirror2";

import { SyntaxHighlightingInput, ISyntaxHighlightingInputProps } from "../SyntaxHighlightingInput";

(window as any).document.body.createTextRange = jest.fn(() => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    getBoundingClientRect: jest.fn(),
    getClientRects: jest.fn(() => ({ length: null })),
}));

const defaultProps: ISyntaxHighlightingInputProps = {
    value: "",
    onChange: jest.fn(),
};

interface ICodeMirrorInputInstance extends CodeMirrorInput {
    editor: CodeMirror.Editor;
}

const renderComponent = (props?: Partial<ISyntaxHighlightingInputProps>) => {
    return mount(<SyntaxHighlightingInput {...defaultProps} {...props} />);
};

const getCodeMirrorDocument = (wrapper: MountWrapper) => {
    const instance = wrapper.find(CodeMirrorInput).instance() as ICodeMirrorInputInstance;
    return instance.editor.getDoc();
};

const triggerCodeMirrorBlur = (wrapper: MountWrapper) => {
    const instance = wrapper.find(CodeMirrorInput).instance() as ICodeMirrorInputInstance;
    const editor = instance.editor;
    wrapper.find(CodeMirrorInput).props().onBlur?.(editor);
};

describe("SyntaxHighlightingInput", () => {
    it("should render CodeMirrorInput component", () => {
        const wrapper = renderComponent();
        expect(wrapper.find(CodeMirrorInput)).toHaveLength(1);
    });

    it("should render correct value and classname", () => {
        const props: ISyntaxHighlightingInputProps = {
            ...defaultProps,
            value: "this is a text content",
            className: "this-is-a-classname",
        };
        const wrapper = renderComponent(props);
        const doc = getCodeMirrorDocument(wrapper);

        expect(doc.getValue()).toEqual(props.value);
        expect(wrapper.find(`div.${props.className}`)).toHaveLength(1);
    });

    it("should call onChangeHandler function on value change", () => {
        const onChange = jest.fn();
        const wrapper = renderComponent({ onChange });

        const newValue = "new text content";
        const doc = getCodeMirrorDocument(wrapper);
        doc.setValue(newValue);

        expect(onChange).toHaveBeenCalledWith(newValue);
    });

    describe("onCursor", () => {
        const multiLineValue = "01234\n01234\n01234";

        it("should call onCursor function on editor blur with expected parameters", () => {
            const onCursor = jest.fn();
            const wrapper = renderComponent({ onCursor, value: multiLineValue });

            const doc = getCodeMirrorDocument(wrapper);
            doc.setCursor({ line: 1, ch: 2 });

            triggerCodeMirrorBlur(wrapper);

            expect(onCursor).toHaveBeenCalledWith(8, 8);
        });

        it("should call onCursor function on value change with expected parameters", () => {
            const onCursor = jest.fn();
            const wrapper = renderComponent({ onCursor, value: multiLineValue });

            const doc = getCodeMirrorDocument(wrapper);
            doc.setValue("text");

            expect(onCursor).toHaveBeenCalledWith(0, 0);
        });

        it("should call onCursor function with expected parameters for multiline selection", () => {
            const onCursor = jest.fn();
            const wrapper = renderComponent({ onCursor, value: multiLineValue });

            const doc = getCodeMirrorDocument(wrapper);
            doc.setSelection({ line: 0, ch: 3 }, { line: 2, ch: 2 });

            triggerCodeMirrorBlur(wrapper);

            expect(onCursor).toHaveBeenCalledWith(3, 14);
        });
    });
});
