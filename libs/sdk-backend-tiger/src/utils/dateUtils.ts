// (C) 2024-2026 GoodData Corporation

import { type DateAttributeGranularity, type IAttribute, objRefToString } from "@gooddata/sdk-model";

export function getFormatByGranularity(attr: IAttribute): DateAttributeGranularity {
    const ref = objRefToString(attr.attribute.displayForm);
    const granularity = ref.split(".")[1];

    switch (granularity) {
        case "day":
            return "GDC.time.date";
        case "dayOfMonth":
            return "GDC.time.day_in_month";
        case "dayOfWeek":
            return "GDC.time.day_in_week";
        case "dayOfYear":
            return "GDC.time.day_in_year";
        case "hour":
            return "GDC.time.hour";
        case "hourOfDay":
            return "GDC.time.hour_in_day";
        case "minute":
            return "GDC.time.minute";
        case "minuteOfHour":
            return "GDC.time.minute_in_hour";
        case "month":
            return "GDC.time.month";
        case "monthOfYear":
            return "GDC.time.month_in_year";
        case "quarter":
            return "GDC.time.quarter";
        case "quarterOfYear":
            return "GDC.time.quarter_in_year";
        case "week":
            return "GDC.time.week_us";
        case "weekOfYear":
            return "GDC.time.week_in_year";
        case "year":
            return "GDC.time.year";
        default:
            throw new Error(`Unsupported granularity: ${granularity}`);
    }
}
