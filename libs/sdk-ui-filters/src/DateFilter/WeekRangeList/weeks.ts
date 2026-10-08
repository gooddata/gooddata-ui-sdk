// (C) 2026 GoodData Corporation

import {
    addDays,
    addYears,
    differenceInCalendarMonths,
    format,
    isValid,
    parseISO,
    startOfWeek,
    subYears,
} from "date-fns";

import { type DateString, type WeekStart } from "@gooddata/sdk-model";

import { platformDateFnsFormat } from "../constants/Platform.js";
import { parseDate } from "../DateRangePicker/utils.js";
import { type IPeriodRange } from "../PeriodRangePicker/types.js";

const MONTH_FORMAT = "yyyy-MM";
const WINDOW_YEARS = 2;
const MAX_WINDOW_MONTHS = 120;

// The list offers only the weeks of these years. It keeps every day and month at a four-digit year, so
// that they compare as strings.
export const FIRST_LISTED_DAY: DateString = "1900-01-01";
export const LAST_LISTED_DAY: DateString = "2100-12-31";
const FIRST_LISTED_MONTH = "1900-01";
const LAST_LISTED_MONTH = "2100-12";

// Days are strings: adding days across a daylight saving change at midnight can leave a time of day on
// a date, and such dates stop comparing equal.
export interface IWeek {
    start: DateString;
    end: DateString;
}

export interface IMonthHeadingRow {
    type: "heading";
    key: string;
    /** `yyyy-MM` */
    month: string;
}

export interface IWeekRow extends IWeek {
    type: "week";
    key: string;
}

export type WeekListRow = IMonthHeadingRow | IWeekRow;

/**
 * The months whose weeks the list holds, both included, `yyyy-MM`.
 */
export interface IWeekWindow {
    firstMonth: string;
    lastMonth: string;
}

/**
 * Whole weeks, from the first day of the first week to the last day of the last one. `anchor` is the week
 * the next click closes the range with; a closed range has none.
 */
export interface IWeekSelection {
    from: DateString;
    to: DateString;
    anchor?: IWeek;
}

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Parsing by a format pattern is several times slower, and the list parses thousands of days. Only a whole
// day parses, as it does by the pattern.
function parseDay(day: DateString): Date {
    return DAY_PATTERN.test(day) ? parseISO(day) : new Date(Number.NaN);
}

function formatDay(date: Date): DateString {
    return format(date, platformDateFnsFormat);
}

function parseMonth(month: string): Date {
    return parseISO(month);
}

function shiftMonth(month: string, years: number): string {
    return format(addYears(parseMonth(month), years), MONTH_FORMAT);
}

function clampMonth(month: string): string {
    if (month < FIRST_LISTED_MONTH) {
        return FIRST_LISTED_MONTH;
    }
    return month > LAST_LISTED_MONTH ? LAST_LISTED_MONTH : month;
}

function clampDay(day: DateString): DateString {
    if (day < FIRST_LISTED_DAY) {
        return FIRST_LISTED_DAY;
    }
    return day > LAST_LISTED_DAY ? LAST_LISTED_DAY : day;
}

function readDay(day: string | undefined): DateString | undefined {
    const date = day ? parseDay(day) : undefined;

    return date && isValid(date) ? formatDay(date) : undefined;
}

function spansAtMostTenYears({ firstMonth, lastMonth }: IWeekWindow): boolean {
    return differenceInCalendarMonths(parseMonth(lastMonth), parseMonth(firstMonth)) <= MAX_WINDOW_MONTHS;
}

function weekOf(date: Date, weekStart: WeekStart): IWeek {
    const start = startOfWeek(date, { weekStartsOn: weekStart === "Monday" ? 1 : 0 });

    return { start: formatDay(start), end: formatDay(addDays(start, 6)) };
}

export function getWeek(day: DateString, weekStart: WeekStart): IWeek {
    return weekOf(parseDay(day), weekStart);
}

/**
 * The month a week is listed under: the one holding most of its days, which is the month of its fourth day.
 */
export function getWeekMonth(week: IWeek): string {
    return format(addDays(parseDay(week.start), 3), MONTH_FORMAT);
}

/**
 * The months from two years before the earliest day to two years after the latest one, within the listed
 * years.
 */
export function createWeekWindow(days: [DateString, ...DateString[]]): IWeekWindow {
    const sorted = days.map(clampDay).sort();

    return {
        firstMonth: clampMonth(format(subYears(parseDay(sorted[0]), WINDOW_YEARS), MONTH_FORMAT)),
        lastMonth: clampMonth(
            format(addYears(parseDay(sorted[sorted.length - 1]), WINDOW_YEARS), MONTH_FORMAT),
        ),
    };
}

/**
 * The window the list opens with: around the stored range, around its `from` alone when that would span
 * more than ten years, and around today without a stored `from`.
 */
export function createOpeningWeekWindow({ from, to }: IPeriodRange, today: DateString): IWeekWindow {
    const fromDay = readDay(from);
    if (!fromDay) {
        return createWeekWindow([today]);
    }

    const toDay = readDay(to);
    const window = createWeekWindow(toDay ? [fromDay, toDay] : [fromDay]);

    return spansAtMostTenYears(window) ? window : createWeekWindow([fromDay]);
}

/**
 * The day whose week the list centres on open: the stored `from`, or today without one.
 */
export function getOpeningDay({ from }: IPeriodRange, today: DateString): DateString {
    return clampDay(readDay(from) ?? today);
}

/**
 * Adds a year of months at the side, and returns the same window at a bound of the listed years.
 */
export function extendWeekWindow(window: IWeekWindow, side: "start" | "end"): IWeekWindow {
    const extended =
        side === "start"
            ? { ...window, firstMonth: clampMonth(shiftMonth(window.firstMonth, -1)) }
            : { ...window, lastMonth: clampMonth(shiftMonth(window.lastMonth, 1)) };

    return extended.firstMonth === window.firstMonth && extended.lastMonth === window.lastMonth
        ? window
        : extended;
}

/**
 * Drops a year of months at the side when the window spans more than ten years, and returns the same
 * window otherwise.
 */
export function trimWeekWindow(window: IWeekWindow, side: "start" | "end"): IWeekWindow {
    if (spansAtMostTenYears(window)) {
        return window;
    }

    return side === "start"
        ? { ...window, firstMonth: shiftMonth(window.firstMonth, 1) }
        : { ...window, lastMonth: shiftMonth(window.lastMonth, -1) };
}

/**
 * Widens the window by the day's own window when the day's week is not in it, and returns the same window
 * otherwise.
 */
export function widenWeekWindow(window: IWeekWindow, day: DateString, weekStart: WeekStart): IWeekWindow {
    const month = getWeekMonth(getWeek(day, weekStart));
    if (month >= window.firstMonth && month <= window.lastMonth) {
        return window;
    }

    const around = createWeekWindow([day]);

    return {
        firstMonth: around.firstMonth < window.firstMonth ? around.firstMonth : window.firstMonth,
        lastMonth: around.lastMonth > window.lastMonth ? around.lastMonth : window.lastMonth,
    };
}

/**
 * The window after a jump to the day. While nothing is selected, or when widening would span more than ten
 * years, the day's own window replaces it, otherwise it is widened.
 */
export function jumpWeekWindow(
    window: IWeekWindow,
    day: DateString,
    weekStart: WeekStart,
    hasSelection: boolean,
): IWeekWindow {
    const widened = widenWeekWindow(window, day, weekStart);
    if (widened === window) {
        return window;
    }

    return hasSelection && spansAtMostTenYears(widened) ? widened : createWeekWindow([day]);
}

export function getWeekRows(window: IWeekWindow, weekStart: WeekStart): WeekListRow[] {
    const rows: WeekListRow[] = [];
    // A month's first week is the one holding its fourth day.
    let week = weekOf(addDays(parseMonth(window.firstMonth), 3), weekStart);
    let month = getWeekMonth(week);
    let listedMonth: string | undefined;

    while (month <= window.lastMonth) {
        if (month !== listedMonth) {
            rows.push({ type: "heading", key: month, month });
            listedMonth = month;
        }
        rows.push({ type: "week", key: week.start, ...week });
        week = weekOf(addDays(parseDay(week.end), 1), weekStart);
        month = getWeekMonth(week);
    }

    return rows;
}

/**
 * The selection after a click on the week: an open selection closes into the ordered range between its
 * anchor and the week; otherwise the week alone is selected and becomes the anchor.
 */
export function selectWeek(selection: IWeekSelection | undefined, week: IWeek): IWeekSelection {
    const anchor = selection?.anchor;
    if (!anchor) {
        return { from: week.start, to: week.end, anchor: week };
    }

    return week.start < anchor.start
        ? { from: week.start, to: anchor.end }
        : { from: anchor.start, to: week.end };
}

export function weekSelectionToPeriodRange({ from, to }: IWeekSelection): IPeriodRange {
    return { from, to };
}

/**
 * The closed selection of a stored range, or none when the range is not whole weeks by the week start or
 * its first or last week is not listed.
 */
export function periodRangeToWeekSelection(
    { from, to }: IPeriodRange,
    weekStart: WeekStart,
): IWeekSelection | undefined {
    if (!from || !to || !isValid(parseDay(from)) || !isValid(parseDay(to))) {
        return undefined;
    }

    const isWholeWeeks =
        from <= to && getWeek(from, weekStart).start === from && getWeek(to, weekStart).end === to;
    const isListed =
        from >= getWeek(FIRST_LISTED_DAY, weekStart).start && to <= getWeek(LAST_LISTED_DAY, weekStart).end;

    return isWholeWeeks && isListed ? { from, to } : undefined;
}

type DateTimeFormatKind = "weekLabel" | "weekName" | "monthHeading";

const DATE_TIME_FORMAT_OPTIONS: Record<DateTimeFormatKind, Intl.DateTimeFormatOptions> = {
    weekLabel: { month: "short", day: "numeric" },
    weekName: { year: "numeric", month: "long", day: "numeric" },
    monthHeading: { year: "numeric", month: "long" },
};

// Creating a formatter is slow and the list labels every row, so each one is created once per locale.
const dateTimeFormats = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormat(kind: DateTimeFormatKind, locale: string): Intl.DateTimeFormat {
    const key = `${kind} ${locale}`;
    let dateTimeFormat = dateTimeFormats.get(key);
    if (!dateTimeFormat) {
        dateTimeFormat = new Intl.DateTimeFormat(locale, DATE_TIME_FORMAT_OPTIONS[kind]);
        dateTimeFormats.set(key, dateTimeFormat);
    }

    return dateTimeFormat;
}

function formatWeek(week: IWeek, locale: string, kind: DateTimeFormatKind): string {
    const dateTimeFormat = getDateTimeFormat(kind, locale);

    return `${dateTimeFormat.format(parseDay(week.start))} – ${dateTimeFormat.format(parseDay(week.end))}`;
}

export function formatWeekLabel(week: IWeek, locale: string): string {
    return formatWeek(week, locale, "weekLabel");
}

export function formatWeekAccessibleName(week: IWeek, locale: string): string {
    return formatWeek(week, locale, "weekName");
}

export function formatMonthHeading(month: string, locale: string): string {
    return getDateTimeFormat("monthHeading", locale).format(parseMonth(month));
}

export type JumpText = { day: DateString } | { error: "format" | "range" };

/**
 * Reads the jump field: the day it names, the format error while it is not a whole valid date in the date
 * format, or the range error for a day outside the listed years. Blank text reads as nothing.
 */
export function readJumpText(text: string, dateFormat: string): JumpText | undefined {
    const trimmed = text.trim();
    if (!trimmed) {
        return undefined;
    }

    const date = parseDate(trimmed, dateFormat);
    if (!date) {
        return { error: "format" };
    }

    const day = formatDay(date);

    return day < FIRST_LISTED_DAY || day > LAST_LISTED_DAY ? { error: "range" } : { day };
}
