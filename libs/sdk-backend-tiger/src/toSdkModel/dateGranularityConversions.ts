// (C) 2019-2020 GoodData Corporation
import { AttributeGranularityResourceAttribute } from "@gooddata/gd-tiger-client";
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";

type TigerToSdk = {
    [key in AttributeGranularityResourceAttribute]: CatalogDateAttributeGranularity;
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
    [AttributeGranularityResourceAttribute.Week]: "GDC.time.week",

    [AttributeGranularityResourceAttribute.QuarterOfYear]: "GDC.time.quarter_in_year",
    [AttributeGranularityResourceAttribute.MonthOfYear]: "GDC.time.month_in_year",

    [AttributeGranularityResourceAttribute.DayOfYear]: "GDC.time.day_in_year",
    [AttributeGranularityResourceAttribute.DayOfWeek]: "GDC.time.day_in_week",
    [AttributeGranularityResourceAttribute.DayOfMonth]: "GDC.time.day_in_month",
    [AttributeGranularityResourceAttribute.WeekOfYear]: "GDC.time.week_in_year",
};

export function toSdkGranularity(
    granularity: AttributeGranularityResourceAttribute,
): CatalogDateAttributeGranularity {
    return TigerToSdkGranularityMap[granularity];
}
