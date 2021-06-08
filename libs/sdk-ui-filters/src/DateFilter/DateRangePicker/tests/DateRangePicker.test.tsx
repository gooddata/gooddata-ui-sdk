// (C) 2007-2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { DateRangePicker, IDateRange } from "../DateRangePicker";
import { childGetter, writeTo, clickOn } from "../../tests/utils";
import { IntlDecorator } from "./IntlDecorators";

const getFromInput = childGetter(".s-date-range-picker-from .s-date-range-picker-input-field");
const getToInput = childGetter(".s-date-range-picker-to .s-date-range-picker-input-field");
const getTenthOfMay = childGetter('[aria-label="Fri May 10, 2019"]');

const defaultDateFormat = "MM/dd/yyyy";
const defaultRange: IDateRange = {
    from: new Date(2019, 4, 5),
    to: new Date(2019, 4, 15),
};

describe("DateRangePicker", () => {
    it("should call the appropriate callback when from input changes", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                />,
            ),
        );

        writeTo("05/01/2019", getFromInput(rendered));

        expect(onChange).toHaveBeenCalledWith({ ...defaultRange, from: new Date(2019, 4, 1) });
    });

    it("should call the appropriate callback when to input changes", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                />,
            ),
        );

        writeTo("06/01/2019", getToInput(rendered));

        expect(onChange).toHaveBeenCalledWith({ ...defaultRange, to: new Date(2019, 5, 1) });
    });

    it("should call the appropriate callback when from picker is clicked", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                />,
            ),
        );

        clickOn(getFromInput(rendered));
        clickOn(getTenthOfMay(rendered));

        // Cannot test on exact match, because the dates are local.
        // See https://github.com/gpbl/react-day-picker/blob/b08661717076249f1b6c1085174bb1d92aad6b08/test/daypicker/events.js#L37-L54
        const from = onChange.mock.calls[0][0].from;
        expect(from.getFullYear()).toEqual(2019);
        expect(from.getMonth()).toEqual(4);
    });

    it("should call the appropriate callback when to picker is clicked", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                />,
            ),
        );

        clickOn(getToInput(rendered));
        clickOn(getTenthOfMay(rendered));

        const to = onChange.mock.calls[0][0].to;
        expect(to.getFullYear()).toEqual(2019);
        expect(to.getMonth()).toEqual(4);
    });
});
