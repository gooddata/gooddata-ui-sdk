// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import noop = require("lodash/noop");
import NameSubsection from "../NameSubsection";
import NamePositionControl from "../NamePositionControl";
import ConfigSubsection from "../../../configurationControls/ConfigSubsection";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import { IConfigItemSubsection } from "../../../../interfaces/ConfigurationPanel";

const defaultProps: IConfigItemSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<IConfigItemSubsection> = {}) {
    const props: IConfigItemSubsection = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IConfigItemSubsection, null>(
        <InternalIntlWrapper>
            <NameSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LegendSection render", () => {
    it("should render legend section", () => {
        const wrapper = createComponent();
        expect(wrapper.find(NameSubsection).length).toBe(1);
    });

    it("should ConfigSubsection.toggleDisabled prop be true when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const wrapper = createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        const node = wrapper.find(ConfigSubsection);
        expect(node.prop("toggleDisabled")).toBe(true);
    });

    it("should NamePositionControl.disabled prop be true when NameSubsection disabled is true and xaxis is visible", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", true);

        const wrapper = createComponent({
            disabled: true,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        const node = wrapper.find(NamePositionControl);
        expect(node.prop("disabled")).toBe(true);
    });

    it("should ConfigSubsection.toggleDisabled prop be true when xaxis is not visible then", () => {
        const xaxisVisible = set({}, "controls.xaxis.visible", false);

        const wrapper = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: xaxisVisible,
        });

        const node = wrapper.find(ConfigSubsection);
        expect(node.prop("toggleDisabled")).toBe(true);
    });
});

describe("Toggle switch", () => {
    it("should call pushData when click on toggle switch with valuePath set", () => {
        const pushData = jest.fn();
        const event = { target: { checked: true } };
        const xaxisVisible = set({}, "controls.xaxis.visible", true);
        const axisLabelsEnabled = set(xaxisVisible, "controls.xaxis.labelsEnabled", false);

        const wrapper = createComponent({
            disabled: false,
            configPanelDisabled: false,
            properties: axisLabelsEnabled,
            pushData,
        });

        wrapper.find(".s-checkbox-toggle").simulate("change", event);
        expect(pushData).toHaveBeenCalledTimes(1);
    });
});
