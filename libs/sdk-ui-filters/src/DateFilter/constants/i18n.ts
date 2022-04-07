// (C) 2019-2022 GoodData Corporation
import { DateFilterGranularity } from "@gooddata/sdk-model";

/**
 * @beta
 */
export type GranularityIntlKey = "day" | "minute" | "hour" | "week" | "month" | "quarter" | "year";

export const granularityIntlCodes: {
    [key in DateFilterGranularity]: GranularityIntlKey;
} = {
    "GDC.time.minute": "minute",
    "GDC.time.hour": "hour",
    "GDC.time.date": "day",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.quarter": "quarter",
    "GDC.time.year": "year",
};
