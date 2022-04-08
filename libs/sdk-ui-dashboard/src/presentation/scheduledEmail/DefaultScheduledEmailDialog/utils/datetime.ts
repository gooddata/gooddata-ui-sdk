// (C) 2019-2022 GoodData Corporation
import isDate from "lodash/isDate";
import format from "date-fns/format";

import { PLATFORM_DATE_FORMAT } from "../constants";
import { IntlShape } from "react-intl";
import capitalize from "lodash/capitalize";

export function convertDateToPlatformDateString(date: Date): string;
export function convertDateToPlatformDateString(date: Date | undefined | null): string | undefined | null {
    return isDate(date) ? format(date, PLATFORM_DATE_FORMAT) : date;
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
