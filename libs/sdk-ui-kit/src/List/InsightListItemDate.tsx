// (C) 2007-2020 GoodData Corporation
import React from "react";
import toDate from "date-fns-tz/toDate";
import subDays from "date-fns/subDays";
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

export const META_DATA_TIMEZONE = "Europe/Prague";

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

    const dateInLocalTimezone = toDate(date, { timeZone: dateTimezone });
    const yesterday = subDays(now, 1);

    const isToday = isSameDay(dateInLocalTimezone, now);
    const isYesterday = isSameDay(dateInLocalTimezone, yesterday);
    const isCurrentYear = isSameYear(dateInLocalTimezone, now);

    return {
        date: dateInLocalTimezone,
        isToday,
        isYesterday,
        isCurrentYear,
    };
}
