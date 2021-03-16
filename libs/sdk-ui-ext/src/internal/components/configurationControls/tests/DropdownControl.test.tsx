// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(
            <InternalIntlWrapper>
                <DropdownControl {...props} />
            </InternalIntlWrapper>,
        );
    }

    it("should render dropdown control", () => {
        const wrapper = createComponent();

        expect(wrapper.find(Dropdown).length).toBe(1);
    });

    it("should be enabled by default", () => {
        const wrapper = createComponent();

        expect(wrapper.find("button").hasClass("disabled")).toBeFalsy();
    });

    it("should render disabled button", () => {
        const wrapper = createComponent({ disabled: true });

        expect(wrapper.find("button").hasClass("disabled")).toBeTruthy();
    });
});
