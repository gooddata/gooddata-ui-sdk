// (C) 2019 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { DefaultLocale } from "@gooddata/sdk-ui";
import noop from "lodash/noop";
import { ConfigSection, IConfigSectionOwnProps } from "../ConfigSection";
import { createInternalIntl } from "../../../utils/internalIntlProvider";

describe("ConfigSection", () => {
    const defaultProps = {
        id: "id",
        properties: {},
        propertiesMeta: {},
        title: "properties.legend.title",
        intl: createInternalIntl(DefaultLocale),
        pushData: noop,
    };

    function createComponent(customProps: Partial<IConfigSectionOwnProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return shallow<IConfigSectionOwnProps, null>(
            <ConfigSection {...props}>
                <div className="child" />
            </ConfigSection>,
            { lifecycleExperimental: true },
        );
    }

    describe("Rendering", () => {
        it("should render config section", () => {
            const wrapper = createComponent();

            expect(wrapper.find(".adi-bucket-item").length).toBe(1);
        });

        it("should render children when not collapsed", () => {
            const wrapper = createComponent({
                propertiesMeta: { id: { collapsed: false } },
            });

            expect(wrapper.find(".child").length).toBe(1);
        });

        it("should not render children when collapsed", () => {
            const wrapper = createComponent();

            expect(wrapper.find(".child").length).toBe(0);
        });

        it('should update "collapsed" in component state on new props', () => {
            const wrapper = createComponent();
            expect(wrapper.state("collapsed")).toEqual(true);

            wrapper.setProps({
                propertiesMeta: { id: { collapsed: false } },
            });
            expect(wrapper.state("collapsed")).toEqual(false);
        });

        it('should update "collapsed" in state when clicked on header', () => {
            const wrapper = createComponent();
            expect(wrapper.state("collapsed")).toEqual(true);

            wrapper.find(".adi-bucket-item-header").simulate("click");
            expect(wrapper.state("collapsed")).toEqual(false);
        });

        it("should call pushData when header clicked", () => {
            const pushData = jest.fn();
            const wrapper = createComponent({ pushData });

            wrapper.find(".adi-bucket-item-header").simulate("click");
            expect(pushData).toHaveBeenCalledTimes(1);
        });
    });

    describe("Toggle switch", () => {
        it("should't render toggle switch by default", () => {
            const wrapper = createComponent();

            expect(wrapper.find(".input-checkbox-toggle").length).toBe(0);
        });

        it('should render toggle switch when property "canBeToggled" is set on true', () => {
            const wrapper = createComponent({ canBeToggled: true });

            expect(wrapper.find(".input-checkbox-toggle").length).toBe(1);
            expect(wrapper.find(".s-checkbox-toggle").props().disabled).toBeFalsy();
        });

        it("should call pushData when click on toggle switch with valuePath set", () => {
            const pushData = jest.fn();
            const event = { target: { checked: true } };

            const wrapper = createComponent({
                canBeToggled: true,
                valuePath: "path",
                properties: {},
                pushData,
            });

            wrapper.find(".s-checkbox-toggle").simulate("change", event);
            expect(pushData).toHaveBeenCalledTimes(1);
        });

        it("shouldn't call pushData when click on toggle switch with undefined valuePath", () => {
            const pushData = jest.fn();
            const event = { target: { checked: true } };

            const wrapper = createComponent({
                canBeToggled: true,
                properties: {},
                pushData,
            });

            wrapper.find(".s-checkbox-toggle").simulate("change", event);
            expect(pushData).toHaveBeenCalledTimes(0);
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
