// (C) 2007-2025 GoodData Corporation
import React from "react";
import { DayPickerRangeProps } from "react-day-picker";
import { IAbsoluteDateFilterForm, WeekStart } from "@gooddata/sdk-model";

import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import {
    IExtendedDateFilterErrors,
    DateFilterOption,
    IDateFilterOptionChangedDetails,
} from "../interfaces/index.js";
import { IDateRange } from "../DateRangePicker/types.js";

import { dateFilterValueToDateRange, dateRangeToDateFilterValue } from "./conversions.js";

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormProps {
    dateFormat: string;
    selectedFilterOption: IAbsoluteDateFilterForm;
    isMobile: boolean;
    errors: IExtendedDateFilterErrors["absoluteForm"];
    onSelectedFilterOptionChange: (
        option: DateFilterOption,
        changeDetails?: IDateFilterOptionChangedDetails,
    ) => void;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    onKeyDown?: (event: React.KeyboardEvent) => void;
}

const dayPickerProps: DayPickerRangeProps = {
    mode: "range",
    weekStartsOn: 0, // Sunday, regardless of locale
};

/**
 * @internal
 */
export const AbsoluteDateFilterForm: React.FC<IAbsoluteDateFilterFormProps> = ({
    dateFormat,
    isMobile,
    selectedFilterOption,
    errors,
    isTimeEnabled,
    weekStart,
    shouldOverlayDatePicker,
    onSelectedFilterOptionChange,
    onKeyDown,
}) => {
    const handleRangeChange = (range: IDateRange, changeDetails?: IDateFilterOptionChangedDetails): void => {
        onSelectedFilterOptionChange(
            dateRangeToDateFilterValue(range, selectedFilterOption.localIdentifier, isTimeEnabled),
            changeDetails,
        );
    };

    return (
        <div onKeyDown={onKeyDown}>
            <DateRangePicker
                dateFormat={dateFormat}
                onRangeChange={handleRangeChange}
                range={dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled)}
                errors={errors}
                isMobile={isMobile}
                dayPickerProps={dayPickerProps}
                isTimeEnabled={isTimeEnabled}
                weekStart={weekStart}
                shouldOverlayDatePicker={shouldOverlayDatePicker}
            />
        </div>
    );
};
