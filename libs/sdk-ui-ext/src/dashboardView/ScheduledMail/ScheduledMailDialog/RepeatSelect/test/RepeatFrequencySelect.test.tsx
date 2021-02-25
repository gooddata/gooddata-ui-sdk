// (C) 2019-2020 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { mount, ReactWrapper } from "enzyme";

import { REPEAT_FREQUENCIES } from "../../../constants";
import { RepeatFrequencySelect, IRepeatFrequencySelectProps } from "../RepeatFrequencySelect";
import { InternalIntlWrapper } from "../../../../../internal";

import { getDropdownTitle, openDropdown, selectDropdownItem, REPEAT_FREQUENCY_INDEX } from "./testUtils";

describe("RepeatFrequencySelect", () => {
    const titleFrequencyDay = "day";
    const titleFrequencyWeek = "week";
    const titleFrequencyMonth = "month";

    function renderComponent(customProps: Partial<IRepeatFrequencySelectProps> = {}): ReactWrapper {
        const defaultProps = {
            repeatFrequency: REPEAT_FREQUENCIES.DAY,
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return mount(
            <InternalIntlWrapper>
                <RepeatFrequencySelect {...defaultProps} />
            </InternalIntlWrapper>,
        );
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it.each([
        [REPEAT_FREQUENCIES.DAY, titleFrequencyDay],
        [REPEAT_FREQUENCIES.WEEK, titleFrequencyWeek],
        [REPEAT_FREQUENCIES.MONTH, titleFrequencyMonth],
    ])("should render correct title for %s", (repeatFrequency: string, expectedTitle: string) => {
        const component = renderComponent({
            repeatFrequency,
        });
        expect(getDropdownTitle(component)).toBe(expectedTitle);
    });

    it.each([
        [REPEAT_FREQUENCIES.DAY, "days"],
        [REPEAT_FREQUENCIES.WEEK, "weeks"],
        [REPEAT_FREQUENCIES.MONTH, "months"],
    ])("should render title in plural for %s", (repeatFrequency: string, expectedTitle: string) => {
        const component = renderComponent({
            repeatFrequency,
            repeatPeriod: 2,
        });
        expect(getDropdownTitle(component)).toBe(expectedTitle);
    });

    it("should trigger onChange", () => {
        const onChange = jest.fn();
        const component = renderComponent({ onChange });

        openDropdown(component);
        selectDropdownItem(component, REPEAT_FREQUENCY_INDEX[REPEAT_FREQUENCIES.WEEK]);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(REPEAT_FREQUENCIES.WEEK);
    });
});
