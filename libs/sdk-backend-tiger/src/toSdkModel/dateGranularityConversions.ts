// (C) 2019-2020 GoodData Corporation
import { AttributeGranularityResourceAttribute } from "@gooddata/gd-tiger-client";
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";

type TigerToSdk = {
    [key in AttributeGranularityResourceAttribute]: CatalogDateAttributeGranularity;
};

type SdkToTiger = {
    [key in CatalogDateAttributeGranularity]: AttributeGranularityResourceAttribute | undefined;
};

/*
    Year = "year",
    Day = "day",
    Quarter = "quarter",
    Month = "month",
    Week = "week",
    QuarterOfYear = "quarterOfYear",
    MonthOfYear = "monthOfYear",
    DayOfYear = "dayOfYear",
    DayOfWeek = "dayOfWeek",
    DayOfMonth = "dayOfMonth",
    WeekOfYear = "weekOfYear",
 */

const TigerToSdkGranularityMap: TigerToSdk = {
    [AttributeGranularityResourceAttribute.Year]: "GDC.time.year",
    [AttributeGranularityResourceAttribute.Day]: "GDC.time.date",
    [AttributeGranularityResourceAttribute.Quarter]: "GDC.time.quarter",
    [AttributeGranularityResourceAttribute.Month]: "GDC.time.month",
    [AttributeGranularityResourceAttribute.Week]: "GDC.time.week_us",

    [AttributeGranularityResourceAttribute.QuarterOfYear]: "GDC.time.quarter_in_year",
    [AttributeGranularityResourceAttribute.MonthOfYear]: "GDC.time.month_in_year",

    [AttributeGranularityResourceAttribute.DayOfYear]: "GDC.time.day_in_year",
    [AttributeGranularityResourceAttribute.DayOfWeek]: "GDC.time.day_in_week",
    [AttributeGranularityResourceAttribute.DayOfMonth]: "GDC.time.day_in_month",
    [AttributeGranularityResourceAttribute.WeekOfYear]: "GDC.time.week_in_year",
};

/**
 * Converts supported tiger backend granularities to values recognized by the SDK.
 *
 * @param granularity - tiger granularity
 */
export function toSdkGranularity(
    granularity: AttributeGranularityResourceAttribute,
): CatalogDateAttributeGranularity {
    return TigerToSdkGranularityMap[granularity];
}

const SdkToTigerGranularityMap: SdkToTiger = {
    "GDC.time.year": AttributeGranularityResourceAttribute.Year,
    "GDC.time.date": AttributeGranularityResourceAttribute.Day,
    "GDC.time.quarter": AttributeGranularityResourceAttribute.Quarter,
    "GDC.time.month": AttributeGranularityResourceAttribute.Month,
    "GDC.time.week_us": AttributeGranularityResourceAttribute.Week,
    "GDC.time.week": AttributeGranularityResourceAttribute.Week,

    "GDC.time.quarter_in_year": AttributeGranularityResourceAttribute.QuarterOfYear,
    "GDC.time.month_in_year": AttributeGranularityResourceAttribute.MonthOfYear,

    "GDC.time.day_in_year": AttributeGranularityResourceAttribute.DayOfYear,
    "GDC.time.day_in_week": AttributeGranularityResourceAttribute.DayOfWeek,
    "GDC.time.day_in_month": AttributeGranularityResourceAttribute.DayOfMonth,
    "GDC.time.week_in_year": AttributeGranularityResourceAttribute.WeekOfYear,

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
    granularity: CatalogDateAttributeGranularity,
): AttributeGranularityResourceAttribute {
    const tigerGranularity = SdkToTigerGranularityMap[granularity];

    if (!tigerGranularity) {
        throw new NotSupported(`The ${granularity} is not supported on tiger backend.`);
    }

    return tigerGranularity;
}
