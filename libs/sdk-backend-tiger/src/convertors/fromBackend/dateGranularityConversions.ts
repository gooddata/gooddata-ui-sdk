// (C) 2019-2021 GoodData Corporation
import { JsonApiAttributeAttributesGranularityEnum } from "@gooddata/api-client-tiger";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";

type TigerToSdk = {
    [key in JsonApiAttributeAttributesGranularityEnum]: DateAttributeGranularity;
};

type SdkToTiger = {
    [key in DateAttributeGranularity]: JsonApiAttributeAttributesGranularityEnum | undefined;
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
    [JsonApiAttributeAttributesGranularityEnum.YEAR]: "GDC.time.year",
    [JsonApiAttributeAttributesGranularityEnum.QUARTER]: "GDC.time.quarter",
    [JsonApiAttributeAttributesGranularityEnum.MONTH]: "GDC.time.month",
    [JsonApiAttributeAttributesGranularityEnum.WEEK]: "GDC.time.week_us",
    [JsonApiAttributeAttributesGranularityEnum.DAY]: "GDC.time.date",
    [JsonApiAttributeAttributesGranularityEnum.HOUR]: "GDC.time.hour",
    [JsonApiAttributeAttributesGranularityEnum.MINUTE]: "GDC.time.minute",

    [JsonApiAttributeAttributesGranularityEnum.QUARTEROFYEAR]: "GDC.time.quarter_in_year",
    [JsonApiAttributeAttributesGranularityEnum.MONTHOFYEAR]: "GDC.time.month_in_year",
    [JsonApiAttributeAttributesGranularityEnum.WEEKOFYEAR]: "GDC.time.week_in_year",
    [JsonApiAttributeAttributesGranularityEnum.DAYOFYEAR]: "GDC.time.day_in_year",
    [JsonApiAttributeAttributesGranularityEnum.DAYOFMONTH]: "GDC.time.day_in_month",
    [JsonApiAttributeAttributesGranularityEnum.DAYOFWEEK]: "GDC.time.day_in_week",
    [JsonApiAttributeAttributesGranularityEnum.HOUROFDAY]: "GDC.time.hour_in_day",
    [JsonApiAttributeAttributesGranularityEnum.MINUTEOFHOUR]: "GDC.time.minute_in_hour",

    [JsonApiAttributeAttributesGranularityEnum.WEEKOFYEAREU]: "GDC.time.euweek_in_year",
    [JsonApiAttributeAttributesGranularityEnum.DAYOFWEEKEU]: "GDC.time.day_in_euweek",
    [JsonApiAttributeAttributesGranularityEnum.WEEKEU]: "GDC.time.week",
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: JsonApiAttributeAttributesGranularityEnum,
): DateAttributeGranularity {
    return TigerToSdkGranularityMap[granularity];
}

const SdkToTigerGranularityMap: SdkToTiger = {
    "GDC.time.year": JsonApiAttributeAttributesGranularityEnum.YEAR,
    "GDC.time.quarter": JsonApiAttributeAttributesGranularityEnum.QUARTER,
    "GDC.time.month": JsonApiAttributeAttributesGranularityEnum.MONTH,
    "GDC.time.week_us": JsonApiAttributeAttributesGranularityEnum.WEEK,
    "GDC.time.week": JsonApiAttributeAttributesGranularityEnum.WEEK,
    "GDC.time.date": JsonApiAttributeAttributesGranularityEnum.DAY,
    "GDC.time.hour": JsonApiAttributeAttributesGranularityEnum.HOUR,
    "GDC.time.minute": JsonApiAttributeAttributesGranularityEnum.MINUTE,

    "GDC.time.quarter_in_year": JsonApiAttributeAttributesGranularityEnum.QUARTEROFYEAR,
    "GDC.time.month_in_year": JsonApiAttributeAttributesGranularityEnum.MONTHOFYEAR,
    "GDC.time.week_in_year": JsonApiAttributeAttributesGranularityEnum.WEEKOFYEAR,
    "GDC.time.day_in_year": JsonApiAttributeAttributesGranularityEnum.DAYOFYEAR,
    "GDC.time.day_in_month": JsonApiAttributeAttributesGranularityEnum.DAYOFMONTH,
    "GDC.time.day_in_week": JsonApiAttributeAttributesGranularityEnum.DAYOFWEEK,
    "GDC.time.hour_in_day": JsonApiAttributeAttributesGranularityEnum.HOUROFDAY,
    "GDC.time.minute_in_hour": JsonApiAttributeAttributesGranularityEnum.MINUTEOFHOUR,

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
): JsonApiAttributeAttributesGranularityEnum {
    const tigerGranularity = SdkToTigerGranularityMap[granularity];

    if (!tigerGranularity) {
        throw new NotSupported(`The ${granularity} is not supported on tiger backend.`);
    }

    return tigerGranularity;
}
