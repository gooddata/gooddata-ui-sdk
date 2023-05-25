// (C) 2019-2023 GoodData Corporation
import isDate from "lodash/isDate.js";
import format from "date-fns/format/index.js";

import { PLATFORM_DATE_FORMAT } from "../constants.js";
import { IntlShape } from "react-intl";
import capitalize from "lodash/capitalize.js";

export function convertDateToPlatformDateString(date: Date): string;
export function convertDateToPlatformDateString(date: Date | undefined | null): string | undefined | null {
    return isDate(date) ? format(date, PLATFORM_DATE_FORMAT) : date;
}

export function convertDateToDisplayDateString(date: Date, dateFormat: string): string;
export function convertDateToDisplayDateString(
    date: Date | undefined | null,
    dateFormat: string,
): string | undefined | null {
    // In schedule email dialog, use date string as sub-fix of attached file name
    // to avoid "/" character in file name
    const DISPLAY_DATE_FORMAT_MAPPER: Record<string, string> = {
        "MM/dd/yyyy": "MM-dd-yyyy",
        "dd/MM/yyyy": "dd-MM-yyyy",
        "M/d/yy": "M-d-yy",
    };
    const displayDateFormat = DISPLAY_DATE_FORMAT_MAPPER[dateFormat] || dateFormat;
    return isDate(date) ? format(date, displayDateFormat) : date;
}

export function getDate(date: Date): number {
    return date.getDate();
}

export function getDayName(date: Date): string {
    return format(date, "eeee");
}

export function getIntlDayName(intl: IntlShape, startDate: Date): string {
    return capitalize(intl.formatDate(startDate, { weekday: "long" }));
}

export function convertSun2MonWeekday(dayIndex: number): number {
    return dayIndex === 0 ? 7 : dayIndex;
}

export function getDay(date: Date): number {
    return convertSun2MonWeekday(date.getDay());
}

export function getWeek(date: Date): number {
    return Math.ceil(date.getDate() / 7);
}

export function getMonth(date: Date): number {
    return date.getMonth() + 1;
}

export function getYear(date: Date): number {
    return date.getFullYear();
}
