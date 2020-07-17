// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import LabelRotationControl, { ILabelRotationControl } from "../LabelRotationControl";
import DropdownControl from "../../DropdownControl";

const defaultProps: ILabelRotationControl = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelRotationControl> = {}) {
    const props: ILabelRotationControl = { ...cloneDeep(defaultProps), ...customProps };
    return mount<ILabelRotationControl, null>(
        <InternalIntlWrapper>
            <LabelRotationControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelRotationControl render", () => {
    it("should render", () => {
        const wrapper = createComponent();
        expect(wrapper.find(LabelRotationControl).length).toBe(1);
    });

    it("When LabelRotationControl disabled true" + "DropdownControl.disabled props should be true", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const wrapper = createComponent({
            disabled: true,
            properties: xaxisVisible,
        });

        const node = wrapper.find(DropdownControl);
        expect(node.prop("disabled")).toBe(true);
    });

    it(
        "When LabelRotationControl disabled false and xaxis is not visible" +
            "DropdownControl.disabled props should be true",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", false);

            const wrapper = createComponent({
                disabled: false,
                properties: xaxisVisible,
            });

            const node = wrapper.find(DropdownControl);
            expect(node.prop("disabled")).toBe(true);
        },
    );

    it(
        "When LabelRotationControl disabled false and xaxis is visible and axisLabelsEnabled is false" +
            "(it is switch off) than DropdownControl.disabled props should be true",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);
            const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

            const wrapper = createComponent({
                disabled: true,
                properties: axisLabelsEnabled,
            });

            const node = wrapper.find(DropdownControl);
            expect(node.prop("disabled")).toBe(true);
        },
    );
});
