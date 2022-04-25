// (C) 2019-2022 GoodData Corporation
import {
    JsonApiAttributeOutAttributesGranularityEnum,
    RelativeDateFilterBodyGranularityEnum,
} from "@gooddata/api-client-tiger";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";

type TigerToSdk = {
    [key in JsonApiAttributeOutAttributesGranularityEnum]: DateAttributeGranularity;
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

    [JsonApiAttributeOutAttributesGranularityEnum.QUARTER_OF_YEAR]: "GDC.time.quarter_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.MONTH_OF_YEAR]: "GDC.time.month_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.WEEK_OF_YEAR]: "GDC.time.week_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.DAY_OF_YEAR]: "GDC.time.day_in_year",
    [JsonApiAttributeOutAttributesGranularityEnum.DAY_OF_MONTH]: "GDC.time.day_in_month",
    [JsonApiAttributeOutAttributesGranularityEnum.DAY_OF_WEEK]: "GDC.time.day_in_week",
    [JsonApiAttributeOutAttributesGranularityEnum.HOUR_OF_DAY]: "GDC.time.hour_in_day",
    [JsonApiAttributeOutAttributesGranularityEnum.MINUTE_OF_HOUR]: "GDC.time.minute_in_hour",
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum,
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

    "GDC.time.quarter_in_year": RelativeDateFilterBodyGranularityEnum.QUARTER_OF_YEAR,
    "GDC.time.month_in_year": RelativeDateFilterBodyGranularityEnum.MONTH_OF_YEAR,
    "GDC.time.week_in_year": RelativeDateFilterBodyGranularityEnum.WEEK_OF_YEAR,
    "GDC.time.day_in_year": RelativeDateFilterBodyGranularityEnum.DAY_OF_YEAR,
    "GDC.time.day_in_month": RelativeDateFilterBodyGranularityEnum.DAY_OF_MONTH,
    "GDC.time.day_in_week": RelativeDateFilterBodyGranularityEnum.DAY_OF_WEEK,
    "GDC.time.hour_in_day": RelativeDateFilterBodyGranularityEnum.HOUR_OF_DAY,
    "GDC.time.minute_in_hour": RelativeDateFilterBodyGranularityEnum.MINUTE_OF_HOUR,

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
