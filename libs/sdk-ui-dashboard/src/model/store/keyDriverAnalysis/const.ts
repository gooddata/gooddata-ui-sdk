// (C) 2025 GoodData Corporation

import { DateAttributeGranularity } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const keyDriverAnalysisSupportedGranularities = [
    "GDC.time.year",
    "GDC.time.week_us",
    "GDC.time.week",
    "GDC.time.quarter",
    "GDC.time.month",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
] as DateAttributeGranularity[];

/**
 * @internal
 */
export const keyDriverAnalysisSupportedStringGranularities = [
    "YEAR",
    "WEEK_US",
    "WEEK",
    "QUARTER",
    "MONTH",
    "DATE",
    "DAY",
    "HOUR",
    "MINUTE",
];

/**
 * @internal
 */
export const keyDriverYearGranularity = ["GDC.time.year", "YEAR"];
