// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";

import { EditableLabel } from "../EditableLabel";
import { IEditableLabelProps, IEditableLabelState } from "../typings";
import Mock = jest.Mock;

function renderEditableLabel(
    options: IEditableLabelProps,
): ReactWrapper<IEditableLabelProps, IEditableLabelState, any> {
    return mount(<EditableLabel {...options} />);
}

describe("EditableLabel", () => {
    describe("lifecycle", () => {
        it("should render in overlay", () => {
            const wrapper = renderEditableLabel({
                value: "",
                textareaInOverlay: true,
                onSubmit: jest.fn(),
            });

            expect(wrapper.find(".gd-editable-label-textarea-wrapper").length).toEqual(0);

            wrapper.find(".gd-editable-label").simulate("click");

            expect(wrapper.find(".gd-editable-label-textarea-wrapper").length).toEqual(1);
        });

        it("should have editing class", () => {
            const wrapper = renderEditableLabel({
                value: "",
                onSubmit: jest.fn(),
            });

            wrapper.find(".gd-editable-label").simulate("click");
            // second trigger should cancel nor change the edit mode
            wrapper.find(".gd-editable-label").simulate("click");

            expect(wrapper.find(".gd-editable-label.is-editing").length).toEqual(1);

            wrapper.unmount();
        });

        it("should be one row high", () => {
            const wrapper = renderEditableLabel({
                value: "",
                onSubmit: jest.fn(),
            });

            wrapper.find(".gd-editable-label").simulate("click");

            expect(wrapper.find("textarea").prop("rows")).toEqual(1);
        });

        it("should not let user enter characters above the limit", () => {
            const wrapper = renderEditableLabel({
                value: "",
                maxLength: 10,
                onSubmit: jest.fn(),
            });

            wrapper.find(".gd-editable-label").simulate("click");

            expect(wrapper.find("textarea").prop("maxLength")).toEqual(10);
        });

        it("should change value when received", () => {
            const wrapper = renderEditableLabel({
                value: "aaa",
                onSubmit: jest.fn(),
            });

            wrapper.find(".gd-editable-label").simulate("click");
            wrapper.setProps({ value: "bbb", onSubmit: jest.fn() });

            expect(wrapper.find("textarea").prop("defaultValue")).toEqual("bbb");
        });
    });

    describe("saving and canceling and change value", () => {
        const renderEditableLabelAndClickIn = ({
            onCancel = jest.fn(),
            onSubmit = jest.fn(),
            onChange = jest.fn(),
        }: {
            onCancel?: Mock;
            onSubmit?: Mock;
            onChange?: Mock;
        }): ReactWrapper<IEditableLabelProps, IEditableLabelState, any> => {
            const wrapper = renderEditableLabel({
                value: "aaa",
                onCancel,
                onSubmit,
                onChange,
            });

            wrapper.find(".gd-editable-label").simulate("click");

            return wrapper;
        };

        it("should not call onSubmit callback after user leaves the input without changes", () => {
            const onSubmit = jest.fn();
            const wrapper = renderEditableLabelAndClickIn({ onSubmit });

            wrapper.find("textarea").simulate("blur");

            expect(onSubmit).not.toHaveBeenCalled();
            expect(wrapper.find(".is-editing").length).toEqual(0);
        });

        it("should call onSubmit when user press the enter key", () => {
            const onSubmit = jest.fn();
            const wrapper = renderEditableLabelAndClickIn({ onSubmit });

            wrapper.find("textarea").simulate("change", { target: { value: "This is new text" } });
            wrapper.find("textarea").simulate("keyDown", { key: "Enter", keyCode: 13 });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("This is new text");
            expect(wrapper.find(".is-editing").length).toEqual(0);
        });

        it("should call onCancel callback and discard temporary value when user press the escape key", () => {
            const onCancel = jest.fn();
            const wrapper = renderEditableLabelAndClickIn({ onCancel });

            wrapper.find("textarea").simulate("keyDown", { key: "E" });
            wrapper.find("textarea").simulate("keyDown", { key: "Escape", keyCode: 27 });

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledWith("aaa");
            expect(wrapper.find(".is-editing").length).toEqual(0);
        });

        it("should trim value when user enters only spaces", () => {
            const onSubmit = jest.fn();
            const wrapper = renderEditableLabelAndClickIn({ onSubmit });

            wrapper.find("textarea").simulate("change", { target: { value: "    " } });
            wrapper.find("textarea").simulate("keyDown", { key: "Enter", keyCode: 13 });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("");
            expect(wrapper.find(".is-editing").length).toEqual(0);
        });

        it("should call onChange when user change value", () => {
            const onChange = jest.fn();
            const wrapper = renderEditableLabelAndClickIn({ onChange });

            wrapper.find("textarea").simulate("change", { target: { value: "This is new text" } });
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith("This is new text");
        });
    });
});
