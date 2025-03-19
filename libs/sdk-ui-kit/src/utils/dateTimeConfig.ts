// (C) 2007-2024 GoodData Corporation

import toDate from "date-fns-tz/toDate";
import subDays from "date-fns/subDays/index.js";
import isSameDay from "date-fns/isSameDay/index.js";
import isSameYear from "date-fns/isSameYear/index.js";

/**
 * @internal
 */
export const META_DATA_TIMEZONE = "Europe/Prague";

/**
 * @internal
 */
export interface IDateTimeConfigOptions {
    dateTimezone?: string;
    now?: Date;
}

/**
 * @internal
 */
export interface IDateConfig {
    isCurrentYear: boolean;
    isToday: boolean;
    isYesterday: boolean;
    date: Date;
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
export function getDateTimeConfig(date: string, options: IDateTimeConfigOptions = {}): IDateConfig {
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
