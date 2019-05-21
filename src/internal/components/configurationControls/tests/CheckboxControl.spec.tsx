// (C) 2019 GoodData Corporation
import * as React from "react";
import { shallow } from "enzyme";
import noop = require("lodash/noop");
import { createIntl, DEFAULT_LOCALE } from "../../../utils/intlProvider";

import CheckboxControl, { ICheckboxControlProps } from "../CheckboxControl";

describe("CheckboxControl", () => {
    const defaultProps = {
        valuePath: "path",
        labelText: "properties.canvas.gridline",
        properties: {},
        propertiesMeta: {},
        intl: createIntl(DEFAULT_LOCALE),
        pushData: noop,
    };

    function createComponent(customProps: Partial<ICheckboxControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return shallow<ICheckboxControlProps, null>(<CheckboxControl {...props} />, {
            lifecycleExperimental: true,
        });
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
