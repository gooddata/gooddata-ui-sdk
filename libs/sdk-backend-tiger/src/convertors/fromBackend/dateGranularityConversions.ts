// (C) 2019-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type JsonApiAttributeOutAttributesGranularityEnum,
    type RelativeDateFilterRelativeDateFilterGranularityEnum,
} from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import { type DateAttributeGranularity } from "@gooddata/sdk-model";

/**
 * Extended fiscal-calendar granularities the backend exposes but the sdk-model granularity registry does not
 * model yet. Listing one here is a deliberate decision (see CQ-2685) — date attributes carrying them are
 * filtered out of the catalog in datasetLoader.createDateDatasets until the SDK models them.
 */
const UNSUPPORTED_TIGER_GRANULARITIES = [
    "FISCAL_WEEK",
    "FISCAL_SEMESTER",
    "FISCAL_DAY_OF_FISCAL_WEEK",
    "FISCAL_DAY_OF_FISCAL_MONTH",
    "FISCAL_DAY_OF_FISCAL_QUARTER",
    "FISCAL_DAY_OF_FISCAL_SEMESTER",
    "FISCAL_DAY_OF_FISCAL_YEAR",
    "FISCAL_WEEK_OF_FISCAL_MONTH",
    "FISCAL_WEEK_OF_FISCAL_QUARTER",
    "FISCAL_WEEK_OF_FISCAL_SEMESTER",
    "FISCAL_WEEK_OF_FISCAL_YEAR",
    "FISCAL_MONTH_OF_FISCAL_QUARTER",
    "FISCAL_MONTH_OF_FISCAL_SEMESTER",
    "FISCAL_MONTH_OF_FISCAL_YEAR",
    "FISCAL_QUARTER_OF_FISCAL_SEMESTER",
    "FISCAL_QUARTER_OF_FISCAL_YEAR",
    "FISCAL_SEMESTER_OF_FISCAL_YEAR",
] as const satisfies readonly JsonApiAttributeOutAttributesGranularityEnum[];

type UnsupportedTigerGranularity = (typeof UNSUPPORTED_TIGER_GRANULARITIES)[number];

// Total over every tiger granularity the SDK models — the enum minus the explicitly-unsupported set. When the
// backend adds a granularity, this map stops compiling until it is either mapped below or added to
// UNSUPPORTED_TIGER_GRANULARITIES, forcing a conscious build-time decision.
type TigerToSdk = {
    [
        key in Exclude<JsonApiAttributeOutAttributesGranularityEnum, UnsupportedTigerGranularity>
    ]: DateAttributeGranularity;
};

type SdkToTiger = {
    [key in DateAttributeGranularity]: RelativeDateFilterRelativeDateFilterGranularityEnum | undefined;
};

/*
    Year = "year",
    Day = "day",
    Hour = "hour",
    Minute = "minute",
    Day = "day",
    Quarter = "quarter",
    Month = "month",
    Week = "week",
    QuarterOfYear = "quarterOfYear",
    MonthOfYear = "monthOfYear",
    DayOfYear = "dayOfYear",
    DayOfWeek = "dayOfWeek",
    DayOfMonth = "dayOfMonth",
    DayOfQuarter = "dayOfQuarter",
    HourOfDay = "hourOfDay",
    MinuteOfHour = "minuteOfHour",
    WeekOfYear = "weekOfYear",
 */

const TigerToSdkGranularityMap: TigerToSdk = {
    ["YEAR"]: "GDC.time.year",
    ["QUARTER"]: "GDC.time.quarter",
    ["MONTH"]: "GDC.time.month",
    ["WEEK"]: "GDC.time.week_us",
    ["DAY"]: "GDC.time.date",
    ["HOUR"]: "GDC.time.hour",
    ["MINUTE"]: "GDC.time.minute",

    ["QUARTER_OF_YEAR"]: "GDC.time.quarter_in_year",
    ["MONTH_OF_YEAR"]: "GDC.time.month_in_year",
    ["WEEK_OF_YEAR"]: "GDC.time.week_in_year",
    ["DAY_OF_YEAR"]: "GDC.time.day_in_year",
    ["DAY_OF_QUARTER"]: "GDC.time.day_in_quarter",
    ["DAY_OF_MONTH"]: "GDC.time.day_in_month",
    ["DAY_OF_WEEK"]: "GDC.time.day_in_week",
    ["HOUR_OF_DAY"]: "GDC.time.hour_in_day",
    ["MINUTE_OF_HOUR"]: "GDC.time.minute_in_hour",

    ["SECOND"]: "GDC.time.second",
    ["SECOND_OF_MINUTE"]: "GDC.time.second_in_minute",
    ["SECOND_OF_DAY"]: "GDC.time.second_in_day",
    ["MINUTE_OF_DAY"]: "GDC.time.minute_in_day",

    ["FISCAL_YEAR"]: "GDC.time.fiscal_year",
    ["FISCAL_QUARTER"]: "GDC.time.fiscal_quarter",
    ["FISCAL_MONTH"]: "GDC.time.fiscal_month",
};

/**
 * Neutral granularity returned when a tiger granularity cannot be mapped at runtime (see toSdkGranularity).
 * A safe, always-valid value so the client degrades instead of propagating `undefined`.
 */
const FALLBACK_SDK_GRANULARITY: DateAttributeGranularity = "GDC.time.date";

/**
 * Converts a tiger backend granularity to the value recognized by the SDK. The input is always a real
 * granularity — callers must not pass a missing one (an attribute without a granularity is not a date
 * attribute and should be branched on before calling this).
 *
 * Developer signal (build time): {@link TigerToSdkGranularityMap} is exhaustive over the supported tiger enum,
 * so a newly added backend granularity breaks the build until it is mapped or added to
 * {@link UNSUPPORTED_TIGER_GRANULARITIES}.
 *
 * Run time: for a value that is still not mapped (an explicitly-unsupported granularity that slipped past the
 * catalog filter, or a backend value newer than the client's generated enum) it never throws — it warns and
 * returns a neutral fallback so the client keeps working.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum,
): DateAttributeGranularity {
    const sdkGranularity = (TigerToSdkGranularityMap as Record<string, DateAttributeGranularity | undefined>)[
        granularity
    ];
    if (sdkGranularity !== undefined) {
        return sdkGranularity;
    }

    invariant.warn(
        `Unsupported tiger date granularity "${granularity}" — falling back to "${FALLBACK_SDK_GRANULARITY}".`,
    );
    return FALLBACK_SDK_GRANULARITY;
}

/**
 * Whether a tiger granularity is modeled in the SDK (i.e. maps to a real SDK granularity rather than the
 * fallback). Use this to drop unsupported date attributes at the boundary — e.g. so extended fiscal-calendar
 * granularities are excluded from the catalog instead of surfacing as the fallback granularity.
 */
export function isSupportedTigerGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum,
): boolean {
    return granularity in TigerToSdkGranularityMap;
}

const SdkToTigerGranularityMap: SdkToTiger = {
    "GDC.time.year": "YEAR",
    "GDC.time.quarter": "QUARTER",
    "GDC.time.month": "MONTH",
    "GDC.time.week_us": "WEEK",
    "GDC.time.week": "WEEK",
    "GDC.time.date": "DAY",
    "GDC.time.hour": "HOUR",
    "GDC.time.minute": "MINUTE",

    "GDC.time.quarter_in_year": "QUARTER_OF_YEAR",
    "GDC.time.month_in_year": "MONTH_OF_YEAR",
    "GDC.time.week_in_year": "WEEK_OF_YEAR",
    "GDC.time.day_in_year": "DAY_OF_YEAR",
    "GDC.time.day_in_quarter": "DAY_OF_QUARTER",
    "GDC.time.day_in_month": "DAY_OF_MONTH",
    "GDC.time.day_in_week": "DAY_OF_WEEK",
    "GDC.time.hour_in_day": "HOUR_OF_DAY",
    "GDC.time.minute_in_hour": "MINUTE_OF_HOUR",

    "GDC.time.fiscal_year": "FISCAL_YEAR",
    "GDC.time.fiscal_quarter": "FISCAL_QUARTER",
    "GDC.time.fiscal_month": "FISCAL_MONTH",

    "GDC.time.day_in_euweek": undefined,
    "GDC.time.euweek_in_quarter": undefined,
    "GDC.time.euweek_in_year": undefined,
    "GDC.time.month_in_quarter": undefined,
    "GDC.time.week_in_quarter": undefined,

    "GDC.time.second": "SECOND",
    "GDC.time.second_in_minute": "SECOND_OF_MINUTE",
    "GDC.time.second_in_day": "SECOND_OF_DAY",
    "GDC.time.minute_in_day": "MINUTE_OF_DAY",
};

/**
 * Converts granularity values recognized by the SDK into granularities known by tiger. Note that
 * SDK granularities are superset of those supported by tiger.
 *
 * @throws NotSupport if the input granularity is not supported by tiger
 */
export function toTigerGranularity(
    granularity: DateAttributeGranularity,
): RelativeDateFilterRelativeDateFilterGranularityEnum {
    const tigerGranularity = SdkToTigerGranularityMap[granularity];

    if (!tigerGranularity) {
        throw new NotSupported(`The ${granularity} is not supported on tiger backend.`);
    }

    return tigerGranularity;
}
