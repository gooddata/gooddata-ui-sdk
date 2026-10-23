// (C) 2022-2026 GoodData Corporation

import type { TigerObjectType } from "@gooddata/sdk-backend-tiger";

import { MaqlType } from "./hierarchy.js";

/**
 * Simplified logical model which holds MAQL type information
 */
export class TypeModel {
    readonly granularities = new DatetimeGranularities();
    private readonly labelSet: Set<string>;
    private readonly dateLabelSet: Set<string>;

    constructor(labels: string[] = [], dateLabels: string[] = []) {
        this.labelSet = new Set(labels);
        this.dateLabelSet = new Set(dateLabels);
    }

    getType(objectType: TigerObjectType, id: string): MaqlType {
        switch (objectType) {
            case "dataset":
                return MaqlType.DATASET;
            case "fact":
                return MaqlType.NUMERIC;
            case "attribute":
            case "label":
                if (this.labelSet.has(id)) {
                    return MaqlType.STRING;
                } else if (this.dateLabelSet.has(id)) {
                    return MaqlType.DATE;
                } else {
                    // Unrecognized ID, we can make no further claims
                    return MaqlType.STRING_AND_DATE;
                }
            case "computedAttribute":
                // A computed attribute buckets rows into string values.
                return MaqlType.STRING;
            case "metric":
                // TODO add option to resolve metric type
                return MaqlType.ALL;
            default:
                return MaqlType.ALL;
        }
    }
}

export class DatetimeGranularities {
    readonly chronologicalGranularities = new Set([
        "timestamp",
        "second",
        "minute",
        "hour",
        "day",
        "month",
        "year",
        "quarter",
        "week",
        "fiscalyear",
        "fiscalquarter",
        "fiscalmonth",
    ]);
    readonly periodicalGranularities = new Set([
        "secondofminute",
        "secondofday",
        "minuteofhour",
        "minuteofday",
        "hourofday",
        "dayofweek",
        "dayofmonth",
        "dayofquarter",
        "dayofyear",
        "weekofyear",
        "monthofyear",
        "quarterofyear",
    ]);

    getType(granularity: string): MaqlType {
        const value = granularity.toLowerCase();
        if (this.chronologicalGranularities.has(value)) {
            return MaqlType.CHRONOLOGICAL_GRANULARITY;
        } else if (this.periodicalGranularities.has(value)) {
            return MaqlType.PERIODICAL_GRANULARITY;
        } else {
            return MaqlType.GRANULARITY;
        }
    }
}
