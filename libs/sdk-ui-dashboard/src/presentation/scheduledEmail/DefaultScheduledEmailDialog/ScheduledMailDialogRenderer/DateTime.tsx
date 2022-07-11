// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { Datepicker, Timepicker } from "@gooddata/sdk-ui-kit";

import { IScheduleEmailRepeatTime } from "../interfaces";
import { DEFAULT_DROPDOWN_ZINDEX } from "../constants";

const MAX_VISIBLE_ITEMS_COUNT = 5;

interface IDateTimeOwnProps {
    date: Date;
    dateFormat?: string;
    label: string;
    locale?: string;
    timezone: string;
    onDateChange: (date: Date) => void;
    onTimeChange: (time: IScheduleEmailRepeatTime) => void;
}

export type IDateTimeProps = IDateTimeOwnProps;

export class DateTime extends React.PureComponent<IDateTimeProps> {
    public render() {
        const { date, dateFormat, label, locale, timezone, onDateChange } = this.props;

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
