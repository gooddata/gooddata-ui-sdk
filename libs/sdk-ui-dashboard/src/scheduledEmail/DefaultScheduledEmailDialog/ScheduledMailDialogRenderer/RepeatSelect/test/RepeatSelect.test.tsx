// (C) 2019-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";

import { RepeatSelect, IRepeatSelectData, IRepeatSelectProps } from "../RepeatSelect";
import { RepeatExecuteOnSelect } from "../RepeatExecuteOnSelect";
import { RepeatFrequencySelect } from "../RepeatFrequencySelect";
import { RepeatPeriodSelect } from "../RepeatPeriodSelect";
import { RepeatTypeSelect } from "../RepeatTypeSelect";
import { REPEAT_EXECUTE_ON, REPEAT_FREQUENCIES, REPEAT_TYPES } from "../../../constants";
import { IntlWrapper } from "../../../../../localization/IntlWrapper";

import {
    openDropdown,
    REPEAT_EXECUTE_ON_INDEX,
    REPEAT_FREQUENCY_INDEX,
    REPEAT_TYPE_INDEX,
    selectDropdownItem,
} from "./testUtils";

describe("RepeatSelect", () => {
    const now = new Date();
    const DEFAULT_REPEAT_DATA: IRepeatSelectData = {
        repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
        repeatFrequency: REPEAT_FREQUENCIES.DAY,
        repeatPeriod: 1,
        repeatType: REPEAT_TYPES.DAILY,
    };

    function renderComponent(customProps: Partial<IRepeatSelectProps> = {}): ReactWrapper {
        const defaultProps = {
            label: "Repeats:",
            startDate: now,
            onChange: noop,
            ...DEFAULT_REPEAT_DATA,
            ...customProps,
        };

        return mount(
            <IntlWrapper>
                <RepeatSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    let component: ReactWrapper;
    afterEach(() => {
        component.unmount();
    });

    it("should render component", () => {
        component = renderComponent();
        expect(component).toExist();
    });

    describe("Toggle components", () => {
        it.each([
            ["not show", REPEAT_TYPES.DAILY, false],
            ["not show", REPEAT_TYPES.WEEKLY, false],
            ["not show", REPEAT_TYPES.MONTHLY, false],
            ["show", REPEAT_TYPES.CUSTOM, true],
        ])(
            "should %s repeat options when repeat type is %s",
            (_expectedAction: string, repeatType: string, expectedExists: boolean) => {
                component = renderComponent({
                    repeatType,
                });
                expect(component.find(RepeatPeriodSelect).exists()).toBe(expectedExists);
                expect(component.find(RepeatFrequencySelect).exists()).toBe(expectedExists);
            },
        );

        it.each([
            ["not show", REPEAT_FREQUENCIES.DAY, false],
            ["not show", REPEAT_FREQUENCIES.WEEK, false],
            ["show", REPEAT_FREQUENCIES.MONTH, true],
        ])(
            "should %s repeat execute dropdown when repeat frequency is %s",
            (_expectedAction: string, repeatFrequency: string, expectedExists: boolean) => {
                component = renderComponent({
                    repeatFrequency,
                    repeatType: REPEAT_TYPES.CUSTOM,
                });
                expect(component.find(RepeatExecuteOnSelect).exists()).toBe(expectedExists);
            },
        );
    });

    describe("onChange event", () => {
        it.each([
            [REPEAT_TYPES.DAILY, REPEAT_TYPES.WEEKLY],
            [REPEAT_TYPES.WEEKLY, REPEAT_TYPES.DAILY],
            [REPEAT_TYPES.MONTHLY, REPEAT_TYPES.DAILY],
            [REPEAT_TYPES.CUSTOM, REPEAT_TYPES.DAILY],
        ])("should trigger onChange with selected repeat type is %s", (selected: string, current: string) => {
            const onChange = jest.fn();
            component = renderComponent({ repeatType: current, onChange });

            openDropdown(component.find(RepeatTypeSelect));
            selectDropdownItem(component, REPEAT_TYPE_INDEX[selected]);
            expect(onChange).toHaveBeenCalledWith({
                ...DEFAULT_REPEAT_DATA,
                repeatType: selected,
            });
        });

        it("should trigger onChange with selected repeat period", () => {
            const onChange = jest.fn();
            component = renderComponent({ repeatType: REPEAT_TYPES.CUSTOM, onChange });

            const repeatPeriodField = component.find(RepeatPeriodSelect).find(".gd-input-field");
            repeatPeriodField.simulate("change", { target: { value: "10" } });
            expect(onChange).toHaveBeenCalledWith({
                ...DEFAULT_REPEAT_DATA,
                repeatPeriod: 10,
                repeatType: REPEAT_TYPES.CUSTOM,
            });
        });

        it.each([
            [REPEAT_FREQUENCIES.DAY, REPEAT_FREQUENCIES.WEEK],
            [REPEAT_FREQUENCIES.WEEK, REPEAT_FREQUENCIES.DAY],
            [REPEAT_FREQUENCIES.MONTH, REPEAT_FREQUENCIES.DAY],
        ])(
            "should trigger onChange with selected repeat frequency is %s",
            (selected: string, current: string) => {
                const onChange = jest.fn();
                component = renderComponent({
                    repeatFrequency: current,
                    repeatType: REPEAT_TYPES.CUSTOM,
                    onChange,
                });

                openDropdown(component.find(RepeatFrequencySelect));
                selectDropdownItem(component, REPEAT_FREQUENCY_INDEX[selected]);
                expect(onChange).toHaveBeenCalledWith({
                    ...DEFAULT_REPEAT_DATA,
                    repeatFrequency: selected,
                    repeatType: REPEAT_TYPES.CUSTOM,
                });
            },
        );

        it.each([
            [REPEAT_EXECUTE_ON.DAY_OF_WEEK, REPEAT_EXECUTE_ON.DAY_OF_MONTH],
            [REPEAT_EXECUTE_ON.DAY_OF_MONTH, REPEAT_EXECUTE_ON.DAY_OF_WEEK],
        ])("should trigger onChange with repeat execute on %s", (selected: string, current: string) => {
            const onChange = jest.fn();
            component = renderComponent({
                repeatExecuteOn: current,
                repeatFrequency: REPEAT_FREQUENCIES.MONTH,
                repeatType: REPEAT_TYPES.CUSTOM,
                onChange,
            });

            openDropdown(component.find(RepeatExecuteOnSelect));
            selectDropdownItem(component, REPEAT_EXECUTE_ON_INDEX[selected]);
            expect(onChange).toHaveBeenCalledWith({
                ...DEFAULT_REPEAT_DATA,
                repeatExecuteOn: selected,
                repeatFrequency: REPEAT_FREQUENCIES.MONTH,
                repeatType: REPEAT_TYPES.CUSTOM,
            });
        });

        it("should reset repeatData when repeatType is changed", () => {
            const onChange = jest.fn();
            component = renderComponent({
                repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                repeatFrequency: REPEAT_FREQUENCIES.MONTH,
                repeatPeriod: 10,
                repeatType: REPEAT_TYPES.CUSTOM,
                onChange,
            });

            openDropdown(component.find(RepeatTypeSelect));
            selectDropdownItem(component, REPEAT_TYPE_INDEX[REPEAT_TYPES.DAILY]);
            expect(onChange).toHaveBeenCalledWith(DEFAULT_REPEAT_DATA);
        });
    });
});
