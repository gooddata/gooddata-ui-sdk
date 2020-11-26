// (C) 2019-2020 GoodData Corporation
import { AttributeAttributesGranularityEnum } from "@gooddata/api-client-tiger";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";

type TigerToSdk = {
    [key in AttributeAttributesGranularityEnum]: DateAttributeGranularity;
};

type SdkToTiger = {
    [key in DateAttributeGranularity]: AttributeAttributesGranularityEnum | undefined;
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
    [AttributeAttributesGranularityEnum.YEAR]: "GDC.time.year",
    [AttributeAttributesGranularityEnum.QUARTER]: "GDC.time.quarter",
    [AttributeAttributesGranularityEnum.MONTH]: "GDC.time.month",
    [AttributeAttributesGranularityEnum.WEEK]: "GDC.time.week_us",
    [AttributeAttributesGranularityEnum.DAY]: "GDC.time.date",
    [AttributeAttributesGranularityEnum.HOUR]: "GDC.time.hour",
    [AttributeAttributesGranularityEnum.MINUTE]: "GDC.time.minute",

    [AttributeAttributesGranularityEnum.QUARTEROFYEAR]: "GDC.time.quarter_in_year",
    [AttributeAttributesGranularityEnum.MONTHOFYEAR]: "GDC.time.month_in_year",
    [AttributeAttributesGranularityEnum.WEEKOFYEAR]: "GDC.time.week_in_year",
    [AttributeAttributesGranularityEnum.DAYOFYEAR]: "GDC.time.day_in_year",
    [AttributeAttributesGranularityEnum.DAYOFMONTH]: "GDC.time.day_in_month",
    [AttributeAttributesGranularityEnum.DAYOFWEEK]: "GDC.time.day_in_week",
    [AttributeAttributesGranularityEnum.HOUROFDAY]: "GDC.time.hour_in_day",
    [AttributeAttributesGranularityEnum.MINUTEOFHOUR]: "GDC.time.minute_in_hour",
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(granularity: AttributeAttributesGranularityEnum): DateAttributeGranularity {
    return TigerToSdkGranularityMap[granularity];
}

const SdkToTigerGranularityMap: SdkToTiger = {
    "GDC.time.year": AttributeAttributesGranularityEnum.YEAR,
    "GDC.time.quarter": AttributeAttributesGranularityEnum.QUARTER,
    "GDC.time.month": AttributeAttributesGranularityEnum.MONTH,
    "GDC.time.week_us": AttributeAttributesGranularityEnum.WEEK,
    "GDC.time.week": AttributeAttributesGranularityEnum.WEEK,
    "GDC.time.date": AttributeAttributesGranularityEnum.DAY,
    "GDC.time.hour": AttributeAttributesGranularityEnum.HOUR,
    "GDC.time.minute": AttributeAttributesGranularityEnum.MINUTE,

    "GDC.time.quarter_in_year": AttributeAttributesGranularityEnum.QUARTEROFYEAR,
    "GDC.time.month_in_year": AttributeAttributesGranularityEnum.MONTHOFYEAR,
    "GDC.time.week_in_year": AttributeAttributesGranularityEnum.WEEKOFYEAR,
    "GDC.time.day_in_year": AttributeAttributesGranularityEnum.DAYOFYEAR,
    "GDC.time.day_in_month": AttributeAttributesGranularityEnum.DAYOFMONTH,
    "GDC.time.day_in_week": AttributeAttributesGranularityEnum.DAYOFWEEK,
    "GDC.time.hour_in_day": AttributeAttributesGranularityEnum.HOUROFDAY,
    "GDC.time.minute_in_hour": AttributeAttributesGranularityEnum.MINUTEOFHOUR,

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
): AttributeAttributesGranularityEnum {
    const tigerGranularity = SdkToTigerGranularityMap[granularity];

    if (!tigerGranularity) {
        throw new NotSupported(`The ${granularity} is not supported on tiger backend.`);
    }

    return tigerGranularity;
}
