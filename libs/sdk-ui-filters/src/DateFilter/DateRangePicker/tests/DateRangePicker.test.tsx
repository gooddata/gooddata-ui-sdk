// (C) 2007-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { DateRangePicker, IDateRange } from "../DateRangePicker";
import { childGetter, firstChildGetter, writeTo, clickOn } from "../../tests/utils";
import { IntlDecorator } from "./IntlDecorators";

const getFromInput = childGetter(".s-date-range-picker-from .s-date-range-picker-input-field");
const getToInput = childGetter(".s-date-range-picker-to .s-date-range-picker-input-field");

const getFromTimeInput = childGetter(".s-date-range-picker-from .s-date-range-picker-input-time .input-text");
const getToTimeInput = childGetter(".s-date-range-picker-to .s-date-range-picker-input-time .input-text");

const getTenthOfMay = firstChildGetter(".rdp-day_range_middle");

const defaultDateFormat = "MM/dd/yyyy";
const defaultRange: IDateRange = {
    from: new Date(2019, 4, 5),
    to: new Date(2019, 4, 15),
};

describe("DateRangePicker", () => {
    describe("time disabled", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                    isTimeEnabled={false}
                />,
            ),
        );

        it("should call the appropriate callback when from input changes", () => {
            writeTo("05/01/2019", getFromInput(rendered));
            expect(onChange).toHaveBeenCalledWith({ ...defaultRange, from: new Date(2019, 4, 1) });
            rendered.unmount();
        });

        it("should call the appropriate callback when to input changes", () => {
            rendered.mount();
            writeTo("06/01/2019", getToInput(rendered));
            expect(onChange).toHaveBeenCalledWith({ ...defaultRange, to: new Date(2019, 5, 1) });
        });

        it("should call the appropriate callback when from picker is clicked", () => {
            clickOn(getFromInput(rendered));
            clickOn(getTenthOfMay(rendered));

            // Cannot test on exact match, because the dates are local.
            // See https://github.com/gpbl/react-day-picker/blob/b08661717076249f1b6c1085174bb1d92aad6b08/test/daypicker/events.js#L37-L54
            const from = onChange.mock.calls[0][0].from;
            expect(from.getFullYear()).toEqual(2019);
            expect(from.getMonth()).toEqual(4);
        });

        it("should call the appropriate callback when to picker is clicked", () => {
            clickOn(getToInput(rendered));
            clickOn(getTenthOfMay(rendered));

            const to = onChange.mock.calls[0][0].to;
            expect(to.getFullYear()).toEqual(2019);
            expect(to.getMonth()).toEqual(4);
        });

        it("should not be able to configure FROM/TO time since it is not enabled", () => {
            expect(getFromTimeInput(rendered)).toEqual({});
            expect(getToTimeInput(rendered)).toEqual({});
        });
    });

    describe("time enabled", () => {
        const onChange = jest.fn();
        const rendered = mount(
            IntlDecorator(
                <DateRangePicker
                    dateFormat={defaultDateFormat}
                    range={defaultRange}
                    onRangeChange={onChange}
                    isMobile={false}
                    isTimeEnabled={true}
                />,
            ),
        );

        it("should call the appropriate callback when FROM time configured to 11", () => {
            writeTo("1100", getFromTimeInput(rendered));
            expect(onChange).toHaveBeenCalledWith({ ...defaultRange, from: new Date(2019, 4, 5, 11, 0) });
        });

        const toScenarios: Array<[string, string, Date]> = [
            ["TO time configured to 09", "09", new Date(2019, 4, 15, 9, 0)],
            ["TO time configured to 16", "16", new Date(2019, 4, 15, 16, 0)],
            ["TO time configured to 1555", "1555", new Date(2019, 4, 15, 15, 55)],
        ];

        it.each(toScenarios)(
            "should call the appropriate callback when %s",
            (_desc, value, expectedResult) => {
                writeTo(value, getToTimeInput(rendered));
                expect(onChange).toHaveBeenCalledWith({ ...defaultRange, to: expectedResult });
            },
        );
    });
});
