// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { WeekStart } from "@gooddata/sdk-model";
import { Datepicker } from "../Datepicker/index.js";
import { Timepicker, normalizeTime } from "../Timepicker/index.js";
import { DEFAULT_DROPDOWN_ZINDEX, MAX_VISIBLE_TIME_ITEMS_COUNT, TIME_ANCHOR } from "./constants.js";

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

export const DateTime: React.FC<IDateTimeProps> = (props) => {
    const { label, date, dateFormat, locale, timezone, onDateChange, weekStart, timeFormat } = props;

    const handleDateChange = (selectedDate: Date | null) => {
        const newDate = normalizeTime(date, selectedDate, TIME_ANCHOR);
        onDateChange(newDate, !!selectedDate);
    };

    const handleTimeChange = (selectedTime: Date | null) => {
        const newDate = normalizeTime(selectedTime, date, TIME_ANCHOR);
        onDateChange(newDate, !!selectedTime);
    };

    return (
        <div className="gd-recurrence-form-datetime s-recurrence-form-datetime gd-input-component">
            <div className="gd-label">{label}</div>
            <div className="gd-recurrence-form-datetime-inner">
                <Datepicker
                    className="gd-recurrence-form-datetime-date s-recurrence-form-datetime-date"
                    date={date}
                    dateFormat={dateFormat}
                    locale={locale}
                    placeholder={dateFormat}
                    onChange={handleDateChange}
                    weekStart={weekStart}
                />
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
