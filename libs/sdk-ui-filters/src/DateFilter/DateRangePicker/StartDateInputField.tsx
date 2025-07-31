// (C) 2025 GoodData Corporation

import React, { forwardRef, useMemo } from "react";
import cx from "classnames";

import { DAY_START_TIME } from "../constants/Platform.js";
import { getLocalizedDateFormat } from "../utils/FormattingUtils.js";

import { DateTimePicker, IDateTimePickerAccessibilityConfig } from "./DateTimePicker.js";
import {
    IDateRangeInputFieldProps,
    DATE_INPUT_HINT_ID,
    TIME_INPUT_HINT_ID,
    InputErrorMessageTexts,
} from "./types.js";

export const StartDateInputField = forwardRef<HTMLInputElement, IDateRangeInputFieldProps>(
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
            withoutApply,
        },
        ref,
    ) => {
        const accessibilityConfig = useMemo<IDateTimePickerAccessibilityConfig>(
            () => ({
                dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.from" }),
                timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.from" }),
                dateInputHintId: DATE_INPUT_HINT_ID,
                timeInputHintId: TIME_INPUT_HINT_ID,
            }),
            [intl],
        );
        const inputErrorMessageTexts = useMemo<InputErrorMessageTexts>(
            () => ({
                dateInput: {
                    emptyDate: intl.formatMessage({ id: "filters.staticPeriod.errors.emptyStartDate" }),
                    invalidDate: intl.formatMessage(
                        { id: "filters.staticPeriod.errors.invalidStartDate" },
                        { format: dateFormat || getLocalizedDateFormat(intl.locale) },
                    ),
                    startDateAfterEndDate: intl.formatMessage({
                        id: "filters.staticPeriod.errors.startDateAfterEndDate",
                    }),
                },
                timeInput: {
                    startTimeAfterEndTime: intl.formatMessage({
                        id: "filters.staticPeriod.errors.startTimeAfterEndTime",
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
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateFrom" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeFrom" })}
                dateTimeLegendLabel={intl.formatMessage({ id: "filters.staticPeriod.dateTimeFrom" })}
                accessibilityConfig={accessibilityConfig}
                dateFormat={dateFormat}
                isMobile={isMobile}
                onDayClick={onInputClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-from", "gd-date-range-picker-from")}
                defaultTime={DAY_START_TIME}
                inputErrorMessageTexts={inputErrorMessageTexts}
                errors={errors}
                withoutApply={withoutApply}
            />
        );
    },
);

StartDateInputField.displayName = "FromInputField";
