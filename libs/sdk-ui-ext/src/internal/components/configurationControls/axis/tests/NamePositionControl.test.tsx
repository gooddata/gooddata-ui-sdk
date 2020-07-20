// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import set from "lodash/set";
import noop from "lodash/noop";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import NamePositionControl from "../NamePositionControl";
import DropdownControl from "../../DropdownControl";
import { IConfigItemSubsection } from "../../../../interfaces/ConfigurationPanel";

const defaultProps: IConfigItemSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<IConfigItemSubsection> = {}) {
    const props: IConfigItemSubsection = { ...defaultProps, ...customProps };
    return mount<IConfigItemSubsection, null>(
        <InternalIntlWrapper>
            <NamePositionControl {...props} />
        </InternalIntlWrapper>,
    );
}

describe("NamePositionControl render", () => {
    it("should render", () => {
        const wrapper = createComponent();
        expect(wrapper.find(NamePositionControl).length).toBe(1);
    });

    it("should DropdownControl.disabled be true when NamePositionControl disabled is true", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const wrapper = createComponent({
            disabled: true,
            properties: xaxisVisible,
        });

        const node = wrapper.find(DropdownControl);
        expect(node.prop("disabled")).toBe(true);
    });

    it("should DropdownControl.disabled be true when NamePositionControl disabled is false and xaxis is not visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        const wrapper = createComponent({
            disabled: false,
            properties: xaxisVisible,
        });

        const node = wrapper.find(DropdownControl);
        expect(node.prop("disabled")).toBe(true);
    });

    it(" should DropdownControl.disabled be true when NamePositionControl disabled is false and xaxis is visible and axisLabelsEnabled is false", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const wrapper = createComponent({
            disabled: true,
            properties: axisLabelsEnabled,
        });

        const node = wrapper.find(DropdownControl);
        expect(node.prop("disabled")).toBe(true);
    });
});
