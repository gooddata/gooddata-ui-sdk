// (C) 2026 GoodData Corporation

import { tz } from "@date-fns/tz";
import { endOfDay, endOfHour, format, isSameDay, isValid, parse, startOfDay } from "date-fns";
import { defineMessages } from "react-intl";

import {
    type DateFilterGranularity,
    type DatePeriodGranularity,
    type DateRangeParameterGranularity,
    type IDateRangeParameterPeriod,
    type WeekStart,
    isDatePeriodGranularity,
    isValidDatePeriodLiteral,
} from "@gooddata/sdk-model";

import { DEFAULT_DATE_FORMAT, TIME_FORMAT, TIME_FORMAT_WITH_SECONDS } from "../../constants/Platform.js";
import { convertLocale } from "../dateFnsLocale.js";
import { formatAbsoluteDateRange } from "../FormattingUtils.js";
import { periodLiteralToFirstDate, periodLiteralToLastDate } from "../periodLiterals.js";

import { type IDateAndMessageTranslator, type IDateTranslator } from "./Translators.js";

const messages = defineMessages({
    openEnd: { id: "filters.staticPeriod.openEnd.title" },
    openStart: { id: "filters.staticPeriod.openStart.title" },
});

type DayOrTimeGranularity = Exclude<DateRangeParameterGranularity, DatePeriodGranularity>;

// Days and times are wall-clock values the backend already resolved, so they are read and written in UTC,
// which has no daylight saving changes, whatever the browser's time zone is.
const utc = tz("UTC");

// The literal formats of days and times in date-fns tokens.
const LITERAL_FORMATS: Record<DayOrTimeGranularity, string> = {
    "GDC.time.date": "yyyy-MM-dd",
    "GDC.time.hour": "yyyy-MM-dd HH",
    "GDC.time.minute": "yyyy-MM-dd HH:mm",
    "GDC.time.second": "yyyy-MM-dd HH:mm:ss",
};

// The time written for each granularity, and its unit, which tells whether two moments are in one period and
// whether a range covers whole days.
const TIME_FORMATS: Record<DayOrTimeGranularity, { time: string; unit: string }> = {
    "GDC.time.date": { time: "", unit: "" },
    "GDC.time.hour": { time: TIME_FORMAT, unit: "HH" },
    "GDC.time.minute": { time: TIME_FORMAT, unit: TIME_FORMAT },
    "GDC.time.second": { time: TIME_FORMAT_WITH_SECONDS, unit: TIME_FORMAT_WITH_SECONDS },
};

// Intl.DateTimeFormat options for Month/Year period labels; Quarter is handled separately below.
const MONTH_AND_YEAR_INTL_OPTIONS: Partial<Record<DateFilterGranularity, Intl.DateTimeFormatOptions>> = {
    "GDC.time.month": { month: "long", year: "numeric" },
    "GDC.time.year": { year: "numeric" },
};

// Names the month, quarter or year that contains the date.
function formatPeriodLabel(date: Date, granularity: DateFilterGranularity, translator: IDateTranslator) {
    const intlOptions = MONTH_AND_YEAR_INTL_OPTIONS[granularity];
    // Intl.DateTimeFormat has no "quarter" field, so format it with date-fns instead, localized.
    return intlOptions
        ? translator.formatDate(date, intlOptions)
        : format(date, "QQQ y", { locale: convertLocale(translator.locale) });
}

/**
 * Names the months, quarters or years from the one that contains `fromDate` to the one that contains `toDate`.
 */
export function formatPeriodRangeLabel(
    fromDate: Date,
    toDate: Date,
    granularity: DateFilterGranularity,
    translator: IDateTranslator,
): string {
    const fromLabel = formatPeriodLabel(fromDate, granularity, translator);
    const toLabel = formatPeriodLabel(toDate, granularity, translator);
    return fromLabel === toLabel ? fromLabel : `${fromLabel} – ${toLabel}`;
}

function parseDayOrTime(granularity: DayOrTimeGranularity, literal: string): Date | undefined {
    if (!isValidDatePeriodLiteral(granularity, literal)) {
        return undefined;
    }

    const date = parse(literal, LITERAL_FORMATS[granularity], new Date(), { in: utc });
    return isValid(date) ? date : undefined;
}

function formatDayOrTimeRange(
    first: Date,
    last: Date,
    granularity: DayOrTimeGranularity,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
): string {
    const { time, unit } = TIME_FORMATS[granularity];
    const locale = convertLocale(translator.locale);
    const firstDay = format(first, dateFormat, { locale });
    const lastDay = format(last, dateFormat, { locale });
    const coversWholeDays =
        !unit ||
        (format(first, unit) === format(startOfDay(first), unit) &&
            format(last, unit) === format(endOfDay(last), unit));

    if (coversWholeDays) {
        return isSameDay(first, last, { in: utc }) ? firstDay : `${firstDay} – ${lastDay}`;
    }

    const firstTime = format(first, time);
    const lastTime = format(last, time);
    if (!isSameDay(first, last, { in: utc })) {
        return `${firstDay}, ${firstTime} – ${lastDay}, ${lastTime}`;
    }
    return format(first, unit) === format(last, unit)
        ? `${firstDay}, ${firstTime}`
        : `${firstDay}, ${firstTime} – ${lastTime}`;
}

// How the periods of one granularity are read from literals and written.
interface IPeriodText {
    // the first moment of the period that the literal names
    first: (literal: string) => Date | undefined;
    // the last moment of the period that the literal names
    last: (literal: string) => Date | undefined;
    range: (first: Date, last: Date) => string;
}

// Weeks are written as their days, the other whole periods by their names, as static periods of the date filter.
function wholePeriodText(
    granularity: DatePeriodGranularity,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
    weekStart: WeekStart,
): IPeriodText {
    return {
        first: (literal) => periodLiteralToFirstDate(granularity, literal, weekStart),
        last: (literal) => periodLiteralToLastDate(granularity, literal, weekStart),
        range: (first, last) =>
            granularity === "GDC.time.week"
                ? formatAbsoluteDateRange(first, last, dateFormat)
                : formatPeriodRangeLabel(first, last, granularity, translator),
    };
}

function dayOrTimeText(
    granularity: DayOrTimeGranularity,
    translator: IDateAndMessageTranslator,
    dateFormat: string,
): IPeriodText {
    return {
        first: (literal) => parseDayOrTime(granularity, literal),
        // An hour ends with its last minute, as a static period with time does: hour "22" ends at 22:59.
        last: (literal) => {
            const date = parseDayOrTime(granularity, literal);
            return date && granularity === "GDC.time.hour" ? endOfHour(date) : date;
        },
        range: (first, last) => formatDayOrTimeRange(first, last, granularity, translator, dateFormat),
    };
}

/**
 * Names the range of a date range parameter's period, such as "August 2025 – August 2026".
 *
 * @remarks
 * The range reads as a static period of the date filter: years, quarters and months by their names, and weeks by
 * their days, which depend on `weekStart`. Days are written in `dateFormat` in the translator's locale, with the
 * time for hours, minutes and seconds. A range within one day writes the day once, such as
 * "08/14/2025, 09:00 – 17:59", and a range that covers whole days writes only the days. An hour ends with its
 * last minute. Days and times are wall-clock values, written as they are in every time zone. A period with one
 * end reads "From August 2025" or "To August 2026". An end that is not a valid literal of the granularity is
 * written as it is.
 *
 * @param period - the period of a date range parameter
 * @param translator - translator with the messages of `@gooddata/sdk-ui`
 * @param dateFormat - date-fns format of a day, defaults to "MM/dd/yyyy"
 * @param weekStart - the first day of a week, defaults to Sunday
 * @returns the range, or undefined when the period has neither end
 * @beta
 */
export const formatDateRangeParameterPeriod = (
    period: IDateRangeParameterPeriod,
    translator: IDateAndMessageTranslator,
    dateFormat: string = DEFAULT_DATE_FORMAT,
    weekStart: WeekStart = "Sunday",
): string | undefined => {
    const { granularity, from, to } = period;
    const text = isDatePeriodGranularity(granularity)
        ? wholePeriodText(granularity, translator, dateFormat, weekStart)
        : dayOrTimeText(granularity, translator, dateFormat);
    const first = from ? text.first(from) : undefined;
    const last = to ? text.last(to) : undefined;

    if (first && last) {
        return text.range(first, last);
    }

    const fromText = first ? text.range(first, first) : from;
    const toText = last ? text.range(last, last) : to;
    if (fromText && toText) {
        return from === to ? fromText : `${fromText} – ${toText}`;
    }
    if (fromText) {
        return translator.formatMessage(messages.openEnd, { from: fromText });
    }
    if (toText) {
        return translator.formatMessage(messages.openStart, { to: toText });
    }
    return undefined;
};
