// (C) 2024-2025 GoodData Corporation

import React, { useState, useCallback } from "react";
import cx from "classnames";
import { WeekStart } from "@gooddata/sdk-model";
import { Datepicker } from "../Datepicker/index.js";
import { Timepicker, normalizeTime } from "../Timepicker/index.js";
import { DEFAULT_DROPDOWN_ZINDEX, TIME_ANCHOR } from "./constants.js";
import { defineMessages, FormattedMessage } from "react-intl";
import { parseDate } from "../Datepicker/Datepicker.js";
import { useIdPrefixed } from "../utils/useId.js";

interface IDateTimeProps {
    label: string;
    date: Date | null;
    locale?: string;
    timezone?: string;
    weekStart?: WeekStart;
    dateFormat?: string;
    timeFormat?: string;
    onDateChange: (date: Date | null, valid: boolean) => void;
    closeOnParentScroll?: boolean;
    onKeyDownSubmit?: (e: React.KeyboardEvent) => void;
}

const errorMessages = defineMessages({
    empty: { id: "recurrence.datetime.empty.error" },
    wrongFormat: { id: "recurrence.datetime.wrong.format.error" },
});

export const DateTime: React.FC<IDateTimeProps> = (props) => {
    const {
        label,
        date,
        dateFormat,
        locale,
        timezone,
        onDateChange,
        weekStart,
        timeFormat,
        closeOnParentScroll,
        onKeyDownSubmit,
    } = props;

    const [errorDate, setErrorDate] = useState<string | null>(null);

    const errorId = useIdPrefixed("error");

    const validate = useCallback(
        (selectedDate: string) => {
            const parsedDate = parseDate(selectedDate, dateFormat);

            if (selectedDate.length === 0) {
                setErrorDate(errorMessages.empty.id);
            } else if (!parsedDate) {
                setErrorDate(errorMessages.wrongFormat.id);
            } else {
                setErrorDate(null);
            }
        },
        [dateFormat],
    );

    const handleDateChange = useCallback(
        (selectedDate: Date | null) => {
            const newDate = normalizeTime(date, selectedDate, TIME_ANCHOR);
            onDateChange(newDate, !!selectedDate);
        },
        [date, onDateChange],
    );

    const handleDateBlur = useCallback(
        (selectedDate: string) => {
            validate(selectedDate);
        },
        [validate],
    );

    const handleDateValidate = useCallback(
        (value: string) => {
            if (errorDate) {
                validate(value);
            }
        },
        [errorDate, validate],
    );

    const handleTimeChange = useCallback(
        (selectedTime: Date | null) => {
            const newDate = normalizeTime(selectedTime, date, TIME_ANCHOR);
            onDateChange(newDate, !!selectedTime);
        },
        [date, onDateChange],
    );

    const handleOnDateInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        validate(e.currentTarget.value);
        onKeyDownSubmit?.(e);
    };

    const datePickerClassNames = cx("gd-recurrence-form-datetime-date s-recurrence-form-datetime-date", {
        "has-error": errorDate,
    });

    return (
        <div className="gd-recurrence-form-datetime s-recurrence-form-datetime gd-input-component">
            <div className="gd-label">{label}</div>
            <div className="gd-recurrence-form-datetime-inner">
                <div className="gd-recurrence-form-date">
                    <Datepicker
                        className={datePickerClassNames}
                        date={date}
                        dateFormat={dateFormat}
                        locale={locale}
                        placeholder={dateFormat}
                        onChange={handleDateChange}
                        onValidateInput={handleDateValidate}
                        onBlur={handleDateBlur}
                        weekStart={weekStart}
                        accessibilityConfig={{
                            ariaDescribedBy: errorDate ? errorId : undefined,
                        }}
                        onDateInputKeyDown={handleOnDateInputKeyDown}
                    />
                    {errorDate ? (
                        <span id={errorId} className="gd-recurrence-form-datetime-error-message">
                            <FormattedMessage id={errorDate} values={{ dateFormat }} />
                        </span>
                    ) : (
                        <span className="gd-recurrence-form-datetime-help">
                            <FormattedMessage id="recurrence.datetime.format.help" values={{ dateFormat }} />
                        </span>
                    )}
                </div>
                <Timepicker
                    className="gd-recurrence-form-datetime-time s-recurrence-form-datetime-time"
                    time={date}
                    onChange={handleTimeChange}
                    overlayPositionType="sameAsTarget"
                    overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                    timeAnchor={TIME_ANCHOR}
                    timeFormat={timeFormat}
                    closeOnParentScroll={closeOnParentScroll}
                />
            </div>
            {timezone ? (
                <div className="gd-recurrence-form-datetime-timezone s-recurrence-form-datetime-timezone">
                    {timezone}
                </div>
            ) : null}
        </div>
    );
};
