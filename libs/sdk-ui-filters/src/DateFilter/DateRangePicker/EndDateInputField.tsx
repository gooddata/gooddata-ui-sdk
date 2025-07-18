// (C) 2025 GoodData Corporation

import { forwardRef, useMemo } from "react";
import cx from "classnames";

import { DAY_END_TIME } from "../constants/Platform.js";
import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

import { DateTimePicker, IDateTimePickerAccessibilityConfig } from "./DateTimePicker.js";
import {
    IDateRangeInputFieldProps,
    TIME_INPUT_HINT_ID,
    DATE_INPUT_HINT_ID,
    InputErrorMessageTexts,
} from "./types.js";

export const EndDateInputField = forwardRef<HTMLInputElement, IDateRangeInputFieldProps>(
    (
        {
            date,
            time,
            onDateInputKeyDown,
            onDateChange,
            onTimeChange,
            onInputClick,
            dateFormat,
            isMobile,
            isTimeEnabled,
            errors,
            intl,
        },
        ref,
    ) => {
        const accessibilityConfig = useMemo<IDateTimePickerAccessibilityConfig>(
            () => ({
                dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.to" }),
                timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.to" }),
                dateInputHintId: DATE_INPUT_HINT_ID,
                timeInputHintId: TIME_INPUT_HINT_ID,
            }),
            [intl],
        );
        const inputErrorMessageTexts = useMemo<InputErrorMessageTexts>(
            () => ({
                dateInput: {
                    emptyDate: intl.formatMessage({ id: "filters.staticPeriod.errors.emptyEndDate" }),
                    invalidDate: intl.formatMessage(
                        { id: "filters.staticPeriod.errors.invalidEndDate" },
                        { format: dateFormat || getLocalizedDateFormat(intl.locale) },
                    ),
                    startDateAfterEndDate: intl.formatMessage({
                        id: "filters.staticPeriod.errors.endDateBeforeStartDate",
                    }),
                },
                timeInput: {
                    startTimeAfterEndTime: intl.formatMessage({
                        id: "filters.staticPeriod.errors.endTimeBeforeStartTime",
                    }),
                },
            }),
            [intl, dateFormat],
        );
        return (
            <DateTimePicker
                ref={ref}
                date={date}
                time={time}
                onDateChange={onDateChange}
                onTimeChange={onTimeChange}
                onDateInputKeyDown={onDateInputKeyDown}
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateTo" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeTo" })}
                accessibilityConfig={accessibilityConfig}
                dateFormat={dateFormat}
                isMobile={isMobile}
                onDayClick={onInputClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-to", "gd-date-range-picker-to")}
                defaultTime={DAY_END_TIME}
                inputErrorMessageTexts={inputErrorMessageTexts}
                errors={errors}
            />
        );
    },
);

EndDateInputField.displayName = "ToInputField";
