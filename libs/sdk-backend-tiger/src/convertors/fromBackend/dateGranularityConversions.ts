// (C) 2019-2026 GoodData Corporation

import {
    type JsonApiAttributeOutAttributesGranularityEnum,
    type RelativeDateFilterRelativeDateFilterGranularityEnum,
} from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import { type DateAttributeGranularity } from "@gooddata/sdk-model";

// Need remove | undefined after feature is finished cq-2685
type TigerToSdk = {
    [key in JsonApiAttributeOutAttributesGranularityEnum]: DateAttributeGranularity | undefined;
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
    ["FISCAL_YEAR"]: "GDC.time.fiscal_year",
    ["FISCAL_QUARTER"]: "GDC.time.fiscal_quarter",
    ["FISCAL_MONTH"]: "GDC.time.fiscal_month",

    ["SECOND"]: undefined,
    ["SECOND_OF_MINUTE"]: undefined,
    ["SECOND_OF_DAY"]: undefined,
    ["MINUTE_OF_DAY"]: undefined,
    ["FISCAL_DAY_OF_FISCAL_WEEK"]: undefined,
    ["FISCAL_DAY_OF_FISCAL_MONTH"]: undefined,
    ["FISCAL_DAY_OF_FISCAL_QUARTER"]: undefined,
    ["FISCAL_DAY_OF_FISCAL_SEMESTER"]: undefined,
    ["FISCAL_DAY_OF_FISCAL_YEAR"]: undefined,
    ["FISCAL_WEEK"]: undefined,
    ["FISCAL_WEEK_OF_FISCAL_MONTH"]: undefined,
    ["FISCAL_WEEK_OF_FISCAL_QUARTER"]: undefined,
    ["FISCAL_WEEK_OF_FISCAL_SEMESTER"]: undefined,
    ["FISCAL_WEEK_OF_FISCAL_YEAR"]: undefined,
    ["FISCAL_MONTH_OF_FISCAL_QUARTER"]: undefined,
    ["FISCAL_MONTH_OF_FISCAL_SEMESTER"]: undefined,
    ["FISCAL_MONTH_OF_FISCAL_YEAR"]: undefined,
    ["FISCAL_QUARTER_OF_FISCAL_SEMESTER"]: undefined,
    ["FISCAL_QUARTER_OF_FISCAL_YEAR"]: undefined,
    ["FISCAL_SEMESTER"]: undefined,
    ["FISCAL_SEMESTER_OF_FISCAL_YEAR"]: undefined,
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK. Note that
 * tiger granularities are a superset of those supported by the SDK (second and fiscal-calendar
 * granularities have no SDK equivalent yet).
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum,
): DateAttributeGranularity {
    // Need remove ! after feature is finished cq-2685

    return TigerToSdkGranularityMap[granularity]!;
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
};

/**
 * Converts granularity values recognized by the SDK into granularities known by tiger. Note that
 * SDK granularities are superset of those supported by tiger.
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
