// (C) 2019-2023 GoodData Corporation
import * as React from "react";
import { Datepicker, Timepicker } from "@gooddata/sdk-ui-kit";

import { IScheduleEmailRepeatTime } from "../interfaces.js";
import { DEFAULT_DROPDOWN_ZINDEX } from "../constants.js";

import { WeekStart } from "@gooddata/sdk-model";

const MAX_VISIBLE_ITEMS_COUNT = 5;

interface IDateTimeOwnProps {
    date: Date;
    dateFormat?: string;
    label: string;
    locale?: string;
    timezone: string;
    onDateChange: (date: Date) => void;
    onTimeChange: (time: IScheduleEmailRepeatTime) => void;
    weekStart?: WeekStart;
}

export type IDateTimeProps = IDateTimeOwnProps;

export class DateTime extends React.PureComponent<IDateTimeProps> {
    public render() {
        const { date, dateFormat, label, locale, timezone, onDateChange, weekStart } = this.props;

        return (
            <div className="gd-input-component gd-schedule-email-dialog-datetime s-gd-schedule-email-dialog-datetime">
                <label className="gd-label">{label}</label>
                <div>
                    <Datepicker
                        date={date}
                        dateFormat={dateFormat}
                        locale={locale}
                        placeholder={dateFormat}
                        resetOnInvalidValue={true}
                        onChange={onDateChange}
                        weekStart={weekStart}
                    />
                    <Timepicker
                        className="gd-schedule-email-dialog-datetime-time"
                        maxVisibleItemsCount={MAX_VISIBLE_ITEMS_COUNT}
                        skipNormalizeTime
                        time={date}
                        onChange={this.timeChange}
                        overlayPositionType="sameAsTarget"
                        overlayZIndex={DEFAULT_DROPDOWN_ZINDEX}
                    />
                    <span className="gd-schedule-email-dialog-datetime-timezone s-gd-schedule-email-dialog-datetime-timezone">
                        {timezone}
                    </span>
                </div>
            </div>
        );
    }

    private timeChange = (selectedTime: Date): void => {
        this.props.onTimeChange({
            hour: selectedTime.getHours(),
            minute: selectedTime.getMinutes(),
            second: selectedTime.getSeconds(),
        });
    };
}
