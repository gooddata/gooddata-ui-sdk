// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import ConfigSubsection, { IConfigSubsectionProps } from "../ConfigSubsection";
import DisabledBubbleMessage from "../../DisabledBubbleMessage";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

describe("ConfigSubsection", () => {
    const defaultProps = {
        valuePath: "valuePath",
        properties: {},
        propertiesMeta: {},
        title: "properties.legend.title",
    };

    function createComponent(customProps: Partial<IConfigSubsectionProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <ConfigSubsection {...props}>
                    <div className="child" />
                </ConfigSubsection>
            </InternalIntlWrapper>,
        );
    }

    describe("Rendering", () => {
        it("should render config subsection", () => {
            const wrapper = createComponent();

            expect(wrapper.find(".s-configuration-subsection-properties-legend-title").length).toBe(1);
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            const wrapper = createComponent();

            expect(wrapper.find(".input-checkbox-toggle").length).toBe(0);
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            const wrapper = createComponent({ canBeToggled: true });

            expect(wrapper.find(DisabledBubbleMessage).hasClass("input-checkbox-toggle")).toBe(true);
            expect(wrapper.find(".s-checkbox-toggle").props().disabled).toBeFalsy();
        });

        it("should call pushData when click on toggle switch and", () => {
            const pushData = jest.fn();
            const event = { target: { checked: true } };

            const wrapper = createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            wrapper.find(".s-checkbox-toggle").simulate("change", event);
            expect(pushData).toHaveBeenCalledTimes(1);
        });

        it("should disable toggle switch", () => {
            const wrapper = createComponent({
                canBeToggled: true,
                toggleDisabled: true,
            });

            expect(wrapper.find(".s-checkbox-toggle").props().disabled).toBeTruthy();
        });

        it("should check toggle switch by default", () => {
            const wrapper = createComponent({
                canBeToggled: true,
            });
            expect(wrapper.find(".s-checkbox-toggle").props().checked).toBeTruthy();
        });

        it('should uncheck toggle switch by property "toggledOn"', () => {
            const wrapper = createComponent({
                canBeToggled: true,
                toggledOn: false,
            });
            expect(wrapper.find(".s-checkbox-toggle").props().checked).toBeFalsy();
        });
    });
});
