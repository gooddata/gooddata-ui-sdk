// (C) 2007-2020 GoodData Corporation
import React from "react";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import subDays from "date-fns/subDays";
import parseISO from "date-fns/parseISO";
import isSameDay from "date-fns/isSameDay";
import isSameYear from "date-fns/isSameYear";
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

const META_TIMEZONE = "Europe/Prague";

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
 * @param date
 * @param options
 * @returns date time config
 *
 * @internal
 */
export function getDateTimeConfig(
    date: string,
    options: IDateTimeConfigOptions = {},
): IInsightListItemDateConfig {
    const { dateTimezone = META_TIMEZONE, now = new Date() } = options;

    const dateWithTimezoneInLocal = parseISO(date);
    const dateWithTimezone = utcToZonedTime(dateWithTimezoneInLocal, dateTimezone);

    const yesterday = subDays(now, 1);

    const isToday = isSameDay(dateWithTimezoneInLocal, now);
    const isYesterday = isSameDay(dateWithTimezoneInLocal, yesterday);
    const isCurrentYear = isSameYear(dateWithTimezoneInLocal, now);

    return {
        date: dateWithTimezone,
        isToday,
        isYesterday,
        isCurrentYear,
    };
}
