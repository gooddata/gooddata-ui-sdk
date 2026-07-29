// (C) 2026 GoodData Corporation

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import {
    type ConditionalFormattingValue,
    type IDateConditionBounds,
} from "../../types/conditionalFormatting.js";

/**
 * Context for resolving relative date conditions. The anchor is the instant "now" is measured from —
 * render time by default; exports pass their own so re-resolution is deterministic.
 *
 * @internal
 */
export interface IDateResolutionContext {
    anchor?: Date;
}

/**
 * Date-condition value kinds (absolute period / relative period).
 *
 * @internal
 */
export type ConditionalFormattingDateValue = Extract<
    ConditionalFormattingValue,
    { kind: "absoluteDate" } | { kind: "relativeDate" }
>;

/**
 * Type-guard for date-valued condition operands.
 *
 * @internal
 */
export const isDateConditionValue = (
    value: ConditionalFormattingValue,
): value is ConditionalFormattingDateValue => value.kind === "absoluteDate" || value.kind === "relativeDate";

// Granularities the resolver handles. Fiscal granularities are deliberately absent: their wire
// labeling convention is unverified against a live workspace, so fiscal columns resolve to null.
const SUPPORTED_GRANULARITIES = [
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.month",
    "GDC.time.week_us",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
] as const;

type SupportedGranularity = (typeof SUPPORTED_GRANULARITIES)[number];

const isSupportedGranularity = (granularity: string | undefined): granularity is SupportedGranularity =>
    SUPPORTED_GRANULARITIES.some((supported) => supported === granularity);

// Execution ATTRIBUTE DESCRIPTORS on Tiger carry the raw wire enum ("MONTH"), not the SDK
// "GDC.time.month" (toSdkGranularity runs for headers, not dimension descriptors).
const WIRE_GRANULARITIES: Record<string, SupportedGranularity> = {
    MINUTE: "GDC.time.minute",
    HOUR: "GDC.time.hour",
    DAY: "GDC.time.date",
    WEEK: "GDC.time.week_us",
    MONTH: "GDC.time.month",
    QUARTER: "GDC.time.quarter",
    YEAR: "GDC.time.year",
};

const normalizeSupported = (granularity: string | undefined): SupportedGranularity | null => {
    if (isSupportedGranularity(granularity)) {
        return granularity;
    }
    return (granularity === undefined ? undefined : WIRE_GRANULARITIES[granularity]) ?? null;
};

/**
 * Normalizes a date attribute's granularity — as found on an execution descriptor (raw wire enum)
 * or in persisted config (GDC constant) — to the granularity the date-condition machinery speaks.
 * Null = the attribute cannot carry date conditions (cyclic, fiscal, unknown, absent).
 *
 * @internal
 */
export function normalizeDateConditionGranularity(
    granularity: string | undefined,
): DateFilterGranularity | null {
    return normalizeSupported(granularity);
}

// Fine-to-coarse authoring order for granularity tabs and preset groups.
const VALUE_GRANULARITIES: readonly SupportedGranularity[] = [
    "GDC.time.minute",
    "GDC.time.hour",
    "GDC.time.date",
    "GDC.time.week_us",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

/**
 * Value granularities combinable with a column of the given granularity. Under overlap semantics
 * every supported linear granularity combines with every date column (a cell matches when its
 * period touches the value's window), so this is the full supported set — empty only when the
 * column itself cannot carry date conditions. Accepts both descriptor wire enums and GDC constants.
 *
 * @internal
 */
export const allowedValueGranularities = (
    columnGranularity: string | undefined,
): readonly DateFilterGranularity[] => {
    return normalizeSupported(columnGranularity) ? VALUE_GRANULARITIES : [];
};

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const WEEK_MS = 7 * DAY_MS;

const pad = (value: number, length: number): string => String(value).padStart(length, "0");

// A wall time built from a Date's LOCAL fields (the host-timezone reading of the instant).
const localWallTime = (local: Date): Date =>
    new Date(
        Date.UTC(
            local.getFullYear(),
            local.getMonth(),
            local.getDate(),
            local.getHours(),
            local.getMinutes(),
        ),
    );

// Intl.DateTimeFormat construction is expensive and stateless — cache per timezone.
const wallTimeFormatters = new Map<string, Intl.DateTimeFormat>();

const wallTimeFormatter = (timezone: string): Intl.DateTimeFormat => {
    const cached = wallTimeFormatters.get(timezone);
    if (cached) {
        return cached;
    }
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    wallTimeFormatters.set(timezone, formatter);
    return formatter;
};

// Period math runs on "wall times": Dates whose UTC fields hold the wall-clock components of the
// column's timezone — no DST discontinuities, no host timezone, matching the backend's wire labels.
const wallTimeFromInstant = (instant: Date, timezone: string | undefined): Date => {
    if (timezone) {
        try {
            const parts = wallTimeFormatter(timezone).formatToParts(instant);
            const component = (type: string): number => {
                const part = parts.find((candidate) => candidate.type === type);
                return part === undefined ? Number.NaN : Number(part.value);
            };
            const year = component("year");
            const month = component("month");
            const day = component("day");
            // Some ICU versions render midnight as "24" even with h23.
            const hour = component("hour") % 24;
            const minute = component("minute");
            if (![year, month, day, hour, minute].some(Number.isNaN)) {
                return new Date(Date.UTC(year, month - 1, day, hour, minute));
            }
        } catch {
            // Unknown/invalid timezone id — fall through to the host's local wall time.
        }
    }
    return localWallTime(instant);
};

const PLATFORM_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/;

// Parses a platform date string ("YYYY-MM-DD" or "YYYY-MM-DD HH:mm") into a wall time; null on a
// malformed shape or an impossible date (e.g. 2026-02-31, which Date.UTC would silently roll over).
const parsePlatformDateString = (value: string): { wall: Date; hasTime: boolean } | null => {
    const match = PLATFORM_DATE_REGEX.exec(value);
    if (!match) {
        return null;
    }
    const [, year, month, day, hour, minute] = match;
    const hasTime = hour !== undefined;
    const numbers = {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: hasTime ? Number(hour) : 0,
        minute: hasTime ? Number(minute) : 0,
    };
    const wall = new Date(
        Date.UTC(numbers.year, numbers.month - 1, numbers.day, numbers.hour, numbers.minute),
    );
    const roundTrips =
        wall.getUTCFullYear() === numbers.year &&
        wall.getUTCMonth() === numbers.month - 1 &&
        wall.getUTCDate() === numbers.day &&
        wall.getUTCHours() === numbers.hour &&
        wall.getUTCMinutes() === numbers.minute;
    return roundTrips ? { wall, hasTime } : null;
};

// ISO week math (Monday start, week 1 contains Jan 4) — must mirror the backend's "RRRR-II" grammar.
const startOfIsoWeek = (wall: Date): Date => {
    const daysFromMonday = (wall.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate() - daysFromMonday));
};

const isoWeekLabel = (weekStart: Date): string => {
    const thursday = new Date(weekStart.getTime() + 3 * DAY_MS);
    const isoYear = thursday.getUTCFullYear();
    const week1Start = startOfIsoWeek(new Date(Date.UTC(isoYear, 0, 4)));
    const week = 1 + Math.round((weekStart.getTime() - week1Start.getTime()) / WEEK_MS);
    return `${pad(isoYear, 4)}-${pad(week, 2)}`;
};

const startOfPeriod = (wall: Date, granularity: SupportedGranularity): Date => {
    const year = wall.getUTCFullYear();
    const month = wall.getUTCMonth();
    const day = wall.getUTCDate();
    switch (granularity) {
        case "GDC.time.year":
            return new Date(Date.UTC(year, 0, 1));
        case "GDC.time.quarter":
            return new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1));
        case "GDC.time.month":
            return new Date(Date.UTC(year, month, 1));
        case "GDC.time.week_us":
            return startOfIsoWeek(new Date(Date.UTC(year, month, day)));
        case "GDC.time.date":
            return new Date(Date.UTC(year, month, day));
        case "GDC.time.hour":
            return new Date(Date.UTC(year, month, day, wall.getUTCHours()));
        case "GDC.time.minute":
            return new Date(Date.UTC(year, month, day, wall.getUTCHours(), wall.getUTCMinutes()));
    }
};

// `periodStart` must be a period start; Date.UTC normalizes component overflow (month 13 → next year).
const addPeriods = (periodStart: Date, granularity: SupportedGranularity, count: number): Date => {
    const year = periodStart.getUTCFullYear();
    const month = periodStart.getUTCMonth();
    switch (granularity) {
        case "GDC.time.year":
            return new Date(Date.UTC(year + count, 0, 1));
        case "GDC.time.quarter":
            return new Date(Date.UTC(year, month + count * 3, 1));
        case "GDC.time.month":
            return new Date(Date.UTC(year, month + count, 1));
        case "GDC.time.week_us":
            return new Date(periodStart.getTime() + count * WEEK_MS);
        case "GDC.time.date":
            return new Date(Date.UTC(year, month, periodStart.getUTCDate() + count));
        case "GDC.time.hour":
            return new Date(
                Date.UTC(year, month, periodStart.getUTCDate(), periodStart.getUTCHours() + count),
            );
        case "GDC.time.minute":
            return new Date(periodStart.getTime() + count * MINUTE_MS);
    }
};

// Serializes a period start into the backend's wire-label format (pinned by a contract test).
const serializePeriodLabel = (periodStart: Date, granularity: SupportedGranularity): string => {
    const year = pad(periodStart.getUTCFullYear(), 4);
    const month = pad(periodStart.getUTCMonth() + 1, 2);
    const day = pad(periodStart.getUTCDate(), 2);
    switch (granularity) {
        case "GDC.time.year":
            return year;
        case "GDC.time.quarter":
            return `${year}-${Math.floor(periodStart.getUTCMonth() / 3) + 1}`;
        case "GDC.time.month":
            return `${year}-${month}`;
        case "GDC.time.week_us":
            return isoWeekLabel(periodStart);
        case "GDC.time.date":
            return `${year}-${month}-${day}`;
        case "GDC.time.hour":
            return `${year}-${month}-${day} ${pad(periodStart.getUTCHours(), 2)}`;
        case "GDC.time.minute":
            return `${year}-${month}-${day} ${pad(periodStart.getUTCHours(), 2)}:${pad(
                periodStart.getUTCMinutes(),
                2,
            )}`;
    }
};

/**
 * True when the granularity's platform strings and wire labels carry a time component ("… HH[:mm]")
 * — hour and minute. Accepts both descriptor wire enums and GDC constants; false for anything the
 * date-condition machinery does not support.
 *
 * @internal
 */
export const usesTimeResolution = (granularity: string | undefined): boolean => {
    const normalized = normalizeSupported(granularity);
    return normalized === "GDC.time.hour" || normalized === "GDC.time.minute";
};

const toPlatformString = (wall: Date, withTime: boolean): string => {
    const date = `${pad(wall.getUTCFullYear(), 4)}-${pad(wall.getUTCMonth() + 1, 2)}-${pad(
        wall.getUTCDate(),
        2,
    )}`;
    return withTime ? `${date} ${pad(wall.getUTCHours(), 2)}:${pad(wall.getUTCMinutes(), 2)}` : date;
};

// Inclusive period end: last day for day-and-coarser columns, last minute for hour/minute.
const inclusivePeriodEnd = (periodStart: Date, granularity: SupportedGranularity): Date => {
    const nextStart = addPeriods(periodStart, granularity, 1);
    return new Date(nextStart.getTime() - (usesTimeResolution(granularity) ? MINUTE_MS : DAY_MS));
};

const resolveAbsolute = (
    value: Extract<ConditionalFormattingDateValue, { kind: "absoluteDate" }>,
    columnGranularity: SupportedGranularity,
): IDateConditionBounds | null => {
    const from = parsePlatformDateString(value.from);
    const to = parsePlatformDateString(value.to);
    if (!from || !to) {
        return null;
    }
    // A date-only `to` means the whole day, so its inclusive end is the day's last minute.
    const toWallInclusive = to.hasTime ? to.wall : new Date(to.wall.getTime() + DAY_MS - MINUTE_MS);
    if (from.wall.getTime() > toWallInclusive.getTime()) {
        return null;
    }
    // Overlap semantics: bounds snap OUTWARD to the column periods containing the value's edges —
    // a cell matches when its period touches the value ("sub-match is a match", per filters).
    return {
        fromLabel: serializePeriodLabel(startOfPeriod(from.wall, columnGranularity), columnGranularity),
        toLabel: serializePeriodLabel(startOfPeriod(toWallInclusive, columnGranularity), columnGranularity),
    };
};

const resolveRelative = (
    value: Extract<ConditionalFormattingDateValue, { kind: "relativeDate" }>,
    columnGranularity: SupportedGranularity,
    columnTimezone: string | undefined,
    context: IDateResolutionContext | undefined,
): IDateConditionBounds | null => {
    const valueGranularity = value.granularity;
    if (!isSupportedGranularity(valueGranularity)) {
        return null;
    }
    if (!Number.isInteger(value.from) || !Number.isInteger(value.to) || value.from > value.to) {
        return null;
    }
    const anchorWall = wallTimeFromInstant(context?.anchor ?? new Date(), columnTimezone);
    const currentStart = startOfPeriod(anchorWall, valueGranularity);
    const rangeStart = addPeriods(currentStart, valueGranularity, value.from);
    const rangeEndInclusive = new Date(
        addPeriods(currentStart, valueGranularity, value.to + 1).getTime() - MINUTE_MS,
    );
    // Overlap semantics: the label pair covers every column period the window touches, whether the
    // value granularity is coarser or finer than the column's.
    return {
        fromLabel: serializePeriodLabel(startOfPeriod(rangeStart, columnGranularity), columnGranularity),
        toLabel: serializePeriodLabel(startOfPeriod(rangeEndInclusive, columnGranularity), columnGranularity),
    };
};

/**
 * Resolves a date condition value into label-space bounds at the column's granularity — the pair of
 * column periods containing the value's edges, so the engine's label comparisons implement overlap
 * semantics (a cell matches "is on" when its period touches the value; negations and strict
 * orderings are exact complements). Null only when the value cannot resolve at all
 * (fiscal/unknown granularity, malformed input); such a condition never matches and the authoring
 * UI flags it invalid.
 *
 * This is the normative resolution contract — server-side evaluators must mirror it exactly.
 *
 * @internal
 */
export function resolveDateConditionBounds(
    value: ConditionalFormattingValue,
    columnGranularity: string | undefined,
    columnTimezone: string | undefined,
    context?: IDateResolutionContext,
): IDateConditionBounds | null {
    const normalized = normalizeSupported(columnGranularity);
    if (!isDateConditionValue(value) || !normalized) {
        return null;
    }
    return value.kind === "absoluteDate"
        ? resolveAbsolute(value, normalized)
        : resolveRelative(value, normalized, columnTimezone, context);
}

const snapWallRange = (
    wallFrom: Date,
    wallTo: Date,
    granularity: SupportedGranularity,
): { from: string; to: string } | null => {
    if (wallFrom.getTime() > wallTo.getTime()) {
        return null;
    }
    const withTime = usesTimeResolution(granularity);
    return {
        from: toPlatformString(startOfPeriod(wallFrom, granularity), withTime),
        to: toPlatformString(inclusivePeriodEnd(startOfPeriod(wallTo, granularity), granularity), withTime),
    };
};

/**
 * Snaps a picker-produced wall-clock range to period bounds at the given granularity and serializes
 * it into the platform strings an `absoluteDate` value persists (authoring-side).
 * Input Dates are read in their LOCAL fields (that is what DateRangePicker produces). Null for
 * granularities the resolver does not support (fiscal).
 *
 * @internal
 */
export function snapToPeriodBounds(
    from: Date,
    to: Date,
    granularity: string,
): { from: string; to: string } | null {
    const normalized = normalizeSupported(granularity);
    if (!normalized) {
        return null;
    }
    return snapWallRange(localWallTime(from), localWallTime(to), normalized);
}

/**
 * {@link snapToPeriodBounds} for platform date strings ("YYYY-MM-DD"[ HH:mm]) — the shape the date
 * filter's absolute form delivers on apply. Null when either string is malformed, the range is
 * inverted, or the granularity is unsupported.
 *
 * @internal
 */
export function snapPlatformRangeToPeriodBounds(
    from: string,
    to: string,
    granularity: string,
): { from: string; to: string } | null {
    const normalized = normalizeSupported(granularity);
    if (!normalized) {
        return null;
    }
    const parsedFrom = parsePlatformDateString(from);
    const parsedTo = parsePlatformDateString(to);
    if (!parsedFrom || !parsedTo) {
        return null;
    }
    // A date-only `to` means the WHOLE day (absolute presets carry day-level bounds). On hour/minute
    // granularities that must snap to the day's last period, not the midnight its parse lands on.
    const toWall =
        !parsedTo.hasTime && usesTimeResolution(normalized)
            ? new Date(parsedTo.wall.getTime() + DAY_MS - MINUTE_MS)
            : parsedTo.wall;
    return snapWallRange(parsedFrom.wall, toWall, normalized);
}
