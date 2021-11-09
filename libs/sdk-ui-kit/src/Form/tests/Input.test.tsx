// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Input } from "../Input";

describe("Input", () => {
    function renderInput(options = {}) {
        const props = {
            onChange: jest.fn(),
            ...options,
        };
        return mount(<Input {...props} />);
    }

    describe("With configured callbacks", () => {
        it("should not render prefix and suffix", () => {
            const wrapper = renderInput();
            expect(wrapper.find(".gd-input-prefix")).toHaveLength(0);
            expect(wrapper.find(".gd-input-suffix")).toHaveLength(0);
        });

        it("should render prefix", () => {
            const wrapper = renderInput({
                prefix: "pre",
            });
            expect(wrapper.find(".gd-input-prefix")).toHaveLength(1);
        });

        it("should render suffix", () => {
            const wrapper = renderInput({
                suffix: "post",
            });
            expect(wrapper.find(".gd-input-suffix")).toHaveLength(1);
        });

        it("should not disable the input", () => {
            const wrapper = renderInput();
            expect(wrapper.find(".gd-input-field").get(0).props.disabled).toBeFalsy();
        });

        it("should disable the input", () => {
            const wrapper = renderInput({
                disabled: true,
            });

            expect(wrapper.find(".gd-input-field").get(0).props.disabled).toBeTruthy();
        });

        it("should make the input readonly", () => {
            const wrapper = renderInput({
                readonly: true,
            });
            expect(wrapper.find(".gd-input-field").get(0).props.readOnly).toBeTruthy();
        });

        it("should call onChange when value changed", () => {
            const changedText = "New text";
            const onChange = jest.fn();
            const wrapper = renderInput({ onChange });
            wrapper.find("input").simulate("change", {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).toHaveBeenCalledWith(changedText);
        });

        it("should not clear on Escape", () => {
            const valueSpy = jest.fn();
            const wrapper = renderInput();
            (wrapper.instance() as any).valueChanged = valueSpy;

            wrapper.find("input").simulate("keyDown", {
                key: "Escape",
                keyCode: 27,
            });

            expect(valueSpy).not.toHaveBeenCalled();
        });

        it("should clear on Escape", () => {
            const wrapper = renderInput({
                clearOnEsc: true,
            });

            const valueSpy = jest.fn();
            (wrapper.instance() as any).valueChanged = valueSpy;

            wrapper.find("input").simulate("keyDown", {
                key: "Escape",
                keyCode: 27,
            });

            expect(valueSpy).toHaveBeenCalledTimes(1);
        });

        it("should not call onChange when value stays empty", () => {
            const changedText = "";

            const onChange = jest.fn();
            const wrapper = renderInput({ onChange });
            wrapper.find("input").simulate("change", {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).not.toHaveBeenCalled();
        });

        it("should not call onChange when onClear is called", () => {
            const onChange = jest.fn();
            const wrapper = renderInput({ onChange, value: "test", clearOnEsc: true });

            wrapper.find(".s-input-clear").simulate("click");

            expect(onChange).not.toHaveBeenCalled();
        });

        it("should call onChange only once when changed twice with the same value", () => {
            const changedText = "New text";

            const onChange = jest.fn();
            const wrapper = renderInput({ onChange });
            wrapper.find("input").simulate("change", {
                target: {
                    value: changedText,
                },
            });

            wrapper.find("input").simulate("change", {
                target: {
                    value: changedText,
                },
            });

            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it("should call onChange when prop value is changed", () => {
            const onChange = jest.fn();

            const wrapper = renderInput({ onChange, value: "foo" });
            wrapper.setProps({ value: "bar" });
            wrapper.setProps({ value: "bar" }); // setting identical value should not trigger onChange

            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it("should call onEscKeyPress esc key is pressed", () => {
            const onEscKeyPress = jest.fn();

            const wrapper = renderInput({ onEscKeyPress, value: "foo" });
            wrapper.find("input").simulate("keyDown", {
                key: "Escape",
                keyCode: 27,
            });

            expect(onEscKeyPress).toHaveBeenCalledTimes(1);
        });

        it("should call onEnterKeyPress esc key is pressed", () => {
            const onEnterKeyPress = jest.fn();

            const wrapper = renderInput({ onEnterKeyPress, value: "foo" });
            wrapper.find("input").simulate("keyDown", {
                key: "Enter",
                keyCode: 13,
            });

            expect(onEnterKeyPress).toHaveBeenCalledTimes(1);
        });

        describe("autofocus", () => {
            beforeEach(() => {
                const el = document.activeElement as HTMLElement;
                if (el) {
                    el.blur();
                }
            });

            it("should autofocus input with timer 100ms", () => {
                jest.useFakeTimers();

                renderInput({
                    autofocus: true,
                });
                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(20);

                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(200);

                expect(document.activeElement.tagName).toBe("INPUT");

                jest.useRealTimers();
            });

            it("should autofocus input with native like behaviour in visible element", () => {
                jest.useFakeTimers();

                const wrapper = renderInput({
                    autofocus: true,
                    nativeLikeAutofocus: true,
                });
                const el = wrapper.find("input").getDOMNode<HTMLInputElement>();
                jest.spyOn(el, "offsetHeight", "get").mockReturnValue(25);

                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(200);

                expect(document.activeElement.tagName).toBe("INPUT");

                jest.useRealTimers();
            });

            it("should autofocus input with native like behaviour in visible element but after long time", () => {
                jest.useFakeTimers();

                const wrapper = renderInput({
                    autofocus: true,
                    nativeLikeAutofocus: true,
                });

                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(20);

                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(200);

                expect(document.activeElement.tagName).toBe("BODY");

                const el = wrapper.find("input").getDOMNode<HTMLInputElement>();
                jest.spyOn(el, "offsetHeight", "get").mockReturnValue(25);

                expect(document.activeElement.tagName).toBe("BODY");

                jest.advanceTimersByTime(100);

                expect(document.activeElement.tagName).toBe("INPUT");

                jest.useRealTimers();
            });
        });
    });
});
