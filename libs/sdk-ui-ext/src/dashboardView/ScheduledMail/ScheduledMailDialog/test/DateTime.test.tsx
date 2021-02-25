// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";
import { Datepicker, Timepicker } from "@gooddata/sdk-ui-kit";

import { DateTime, IDateTimeProps } from "../DateTime";
import { InternalIntlWrapper } from "../../../../internal";

describe("DateTime", () => {
    function renderComponent(customProps: Partial<IDateTimeProps> = {}): ReactWrapper {
        const defaultProps = {
            date: new Date(),
            dateFormat: "MM/dd/yyyy",
            label: "",
            locale: "en-US",
            timezone: "",
            onDateChange: noop,
            onTimeChange: noop,
            ...customProps,
        };

        return mount(
            <InternalIntlWrapper>
                <DateTime {...defaultProps} />
            </InternalIntlWrapper>,
        );
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it("should render label", () => {
        const label = "First occurrence";
        const component = renderComponent({ label });
        expect(component.find("label.gd-label").text()).toBe(label);
    });

    it("should render date time picker", () => {
        const component = renderComponent();
        expect(component.find(Datepicker).exists()).toBe(true);
        expect(component.find(Timepicker).exists()).toBe(true);
    });

    it("should render timezone", () => {
        const timezone = "UTC-07:00 Pacific Standard Time";
        const component = renderComponent({ timezone });
        expect(component.find(".s-gd-schedule-email-dialog-datetime-timezone").text()).toBe(timezone);
    });
});
