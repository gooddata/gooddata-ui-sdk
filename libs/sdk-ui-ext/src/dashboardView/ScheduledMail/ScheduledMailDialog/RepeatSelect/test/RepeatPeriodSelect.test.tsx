// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";

import { RepeatPeriodSelect, IRepeatPeriodSelectProps } from "../RepeatPeriodSelect";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider";

describe("RepeatPeriodSelect", () => {
    function renderComponent(customProps: Partial<IRepeatPeriodSelectProps> = {}): ReactWrapper {
        const defaultProps = {
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return mount(
            <InternalIntlWrapper>
                <RepeatPeriodSelect {...defaultProps} />
            </InternalIntlWrapper>,
        );
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it("should render correct period", () => {
        const repeatPeriod = 5;
        const component = renderComponent({
            repeatPeriod,
        });

        const input = component.find(".gd-input-field");
        const value = input.props().value;
        expect(value).toBe(repeatPeriod);
    });

    it("should trigger onChange", () => {
        const repeatPeriod = 5;
        const onChange = jest.fn();
        const component = renderComponent({ repeatPeriod, onChange });

        const input = component.find(".gd-input-field");
        input.simulate("change", { target: { value: "test" } });
        expect(onChange).toHaveBeenCalledTimes(0);

        input.simulate("change", { target: { value: "0" } });
        expect(onChange).toHaveBeenCalledTimes(0);

        input.simulate("change", { target: { value: "2" } });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(2);
    });
});
