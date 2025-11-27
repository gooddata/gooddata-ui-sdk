// (C) 2025 GoodData Corporation

import { IAlertAnomalyDetectionGranularity, WeekStart, assertNever } from "@gooddata/sdk-model";

export function createCronFromGranularity(
    granularity?: IAlertAnomalyDetectionGranularity,
    weekStart?: WeekStart,
): string {
    switch (granularity) {
        case "HOUR":
            return "0 0 * * * *";
        case "DAY":
            return "0 0 0 * * *";
        case "WEEK":
        case undefined: {
            if (weekStart === "Sunday") {
                return "0 0 0 * * 0";
            }
            return "0 0 0 * * 1";
        }
        case "MONTH":
            return "0 0 0 1 * *";
        case "QUARTER":
            return "0 0 0 1 */3 *";
        case "YEAR":
            return "0 0 0 1 1 *";
        default:
            assertNever(granularity);
            throw new Error("Invalid granularity");
    }
}
