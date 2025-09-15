// (C) 2007-2025 GoodData Corporation

import { isSameDay, isSameYear, subDays } from "date-fns";
import { toDate } from "date-fns-tz";

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
