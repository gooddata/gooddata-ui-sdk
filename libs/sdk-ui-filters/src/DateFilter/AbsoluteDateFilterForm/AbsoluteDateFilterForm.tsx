// (C) 2007-2026 GoodData Corporation

import { type DayPickerProps } from "react-day-picker";

import { type WeekStart } from "@gooddata/sdk-model";

import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import { type IDateRange } from "../DateRangePicker/types.js";
import { type DateFilterOption, type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import { dateFilterValueToDateRange, dateRangeToDateFilterValue } from "./conversions.js";

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormProps {
    dateFormat: string;
    selectedFilterOption: IUiAbsoluteDateFilterForm;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    withoutApply?: boolean;
    submitForm: () => void;
}

const dayPickerProps: DayPickerProps = {
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
    isSecondsEnabled = false,
    weekStart,
    shouldOverlayDatePicker,
    withoutApply,
    onSelectedFilterOptionChange,
    submitForm,
}: IAbsoluteDateFilterFormProps) {
    const handleRangeChange = (range: IDateRange): void => {
        onSelectedFilterOptionChange(
            dateRangeToDateFilterValue(
                range,
                selectedFilterOption.localIdentifier,
                isTimeEnabled,
                selectedFilterOption.emptyValueHandling,
                isSecondsEnabled,
            ),
        );
    };

    return (
        <DateRangePicker
            dateFormat={dateFormat}
            onRangeChange={handleRangeChange}
            range={dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled, isSecondsEnabled)}
            isMobile={isMobile}
            dayPickerProps={dayPickerProps}
            isTimeEnabled={isTimeEnabled}
            isSecondsEnabled={isSecondsEnabled}
            weekStart={weekStart}
            shouldOverlayDatePicker={shouldOverlayDatePicker}
            submitForm={submitForm}
            withoutApply={withoutApply}
        />
    );
}
