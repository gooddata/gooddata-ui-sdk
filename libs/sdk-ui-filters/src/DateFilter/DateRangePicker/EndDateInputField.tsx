// (C) 2025 GoodData Corporation

import React, { forwardRef } from "react";
import cx from "classnames";

import { DAY_END_TIME } from "../constants/Platform.js";

import { DateTimePickerWithIntl } from "./DateTimePicker.js";
import { IDateRangeInputFieldProps, TIME_INPUT_HINT_ID, DATE_INPUT_HINT_ID } from "./types.js";

export const EndDateInputField = forwardRef<HTMLInputElement, IDateRangeInputFieldProps>(
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
                dateInputLabel={intl.formatMessage({ id: "filters.staticPeriod.dateTo" })}
                timeInputLabel={intl.formatMessage({ id: "filters.staticPeriod.timeTo" })}
                accessibilityConfig={{
                    dateAriaLabel: intl.formatMessage({ id: "filters.date.accessibility.label.to" }),
                    timeAriaLabel: intl.formatMessage({ id: "filters.time.accessibility.label.to" }),
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
                className={cx("s-date-range-picker-to", "gd-date-range-picker-to")}
                defaultTime={DAY_END_TIME}
                errors={errors}
            />
        );
    },
);

EndDateInputField.displayName = "ToInputField";
