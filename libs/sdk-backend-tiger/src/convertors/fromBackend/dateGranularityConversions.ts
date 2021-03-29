// (C) 2019-2021 GoodData Corporation
import {
    JsonApiAttributeOutAttributesGranularityEnum,
    RelativeDateFilterBodyGranularityEnum,
} from "@gooddata/api-client-tiger";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";

type TigerToSdk = {
    [key in
        | JsonApiAttributeOutAttributesGranularityEnum
        | RelativeDateFilterBodyGranularityEnum]: DateAttributeGranularity;
};

type SdkToTiger = {
    [key in DateAttributeGranularity]: RelativeDateFilterBodyGranularityEnum | undefined;
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
    HourOfDay = "hourOfDay",
    MinuteOfHour = "minuteOfHour",
    WeekOfYear = "weekOfYear",
 */

const TigerToSdkGranularityMap: TigerToSdk = {
    [JsonApiAttributeOutAttributesGranularityEnum.YEAR]: "GDC.time.year",
    [JsonApiAttributeOutAttributesGranularityEnum.QUARTER]: "GDC.time.quarter",
    [JsonApiAttributeOutAttributesGranularityEnum.MONTH]: "GDC.time.month",
    [JsonApiAttributeOutAttributesGranularityEnum.WEEK]: "GDC.time.week_us",
    [JsonApiAttributeOutAttributesGranularityEnum.DAY]: "GDC.time.date",
    [JsonApiAttributeOutAttributesGranularityEnum.HOUR]: "GDC.time.hour",
    [JsonApiAttributeOutAttributesGranularityEnum.MINUTE]: "GDC.time.minute",

    [JsonApiAttributeOutAttributesGranularityEnum.QUARTEROFYEAR]: "GDC.time.quarter_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.MONTHOFYEAR]: "GDC.time.month_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.WEEKOFYEAR]: "GDC.time.week_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.DAYOFYEAR]: "GDC.time.day_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.DAYOFMONTH]: "GDC.time.day_in_month",
    [JsonApiAttributeOutAttributesGranularityEnum.DAYOFWEEK]: "GDC.time.day_in_week",
    [JsonApiAttributeOutAttributesGranularityEnum.HOUROFDAY]: "GDC.time.hour_in_day",
    [JsonApiAttributeOutAttributesGranularityEnum.MINUTEOFHOUR]: "GDC.time.minute_in_hour",
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum | RelativeDateFilterBodyGranularityEnum,
): DateAttributeGranularity {
    return TigerToSdkGranularityMap[granularity];
}

const SdkToTigerGranularityMap: SdkToTiger = {
    "GDC.time.year": RelativeDateFilterBodyGranularityEnum.YEAR,
    "GDC.time.quarter": RelativeDateFilterBodyGranularityEnum.QUARTER,
    "GDC.time.month": RelativeDateFilterBodyGranularityEnum.MONTH,
    "GDC.time.week_us": RelativeDateFilterBodyGranularityEnum.WEEK,
    "GDC.time.week": RelativeDateFilterBodyGranularityEnum.WEEK,
    "GDC.time.date": RelativeDateFilterBodyGranularityEnum.DAY,
    "GDC.time.hour": RelativeDateFilterBodyGranularityEnum.HOUR,
    "GDC.time.minute": RelativeDateFilterBodyGranularityEnum.MINUTE,

    "GDC.time.quarter_in_year": RelativeDateFilterBodyGranularityEnum.QUARTEROFYEAR,
    "GDC.time.month_in_year": RelativeDateFilterBodyGranularityEnum.MONTHOFYEAR,
    "GDC.time.week_in_year": RelativeDateFilterBodyGranularityEnum.WEEKOFYEAR,
    "GDC.time.day_in_year": RelativeDateFilterBodyGranularityEnum.DAYOFYEAR,
    "GDC.time.day_in_month": RelativeDateFilterBodyGranularityEnum.DAYOFMONTH,
    "GDC.time.day_in_week": RelativeDateFilterBodyGranularityEnum.DAYOFWEEK,
    "GDC.time.hour_in_day": RelativeDateFilterBodyGranularityEnum.HOUROFDAY,
    "GDC.time.minute_in_hour": RelativeDateFilterBodyGranularityEnum.MINUTEOFHOUR,

    "GDC.time.day_in_euweek": undefined,
    "GDC.time.day_in_quarter": undefined,
    "GDC.time.euweek_in_quarter": undefined,
    "GDC.time.euweek_in_year": undefined,
    "GDC.time.month_in_quarter": undefined,
    "GDC.time.week_in_quarter": undefined,
};

/**
 * Converts granularity values recognized by the SDK into granularities known by tiger. Note that
 * SDK granularities are superset of those supported by tiger.
 *
 * @throws NotSupport if the input granularity is not supported by tiger
 */
export function toTigerGranularity(
    granularity: DateAttributeGranularity,
): RelativeDateFilterBodyGranularityEnum {
    const tigerGranularity = SdkToTigerGranularityMap[granularity];

    if (!tigerGranularity) {
        throw new NotSupported(`The ${granularity} is not supported on tiger backend.`);
    }

    return tigerGranularity;
}
