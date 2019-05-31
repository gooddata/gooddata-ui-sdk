// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import noop = require("lodash/noop");
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import DropdownControl, { IDropdownControlProps } from "../DropdownControl";
import { createInternalIntl } from "../../../utils/internalIntlProvider";
import { DEFAULT_LOCALE } from "../../../../constants/localization";

describe("DropdownControl", () => {
    const defaultProps = {
        valuePath: "valuePath",
        labelText: "properties.legend.title",
        intl: createInternalIntl(DEFAULT_LOCALE),
        properties: {},
        pushData: noop,
    };

    function createComponent(customProps: Partial<IDropdownControlProps> = {}) {
        const props = { ...defaultProps, ...customProps };
        return mount(<DropdownControl {...props} />);
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
