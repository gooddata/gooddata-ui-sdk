// (C) 2025 GoodData Corporation

import React, { forwardRef } from "react";
import cx from "classnames";

import { DateTimePickerWithIntl } from "./DateTimePicker.js";
import { IDateRangeInputFieldProps, DATE_INPUT_HINT_ID, TIME_INPUT_HINT_ID } from "./types.js";

export const StartDateInputField = forwardRef<HTMLInputElement, IDateRangeInputFieldProps>(
    (
        {
            value,
            onKeyDown,
            onChange,
            onInputMarkedValid,
            onInputClick,
            errors,
            dateFormat,
            isMobile,
            isTimeEnabled,
            intl,
        },
        ref,
    ) => {
        return (
            <DateTimePickerWithIntl
                onKeyDown={onKeyDown}
                ref={ref}
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateFrom" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeFrom" })}
                accessibilityConfig={{
                    dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.from" }),
                    timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.from" }),
                    dateInputHintId: DATE_INPUT_HINT_ID,
                    timeInputHintId: TIME_INPUT_HINT_ID,
                }}
                onChange={onChange}
                onInputMarkedValid={onInputMarkedValid}
                value={value}
                dateFormat={dateFormat}
                isMobile={isMobile}
                handleDayClick={onInputClick}
                isTimeEnabled={isTimeEnabled}
                className={cx("s-date-range-picker-from", "gd-date-range-picker-from")}
                errors={errors}
            />
        );
    },
);

StartDateInputField.displayName = "FromInputField";
