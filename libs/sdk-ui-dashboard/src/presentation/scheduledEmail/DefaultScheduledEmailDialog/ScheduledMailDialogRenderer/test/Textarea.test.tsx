// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";

import { Textarea, ITextareaProps } from "../Textarea";
import { IntlWrapper } from "../../../../localization/IntlWrapper";

describe("Textarea", () => {
    function renderComponent(customProps: Partial<ITextareaProps> = {}): ReactWrapper {
        const defaultProps = {
            hasError: false,
            hasWarning: false,
            label: "",
            maxlength: 100,
            placeholder: "",
            value: "",
            rows: 4,
            onChange: noop,
            ...customProps,
        };

        return mount(
            <IntlWrapper>
                <Textarea {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render label and text area with value", () => {
        const label = "subject";
        const value = "value";
        const component = renderComponent({ label, value });
        expect(component.find("label.gd-label").text()).toBe(label);
        expect(component.find("textarea").text()).toBe(value);
    });

    it("should trigger onChange event", () => {
        const value = "new value";
        const onChange = jest.fn();
        const component = renderComponent({ onChange });

        component.find("textarea").simulate("change", { target: { value } });

        expect(onChange).toBeCalledWith(value);
    });
});
