// (C) 2021 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import { ILabelFormatControl, LabelFormatControl } from "../LabelFormatControl";

const defaultProps: ILabelFormatControl = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelFormatControl> = {}) {
    const props: ILabelFormatControl = { ...cloneDeep(defaultProps), ...customProps };
    return mount<ILabelFormatControl, null>(
        <InternalIntlWrapper>
            <LabelFormatControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelRotationControl render", () => {
    const FORMAT_DROPDOWN_BUTTON_SELECTOR = ".s-auto__default_";

    it("should render", () => {
        const wrapper = createComponent();

        expect(wrapper.find(LabelFormatControl).exists()).toBe(true);
    });

    it("should be disabled when disabled prop is true", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const wrapper = createComponent({
            disabled: true,
            properties: properties,
        });

        expect(wrapper.find(FORMAT_DROPDOWN_BUTTON_SELECTOR).hasClass("disabled")).toBe(true);
    });

    it("should be disabled when xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const wrapper = createComponent({
            disabled: false,
            properties: properties,
        });

        expect(wrapper.find(FORMAT_DROPDOWN_BUTTON_SELECTOR).hasClass("disabled")).toBe(true);
    });

    it("should be disabled when xaxis labels are not enabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const wrapper = createComponent({
            disabled: false,
            properties: properties,
        });

        expect(wrapper.find(FORMAT_DROPDOWN_BUTTON_SELECTOR).hasClass("disabled")).toBe(true);
    });

    it("should not be disabled when control is not disabled, xaxis is visible and xaxis labels are enabled", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const properties = set(xaxisVisible, "controls.xaxis.labelsEnabled", true);

        const wrapper = createComponent({
            disabled: false,
            properties: properties,
        });

        expect(wrapper.find(FORMAT_DROPDOWN_BUTTON_SELECTOR).hasClass("disabled")).toBe(false);
    });
});
