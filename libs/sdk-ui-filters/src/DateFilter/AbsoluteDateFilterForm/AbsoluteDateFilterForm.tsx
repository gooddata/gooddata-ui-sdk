// (C) 2007-2025 GoodData Corporation
import React from "react";

import { DayPickerRangeProps } from "react-day-picker";

import { IAbsoluteDateFilterForm, WeekStart } from "@gooddata/sdk-model";

import { dateFilterValueToDateRange, dateRangeToDateFilterValue } from "./conversions.js";
import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import { IDateRange } from "../DateRangePicker/types.js";
import { DateFilterOption } from "../interfaces/index.js";

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormProps {
    dateFormat: string;
    selectedFilterOption: IAbsoluteDateFilterForm;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    withoutApply?: boolean;
    submitForm: () => void;
}

const dayPickerProps: DayPickerRangeProps = {
    mode: "range",
    weekStartsOn: 0, // Sunday, regardless of locale
};

/**
 * @internal
 */
export function AbsoluteDateFilterForm({
    dateFormat,
    isMobile,
    selectedFilterOption,
    isTimeEnabled,
    weekStart,
    shouldOverlayDatePicker,
    withoutApply,
    onSelectedFilterOptionChange,
    submitForm,
}: IAbsoluteDateFilterFormProps) {
    const handleRangeChange = (range: IDateRange): void => {
        onSelectedFilterOptionChange(
            dateRangeToDateFilterValue(range, selectedFilterOption.localIdentifier, isTimeEnabled),
        );
    };

    return (
        <DateRangePicker
            dateFormat={dateFormat}
            onRangeChange={handleRangeChange}
            range={dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled)}
            isMobile={isMobile}
            dayPickerProps={dayPickerProps}
            isTimeEnabled={isTimeEnabled}
            weekStart={weekStart}
            shouldOverlayDatePicker={shouldOverlayDatePicker}
            submitForm={submitForm}
            withoutApply={withoutApply}
        />
    );
}
