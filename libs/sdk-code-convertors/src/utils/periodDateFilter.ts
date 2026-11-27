// (C) 2026 GoodData Corporation

import { Pair, YAMLMap } from "yaml";

import {
    type DashboardParameterizedDateFilter,
    type DashboardParameterizedDateFilterDashboardParameterizedDateFilter,
    type IdentifierRef as StoredIdentifierRef,
} from "@gooddata/api-client-tiger";
import { type EmptyValues, type FilterContextItem, type ObjRef } from "@gooddata/sdk-model";

import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "./errors.js";
import { storedReferenceId } from "./yamlUtils.js";

/**
 * A date filter set to a period: it names a date range parameter and filters by the parameter's current
 * range. A visualization filter names its date data set `using`; a dashboard filter names it `date`, and
 * one without it is the dashboard's common date filter.
 */
export type YamlPeriodDateFilter = {
    type: "date_filter";
    parameter: string;
    /** The date data set in a visualization. */
    using?: string;
    /** The date data set in a dashboard. */
    date?: string;
    empty_values?: EmptyValues;
    /** A range of the filter's own, which a period refuses: it takes its range from the parameter. */
    granularity?: string;
    from?: string | number;
    to?: string | number;
};

/** Which YAML holds the period date filter, and so which key names its date data set. */
export type PeriodDateFilterHolder = "visualisation" | "dashboard";

const dataSetKeys = {
    visualisation: "using",
    dashboard: "date",
} as const satisfies Record<PeriodDateFilterHolder, string>;

/**
 * The stored body, the same in a declarative insight's `parameterizedDateFilter` and in a dashboard's
 * `dashboardParameterizedDateFilter`.
 */
export type StoredPeriodDateFilterBody = DashboardParameterizedDateFilterDashboardParameterizedDateFilter;

/** A filter context item, including the period date filter sdk-model has no dashboard type for yet. */
export type StoredFilterContextItem = FilterContextItem | DashboardParameterizedDateFilter;

/** Keeps what the caller already knows of the filter, such as a visualization filter's `with`. */
export function isPeriodDateFilter<T>(obj: T): obj is T & YamlPeriodDateFilter {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        obj.type === "date_filter" &&
        "parameter" in obj &&
        typeof obj.parameter === "string"
    );
}

export function isDashboardPeriodDateFilter(
    item: StoredFilterContextItem,
): item is DashboardParameterizedDateFilter {
    return "dashboardParameterizedDateFilter" in item;
}

const ownRangeKeys = ["granularity", "from", "to"] as const;

/**
 * A period takes its range from its parameter, so a range the filter sets itself has nowhere to go. It
 * is refused rather than dropped, with the error located at the filter's key under `errorContext`.
 */
export function refusePeriodDateFilterOwnRange(
    filter: YamlPeriodDateFilter,
    key: string,
    errorContext?: IErrorContext,
): void {
    const ownRange = ownRangeKeys.filter((rangeKey) => filter[rangeKey] !== undefined);
    if (ownRange.length > 0) {
        throw newError(
            CoreErrorCode.PeriodFilterWithRange,
            [key, ownRange.map((rangeKey) => `"${rangeKey}"`).join(", ")],
            updateErrorContext(errorContext, { path: [key] }),
        );
    }
}

/**
 * A reference of the given type, in the shape both the declarative API and the AFM take. The id may carry
 * its `type/` prefix, as a visualization's `using` does.
 */
export function periodReference<TType extends "dataset" | "parameter">(
    id: string,
    type: TType,
): { identifier: { id: string; type: TType } } {
    return { identifier: { id: id.slice(id.indexOf("/") + 1), type } };
}

/** The stored body of a period date filter, which keeps its YAML key as its local identifier. */
export function periodDateFilterToStored(
    filter: YamlPeriodDateFilter,
    key: string,
    holder: PeriodDateFilterHolder,
    errorContext?: IErrorContext,
): StoredPeriodDateFilterBody {
    refusePeriodDateFilterOwnRange(filter, key, errorContext);
    const dataSet = filter[dataSetKeys[holder]];
    return {
        ...(typeof dataSet === "string" ? { dataSet: periodReference(dataSet, "dataset") } : {}),
        parameter: periodReference(filter.parameter, "parameter"),
        localIdentifier: key,
        ...(filter.empty_values === undefined ? {} : { emptyValueHandling: filter.empty_values }),
    };
}

/**
 * The YAML of a stored period date filter: its type, date data set and parameter. Each holder writes the
 * empty values mode itself, as it does for its other date filters.
 */
export function periodDateFilterToYaml(
    body: { dataSet?: ObjRef | StoredIdentifierRef; parameter: ObjRef | StoredIdentifierRef },
    holder: PeriodDateFilterHolder,
    errorContext?: IErrorContext,
): YAMLMap {
    const map = new YAMLMap();
    map.add(new Pair("type", "date_filter"));
    if (body.dataSet) {
        map.add(
            new Pair(
                dataSetKeys[holder],
                storedReferenceId(body.dataSet, updateErrorContext(errorContext, { path: ["dataSet"] })),
            ),
        );
    }
    map.add(
        new Pair(
            "parameter",
            storedReferenceId(body.parameter, updateErrorContext(errorContext, { path: ["parameter"] })),
        ),
    );
    return map;
}
