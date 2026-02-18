// (C) 2019-2026 GoodData Corporation

import {
    type ITigerAbsoluteDateFilter,
    type ITigerFilter,
    type ITigerFilterContextItem,
    type ITigerMeasureValueFilter,
    type ITigerNegativeAttributeFilter,
    type ITigerPositiveAttributeFilter,
    type ITigerRankingFilter,
    type ITigerRelativeDateFilter,
} from "./TigerTypes.js";
import {
    type AfmLocalIdentifier,
    type AfmObjectIdentifier,
    type AttributeExecutionResultHeader,
    type AttributeHeader,
    type ExecutionResultHeader,
    type MeasureExecutionResultHeader,
    type ResultDimensionHeader,
    type TotalExecutionResultHeader,
} from "../generated/afm-rest-api/index.js";
import {
    type DashboardAttributeFilter,
    type DashboardDateFilter,
    type JsonApiAttributeOutWithLinks,
    type JsonApiDashboardPluginOutWithLinks,
    type JsonApiDatasetOutWithLinks,
    type JsonApiFactOutWithLinks,
    type JsonApiFilterContextIn,
    type JsonApiLabelOutWithLinks,
    type JsonApiMetricOutWithLinks,
    type JsonApiVisualizationObjectOutWithLinks,
} from "../generated/metadata-json-api/index.js";

/**
 * @public
 */
export function isAttributeHeader(header: ResultDimensionHeader): header is AttributeHeader {
    return header && (header as AttributeHeader).attributeHeader !== undefined;
}

/**
 * @public
 */
export const isAfmObjectIdentifier = (value: unknown): value is AfmObjectIdentifier => {
    return !!(
        (value as Partial<AfmObjectIdentifier>)?.identifier?.id &&
        (value as Partial<AfmObjectIdentifier>)?.identifier?.type
    );
};

/**
 * @public
 */
export const isAfmObjectLocalIdentifier = (value: unknown): value is AfmLocalIdentifier => {
    return !!(value as Partial<AfmLocalIdentifier>)?.localIdentifier;
};

/**
 * @public
 */
export function isResultAttributeHeader(
    header: ExecutionResultHeader,
): header is AttributeExecutionResultHeader {
    return (header as AttributeExecutionResultHeader).attributeHeader !== undefined;
}

/**
 * @public
 */
export function isResultMeasureHeader(header: ExecutionResultHeader): header is MeasureExecutionResultHeader {
    return (header as MeasureExecutionResultHeader).measureHeader !== undefined;
}

/**
 * @public
 */
export function isResultTotalHeader(header: ExecutionResultHeader): header is TotalExecutionResultHeader {
    return (header as TotalExecutionResultHeader).totalHeader !== undefined;
}

/**
 * @public
 */
export function isVisualizationObjectsItem(
    visualizationObject: unknown,
): visualizationObject is JsonApiVisualizationObjectOutWithLinks {
    return (visualizationObject as JsonApiVisualizationObjectOutWithLinks).type === "visualizationObject";
}

/**
 * @public
 */
export function isFilterContextData(filterContext: unknown): filterContext is JsonApiFilterContextIn {
    return (filterContext as JsonApiFilterContextIn).type === "filterContext";
}

/**
 * @public
 */
export function isDashboardPluginsItem(
    dashboardPlugin: unknown,
): dashboardPlugin is JsonApiDashboardPluginOutWithLinks {
    return (dashboardPlugin as JsonApiDashboardPluginOutWithLinks).type === "dashboardPlugin";
}

/**
 * @public
 */
export function isDataSetItem(dataSet: unknown): dataSet is JsonApiDatasetOutWithLinks {
    return (dataSet as JsonApiDatasetOutWithLinks).type === "dataset";
}

/**
 * @public
 */
export function isLabelItem(label: unknown): label is JsonApiLabelOutWithLinks {
    return (label as JsonApiLabelOutWithLinks).type === "label";
}

/**
 * @public
 */
export function isAttributeItem(attribute: unknown): attribute is JsonApiAttributeOutWithLinks {
    return (attribute as JsonApiAttributeOutWithLinks).type === "attribute";
}

/**
 * @public
 */
export function isFactItem(fact: unknown): fact is JsonApiFactOutWithLinks {
    return (fact as JsonApiFactOutWithLinks).type === "fact";
}

/**
 * @public
 */
export function isMetricItem(metric: unknown): metric is JsonApiMetricOutWithLinks {
    return (metric as JsonApiMetricOutWithLinks).type === "metric";
}

/**
 * @public
 */
export function isTigerFilterContextItem(obj: unknown): obj is ITigerFilterContextItem {
    if (!obj || typeof obj !== "object") {
        return false;
    }

    if ("attributeFilter" in obj) {
        return isDashboardAttributeFilter(obj);
    }

    if ("dateFilter" in obj) {
        return isDashboardDateFilter(obj);
    }

    return false;
}

/**
 * @public
 */
export function isTigerFilterContextItems(filters: unknown[]): filters is ITigerFilterContextItem[] {
    return filters.every(isTigerFilterContextItem);
}

/**
 * @public
 */
export function isTigerFilter(obj: unknown): obj is ITigerFilter {
    return (
        isTigerDateFilter(obj) ||
        isTigerAttributeFilter(obj) ||
        isTigerMeasureValueFilter(obj) ||
        isTigerRankingFilter(obj)
    );
}

/**
 * @public
 */
export function isTigerFilters(filters: unknown[]): filters is ITigerFilter[] {
    return filters.every(isTigerFilter);
}

function isTigerAttributeFilter(
    obj: unknown,
): obj is ITigerPositiveAttributeFilter | ITigerNegativeAttributeFilter {
    return isTigerPositiveAttributeFilter(obj) || isTigerNegativeAttributeFilter(obj);
}

function isTigerDateFilter(obj: unknown): obj is ITigerAbsoluteDateFilter | ITigerRelativeDateFilter {
    return isTigerAbsoluteDateFilter(obj) || isTigerRelativeDateFilter(obj);
}

function isTigerPositiveAttributeFilter(obj: unknown): obj is ITigerPositiveAttributeFilter {
    return !!obj && typeof obj === "object" && "positiveAttributeFilter" in obj;
}

function isTigerNegativeAttributeFilter(obj: unknown): obj is ITigerNegativeAttributeFilter {
    return !!obj && typeof obj === "object" && "negativeAttributeFilter" in obj;
}

function isTigerAbsoluteDateFilter(obj: unknown): obj is ITigerAbsoluteDateFilter {
    return !!obj && typeof obj === "object" && "absoluteDateFilter" in obj;
}

function isTigerRelativeDateFilter(obj: unknown): obj is ITigerRelativeDateFilter {
    return !!obj && typeof obj === "object" && "relativeDateFilter" in obj;
}

function isTigerMeasureValueFilter(obj: unknown): obj is ITigerMeasureValueFilter {
    return !!obj && typeof obj === "object" && "measureValueFilter" in obj;
}

function isTigerRankingFilter(obj: unknown): obj is ITigerRankingFilter {
    return !!obj && typeof obj === "object" && "rankingFilter" in obj;
}

function isDashboardAttributeFilter(obj: unknown): obj is DashboardAttributeFilter {
    return isAfmObjectIdentifier((obj as DashboardAttributeFilter).attributeFilter?.displayForm);
}

function isDashboardDateFilter(obj: unknown): obj is DashboardDateFilter {
    const dateFilter = (obj as DashboardDateFilter).dateFilter;
    return (
        !!dateFilter &&
        (isAfmObjectIdentifier(dateFilter.dataSet) ||
            isAfmObjectIdentifier(dateFilter.attribute) ||
            dateFilter.boundedFilter !== undefined)
    );
}
