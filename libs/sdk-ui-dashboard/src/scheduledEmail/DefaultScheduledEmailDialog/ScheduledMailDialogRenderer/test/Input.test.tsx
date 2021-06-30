// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";

import { Input, IInputProps } from "../Input";
import { IntlWrapper } from "../../../../localization/IntlWrapper";

describe("Input", () => {
    function renderComponent(customProps: Partial<IInputProps> = {}): ReactWrapper {
        const defaultProps = {
            label: "",
            maxlength: 100,
            placeholder: "",
            onChange: noop,
            ...customProps,
        };

        return mount(
            <IntlWrapper>
                <Input {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it("should render label", () => {
        const label = "subject";
        const component = renderComponent({ label });
        expect(component.find("label.gd-label").text()).toBe(label);
    });
});
