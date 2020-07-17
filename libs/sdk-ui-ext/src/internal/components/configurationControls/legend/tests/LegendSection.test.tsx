// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import LegendSection, { ILegendSection } from "../LegendSection";
import LegendPositionControl from "../LegendPositionControl";
import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

const defaultProps: ILegendSection = {
    controlsDisabled: true,
    properties: {},
    propertiesMeta: {},
    pushData: noop,
};

function createComponent(customProps: Partial<ILegendSection> = {}) {
    const props: ILegendSection = { ...cloneDeep(defaultProps), ...customProps };
    return mount(
        <InternalIntlWrapper>
            <LegendSection {...props} />
        </InternalIntlWrapper>,
    );
}

describe("LegendSection render", () => {
    it("should render legend section", () => {
        const wrapper = createComponent();
        expect(wrapper.find(LegendSection).length).toBe(1);
    });

    it("when controlsDisabled true than LegendPositionControl should render disabled", () => {
        const notCollapsed = set({}, "legend_section.collapsed", false);
        const legendToggledOn = set({}, "controls.legend.enabled", true);

        const wrapper = createComponent({
            controlsDisabled: true,
            properties: legendToggledOn,
            propertiesMeta: notCollapsed,
        });

        const node = wrapper.find(LegendPositionControl);

        expect(node.length).toBe(1);
        expect(node.find(".gd-button.disabled").length).toBe(1);
    });

    it(
        "When controlsDisabled is false and properties.controls.legend.enabled is false " +
            "than LegendPositionControl should be disabled",
        () => {
            const legendToggledOn = set({}, "controls.legend.enabled", false);
            const notCollapsed = set({}, "legend_section.collapsed", false);

            const wrapper = createComponent({
                controlsDisabled: false,
                properties: legendToggledOn,
                propertiesMeta: notCollapsed,
            });

            const node = wrapper.find(LegendPositionControl);

            expect(node.length).toBe(1);
            expect(node.find(".gd-button.disabled").length).toBe(1);
        },
    );

    it(
        "When controlsDisabled is false and properties.controls.legend.enabled is true " +
            "than LegendPositionControl should be enabled",
        () => {
            const legendToggledOn = set({}, "controls.legend.enabled", true);
            const notCollapsed = set({}, "legend_section.collapsed", false);

            const wrapper = createComponent({
                controlsDisabled: false,
                properties: legendToggledOn,
                propertiesMeta: notCollapsed,
            });

            const node = wrapper.find(LegendPositionControl);
            expect(node.length).toBe(1);
            expect(node.find(".gd-button").hasClass("disabled")).toBe(false);
        },
    );

    it("When legend is not visible in meta and is enabled in properties, legend should be disabled", () => {
        const legendToggledOn = set({}, "controls.legend.enabled", true);
        const propertiesMeta = {
            legend_enabled: false,
            legend_section: { collapsed: false },
        };

        const wrapper = createComponent({
            controlsDisabled: false,
            properties: legendToggledOn,
            propertiesMeta,
        });

        const node = wrapper.find(LegendPositionControl);
        expect(node.length).toBe(1);
        expect(node.find(".gd-button").hasClass("disabled")).toBe(true);
    });
});
