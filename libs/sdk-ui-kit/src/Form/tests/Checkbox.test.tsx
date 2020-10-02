// (C) 2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Checkbox } from "../Checkbox";

describe("ReactCheckbox", () => {
    function renderCheckbox(options = {}) {
        const props = {
            onChange: jest.fn(),
            ...options,
        };
        const wrapper = mount(<Checkbox {...props} />);
        const checkbox = wrapper.find(".input-checkbox").first();
        return {
            checkbox,
            wrapper,
        };
    }

    describe("With configured callbacks", () => {
        it("should enable and un-check the checkbox", () => {
            const { checkbox } = renderCheckbox();

            expect(checkbox.prop("checked")).toBeFalsy();
            expect(checkbox.prop("disabled")).toBeFalsy();
        });

        it("should check the checkbox", () => {
            const { checkbox } = renderCheckbox({
                value: true,
            });

            expect(checkbox.prop("checked")).toBeTruthy();
        });

        it("should disable the checkbox", () => {
            const { checkbox } = renderCheckbox({
                disabled: true,
            });

            expect(checkbox.prop("disabled")).toBeTruthy();
        });

        it("should call onChange when value changed", () => {
            const changedValue = true;
            const onChange = jest.fn();
            const { checkbox } = renderCheckbox({ onChange });
            checkbox.simulate("change", {
                target: {
                    checked: changedValue,
                },
            });

            expect(onChange).toHaveBeenCalledWith(changedValue);
        });
    });
});
