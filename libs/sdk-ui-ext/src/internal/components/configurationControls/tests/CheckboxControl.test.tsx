// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

import CheckboxControl, { ICheckboxControlProps } from "../CheckboxControl";

describe("CheckboxControl", () => {
    const defaultProps = {
        valuePath: "path",
        labelText: "properties.canvas.gridline",
        properties: {},
        propertiesMeta: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<ICheckboxControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <CheckboxControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render checkbox control", () => {
        const wrapper = createComponent();

        expect(wrapper.find(".input-checkbox-label").length).toBe(1);
    });

    it("should be unchecked by default", () => {
        const wrapper = createComponent();

        expect(wrapper.find(".input-checkbox").props().checked).toBeFalsy();
    });

    it("should be enabled by default", () => {
        const wrapper = createComponent();

        expect(wrapper.find(".input-checkbox").props().disabled).toBeFalsy();
    });

    it("should render checked checkbox", () => {
        const wrapper = createComponent({ checked: true });

        expect(wrapper.find(".input-checkbox").props().checked).toBeTruthy();
    });

    it("should render disabled checkbox", () => {
        const wrapper = createComponent({ disabled: true });

        expect(wrapper.find(".input-checkbox").props().disabled).toBeTruthy();
    });

    it("should call pushData when checkbox value changes", () => {
        const pushData = jest.fn();
        const event = { target: { checked: true } };

        const wrapper = createComponent({
            properties: {},
            pushData,
        });

        wrapper.find(".input-checkbox").simulate("change", event);

        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
