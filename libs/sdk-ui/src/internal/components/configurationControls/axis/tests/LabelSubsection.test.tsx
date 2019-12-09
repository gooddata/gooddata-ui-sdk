// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import cloneDeep = require("lodash/cloneDeep");
import set = require("lodash/set");
import LabelSubsection, { ILabelSubsection } from "../LabelSubsection";
import LabelRotationControl from "../LabelRotationControl";
import ConfigSubsection from "../../../configurationControls/ConfigSubsection";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";

const defaultProps: ILabelSubsection = {
    disabled: true,
    configPanelDisabled: false,
    properties: {},
    axis: "xaxis",
    pushData: noop,
};

function createComponent(customProps: Partial<ILabelSubsection> = {}) {
    const props: ILabelSubsection = { ...cloneDeep(defaultProps), ...customProps };
    return mount<ILabelSubsection, null>(
        <InternalIntlWrapper>
            <LabelSubsection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LabelSection render", () => {
    it("should render label section", () => {
        const wrapper = createComponent();
        expect(wrapper.find(LabelSubsection).length).toBe(1);
    });

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "ConfigSubsection.toggleDisabled props should be true",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            const wrapper = createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            const node = wrapper.find(ConfigSubsection);
            expect(node.prop("toggleDisabled")).toBe(true);
        },
    );

    it(
        "When LabelSubsection disabled true and xaxis is visible then " +
            "LabelRotationControl.disabled props should be true",
        () => {
            const xaxisVisible = set({}, "controls.xaxis.visible", true);

            const wrapper = createComponent({
                disabled: true,
                configPanelDisabled: false,
                properties: xaxisVisible,
            });

            const node = wrapper.find(LabelRotationControl);
            expect(node.prop("disabled")).toBe(true);
        },
    );

    it("When xaxis is not visible then " + "ConfigSubsection.toggleDisabled props should be true", () => {
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
