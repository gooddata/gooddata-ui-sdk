// (C) 2026 GoodData Corporation

import { type DateRangeParameterValueGranularityEnum } from "@gooddata/api-client-tiger";
import { type DateRangeParameterGranularity } from "@gooddata/sdk-model";

const TIGER_TO_SDK_GRANULARITY = {
    YEAR: "GDC.time.year",
    QUARTER: "GDC.time.quarter",
    MONTH: "GDC.time.month",
    WEEK: "GDC.time.week",
    DAY: "GDC.time.date",
    HOUR: "GDC.time.hour",
    MINUTE: "GDC.time.minute",
    SECOND: "GDC.time.second",
} as const satisfies Record<DateRangeParameterValueGranularityEnum, DateRangeParameterGranularity>;

const SDK_TO_TIGER_GRANULARITY = {
    "GDC.time.year": "YEAR",
    "GDC.time.quarter": "QUARTER",
    "GDC.time.month": "MONTH",
    "GDC.time.week": "WEEK",
    "GDC.time.date": "DAY",
    "GDC.time.hour": "HOUR",
    "GDC.time.minute": "MINUTE",
    "GDC.time.second": "SECOND",
} as const satisfies Record<DateRangeParameterGranularity, DateRangeParameterValueGranularityEnum>;

export function toSdkDateRangeParameterGranularity(
    granularity: DateRangeParameterValueGranularityEnum,
): DateRangeParameterGranularity {
    return TIGER_TO_SDK_GRANULARITY[granularity];
}

export function toTigerDateRangeParameterGranularity(
    granularity: DateRangeParameterGranularity,
): DateRangeParameterValueGranularityEnum {
    return SDK_TO_TIGER_GRANULARITY[granularity];
}
