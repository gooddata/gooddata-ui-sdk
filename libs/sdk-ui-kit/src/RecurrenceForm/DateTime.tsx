// (C) 2024-2025 GoodData Corporation

import React, { useState } from "react";
import cx from "classnames";
import { WeekStart } from "@gooddata/sdk-model";
import { Datepicker } from "../Datepicker/index.js";
import { Timepicker, normalizeTime } from "../Timepicker/index.js";
import { DEFAULT_DROPDOWN_ZINDEX, MAX_VISIBLE_TIME_ITEMS_COUNT, TIME_ANCHOR } from "./constants.js";
import { defineMessages, FormattedMessage } from "react-intl";
import { parseDate } from "../Datepicker/Datepicker.js";

const DATE_TIME_ERROR_ID = "date-time-error-id";

interface IDateTimeProps {
    label: string;
    date: Date | null;
    locale?: string;
    timezone?: string;
    weekStart?: WeekStart;
    dateFormat?: string;
    timeFormat?: string;
    onDateChange: (date: Date | null, valid: boolean) => void;
}

const errorMessages = defineMessages({
    empty: { id: "recurrence.datetime.empty.error" },
    wrongFormat: { id: "recurrence.datetime.wrong.format.error" },
});

export const DateTime: React.FC<IDateTimeProps> = (props) => {
    const { label, date, dateFormat, locale, timezone, onDateChange, weekStart, timeFormat } = props;

    const [errorDate, setErrorDate] = useState(null);

    const validateDate = (selectedDate: string) => {
        const parsedDate = parseDate(selectedDate, dateFormat);

        if (selectedDate.length === 0) {
            setErrorDate(errorMessages.empty.id);
        } else if (!parsedDate) {
            setErrorDate(errorMessages.wrongFormat.id);
        } else {
            setErrorDate(null);
        }
    };
    const handleDateChange = (selectedDate: Date | null) => {
        const newDate = normalizeTime(date, selectedDate, TIME_ANCHOR);
        onDateChange(newDate, !!selectedDate);
    };

    const handleDateBlur = (selectedDate: string) => {
        validateDate(selectedDate);
    };

    const handleDateValidate = (value: string) => {
        if (errorDate) {
            validateDate(value);
        }
    };

    const handleTimeChange = (selectedTime: Date | null) => {
        const newDate = normalizeTime(selectedTime, date, TIME_ANCHOR);
        onDateChange(newDate, !!selectedTime);
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
                            ariaDescribedBy: errorDate ? DATE_TIME_ERROR_ID : undefined,
                        }}
                    />
                    {errorDate ? (
                        <span id={DATE_TIME_ERROR_ID} className="gd-recurrence-form-datetime-error-message">
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
                    maxVisibleItemsCount={MAX_VISIBLE_TIME_ITEMS_COUNT}
                    time={date}
                    onChange={handleTimeChange}
                    overlayPositionType="sameAsTarget"
                    overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                    timeAnchor={TIME_ANCHOR}
                    timeFormat={timeFormat}
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
