// (C) 2007-2020 GoodData Corporation
import React from "react";
import moment from "moment-timezone";
import { FormattedMessage, FormattedTime, FormattedDate } from "react-intl";

/**
 * @internal
 */
export interface IInsightListItemDateConfig {
    isCurrentYear: boolean;
    isToday: boolean;
    isYesterday: boolean;
    date: Date;
}

/**
 * @internal
 */
export interface IInsightListItemDateProps {
    config: IInsightListItemDateConfig;
}

/**
 * @internal
 */
export const InsightListItemDate: React.FC<IInsightListItemDateProps> = ({ config }) => {
    const relativeDate = config.isToday ? "gs.date.today" : "gs.date.yesterday";

    if (config.isToday || config.isYesterday) {
        return (
            <span>
                <FormattedMessage id={relativeDate} />
                &nbsp;
                <FormattedMessage id="gs.date.at" />
                &nbsp;
                <FormattedTime value={config.date} format="hhmm" />
            </span>
        );
    } else if (config.isCurrentYear) {
        return <FormattedDate value={config.date} format="shortWithoutYear" />;
    }

    return <FormattedDate value={config.date} format="shortWithYear" />;
};

export const META_DATA_TIMEZONE = "Europe/Prague";
const FORMAT_DATE = "YYYY-MM-DD";
const FORMAT_YEAR = "YYYY";

/**
 * @internal
 */
const sameFormatted = (firstDate: moment.Moment, secondDate: moment.Moment, format: string) =>
    firstDate.format(format) === secondDate.format(format);

/**
 * @internal
 */
export interface IDateTimeConfigOptions {
    dateTimezone?: string;
    now?: Date;
}

/**
 * Build date time config for InsightListItemDate component.
 *
 * @param date - string ISO date
 * @param options - optional options object
 * @returns date time config
 *
 * @internal
 */
export function getDateTimeConfig(
    date: string,
    options: IDateTimeConfigOptions = {},
): IInsightListItemDateConfig {
    const { dateTimezone = META_DATA_TIMEZONE, now = new Date() } = options;

    const dateWithTimezone = moment.tz(date, dateTimezone);
    const dateWithTimezoneInLocal = dateWithTimezone.clone().local();

    const NOW = moment(now);
    const TODAY = moment(now);
    const YESTERDAY = moment(now).subtract(1, "days");

    const isToday = sameFormatted(dateWithTimezoneInLocal, TODAY, FORMAT_DATE);
    const isYesterday = sameFormatted(dateWithTimezoneInLocal, YESTERDAY, FORMAT_DATE);
    const isCurrentYear = sameFormatted(dateWithTimezoneInLocal, NOW, FORMAT_YEAR);

    return {
        date: dateWithTimezone.toDate(),
        isToday,
        isYesterday,
        isCurrentYear,
    };
}
