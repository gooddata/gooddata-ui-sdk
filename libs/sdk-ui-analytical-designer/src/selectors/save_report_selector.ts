// (C) 2007-2026 GoodData Corporation

import { has, isEqual, omit, sortBy } from "lodash-es";
import { createSelector } from "reselect";

import { type IInsightDefinition, type VisualizationProperties } from "@gooddata/sdk-model";

import { CHOROPLETH, LOCAL_CHOROPLETH, LOCAL_PUSHPIN, PUSHPIN } from "../constants/visualization_types.js";
import { BackendToBearConvertors } from "../convertors/index.js";
import { getVisualizationObjectForSave } from "../services/report_service.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { getInsightSummary, getInsightTitle } from "../store/insight/insight_selectors.js";
import { getInsightUsageOnDashboardsSelector } from "../store/insight_usage/insight_usage_selectors.js";
import { getLastSavedObject, isReportSaving, isReportSavingAsNew } from "../store/report/report_selectors.js";
import { type IAppState } from "../store/types.js";
import {
    type IObjectMeta,
    type BucketItem as IVisualizationObjectBucketItem,
    type IVisualizationObjectMeasure,
    type IVisualizationObjectMeasureValueFilter,
    type VisualizationObjectExtendedFilter,
} from "../typings/bear/bearTypes.js";
import { type IReportContent } from "../typings/report.js";
import { getVisualizationPropertiesWithDefaultValues } from "../utils/visualization_properties.js";

import { enableGeoArea, enableNewGeoPushpin } from "./feature_flag_selector.js";
import {
    hasDataSelector,
    hasEmptyAfmSelector,
    hasReportLoadingError,
    isInvalidConfigurationSelector,
    isProtectedReportSelector,
    isReportEmptySelector,
    isReportMissingAreaSelector,
    isReportMissingColumnsSelector,
    isReportMissingLocationSelector,
    isReportMissingMetricSelector,
    isReportTooLargeSelector,
    isUnsupportedConfiguration,
} from "./report_selector.js";
import { getRouteQueryAsOfDate, getSourceDashboardId, isEditFromKD } from "./route_selector.js";

const isSavingSelector = (state: IAppState): boolean => isReportSaving(state);
export const isSavingAsNewSelector = (state: IAppState): boolean => isReportSavingAsNew(state);

const BUCKET_ITEM_BOOLEAN_PATHS = [["measure", "definition", "measureDefinition", "computeRatio"]];

/**
 * The content shape while it travels through the comparison pipeline: `properties` is EXPANDED
 * into an object by {@link expandProperties} and serialized back to a string before the final
 * conversion, so the field is looser than on the stored {@link IReportContent}.
 */
type IComparableReportContent = Omit<IReportContent, "properties"> & {
    properties?: VisualizationProperties | string;
};

/** `setIn`: rebuilds the spine along `path`, leaving every other branch shared. */
function setAtPath<T>(target: T, path: string[], value: unknown): T {
    const [head, ...rest] = path;
    return {
        ...target,
        [head]: rest.length
            ? setAtPath((target as Record<string, unknown>)?.[head] ?? {}, rest, value)
            : value,
    };
}

function getAtPath(target: unknown, path: string[]): unknown {
    return path.reduce((acc: unknown, key) => (acc as Record<string, unknown>)?.[key], target);
}

function convertToBooleans(
    item: IVisualizationObjectBucketItem,
    paths: string[][],
): IVisualizationObjectBucketItem {
    return paths.reduce((updatedItem, path) => {
        // deliberate: when the PARENT path exists the leaf is
        // coerced to a boolean — including materializing `computeRatio: false` when absent
        if (has(updatedItem, path.slice(0, path.length - 1))) {
            return setAtPath(updatedItem, path, !!getAtPath(updatedItem, path));
        }
        return updatedItem;
    }, item);
}

function deleteTitle(item: IVisualizationObjectBucketItem): IVisualizationObjectBucketItem {
    if (!has(item, "measure")) {
        return item;
    }
    const measureItem = item as IVisualizationObjectMeasure;
    return { ...measureItem, measure: omit(measureItem.measure, ["title"]) };
}

function deleteCondition(
    filter: IVisualizationObjectMeasureValueFilter,
): IVisualizationObjectMeasureValueFilter {
    return { ...filter, measureValueFilter: omit(filter.measureValueFilter, ["condition", "conditions"]) };
}

function reorderBuckets(reportContent: IComparableReportContent): IComparableReportContent {
    return {
        ...reportContent,
        buckets: sortBy(reportContent.buckets ?? [], (b) => b.localIdentifier),
    };
}

function expandProperties(reportContent: IReportContent): IComparableReportContent {
    const properties = BackendToBearConvertors.deserializeProperties(reportContent.properties ?? "");
    return { ...reportContent, properties };
}

function sanitizeMeasureValueFilters(reportContent: IComparableReportContent): IComparableReportContent {
    if (!has(reportContent, "filters")) {
        return reportContent;
    }

    return {
        ...reportContent,
        filters: (reportContent.filters ?? []).map((filter: IProbedFilter) =>
            has(filter, "measureValueFilter") &&
            !filter.measureValueFilter?.condition &&
            !((filter.measureValueFilter?.conditions?.length ?? 0) > 0)
                ? // the `has` probe above IS the narrowing the union cannot express
                  deleteCondition(filter as IVisualizationObjectMeasureValueFilter)
                : filter,
        ) as VisualizationObjectExtendedFilter[],
    };
}

/**
 * The members these comparisons probe. `VisualizationObjectExtendedFilter` is a union and lodash
 * `has` does not narrow it, so the reads were only legal while the callback was typed `any`.
 */
type IProbedFilter = VisualizationObjectExtendedFilter & {
    measureValueFilter?: { condition?: unknown; conditions?: unknown[] };
    positiveAttributeFilter?: Record<string, unknown>;
    negativeAttributeFilter?: Record<string, unknown>;
};

// localIdentifiers are added during filters migration and are not needed for comparison
function stripLocalIdsInFilters(reportContent: IComparableReportContent): IComparableReportContent {
    if (!has(reportContent, "filters")) {
        return reportContent;
    }

    return {
        ...reportContent,
        filters: (reportContent.filters ?? []).map((filter: IProbedFilter) =>
            filter.positiveAttributeFilter
                ? {
                      ...filter,
                      positiveAttributeFilter: omit(filter.positiveAttributeFilter, ["localIdentifier"]),
                  }
                : filter.negativeAttributeFilter
                  ? {
                        ...filter,
                        negativeAttributeFilter: omit(filter.negativeAttributeFilter, ["localIdentifier"]),
                    }
                  : filter,
        ) as VisualizationObjectExtendedFilter[],
    };
}

type PrepareForComparisonOptions = {
    ignoreGeoTooltipText?: boolean;
};

function shouldIgnoreGeoTooltipTextInSaveComparison(state: IAppState): boolean {
    return enableNewGeoPushpin(state) || enableGeoArea(state);
}

function isGeoReport(reportContent: IComparableReportContent): boolean {
    const uri = reportContent?.visualizationClass?.uri;
    return uri === LOCAL_PUSHPIN || uri === LOCAL_CHOROPLETH;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export function prepareForComparison(
    reportContent: IReportContent | null | undefined,
    options: PrepareForComparisonOptions = {},
): IInsightDefinition | null {
    if (!reportContent) {
        return null;
    }
    // order of buckets doesn't matter
    let updatedReportContent = expandProperties(reportContent);
    if (options.ignoreGeoTooltipText && isGeoReport(updatedReportContent)) {
        const properties = updatedReportContent.properties;
        updatedReportContent = {
            ...updatedReportContent,
            properties: isRecord(properties)
                ? {
                      ...properties,
                      ...(isRecord(properties["controls"])
                          ? { controls: omit(properties["controls"], ["tooltipText"]) }
                          : {}),
                  }
                : properties,
        };
    }
    const propertiesWithDefaultValues = getVisualizationPropertiesWithDefaultValues(
        updatedReportContent.properties,
    );
    updatedReportContent = {
        ...updatedReportContent,
        properties: BackendToBearConvertors.serializeProperties(propertiesWithDefaultValues),
    };
    updatedReportContent = reorderBuckets(updatedReportContent);
    updatedReportContent = sanitizeMeasureValueFilters(updatedReportContent);
    updatedReportContent = stripLocalIdsInFilters(updatedReportContent);

    updatedReportContent = {
        ...updatedReportContent,
        buckets: (updatedReportContent.buckets ?? [])
            .map((bucket) => ({
                ...bucket,
                items: (bucket.items ?? []).map((item) =>
                    deleteTitle(convertToBooleans(item, BUCKET_ITEM_BOOLEAN_PATHS)),
                ),
            }))
            .filter((bucket) => (bucket.items?.length ?? 0) > 0),
    };

    return BackendToBearConvertors.convertVisualization(
        {
            visualizationObject: {
                // the comparison pipeline expands `properties` into an object; the convertor
                // deserializes string properties and passes objects through
                content: updatedReportContent as unknown as IReportContent,
                meta: {} as IObjectMeta, // we do not care about the meta here
            },
        },
        updatedReportContent.visualizationClass?.uri,
    );
}

function getVisualizationObjectForSaveContent(state: IAppState): IReportContent {
    return getVisualizationObjectForSave(state).visualizationObject.content;
}

export function isReportInvalidSelector(state: IAppState): boolean {
    const isInvalid = isReportMissingColumnsSelector(state) || hasEmptyAfmSelector(state);
    const visualizationType = getVisualizationClassTypeFromState(state);

    if (visualizationType === PUSHPIN || visualizationType === CHOROPLETH) {
        return isReportMissingLocationSelector(state) || isReportMissingAreaSelector(state) || isInvalid;
    }

    return isReportMissingMetricSelector(state) || isInvalid;
}

export function isSavedReportCurrentReport(state: IAppState): boolean {
    const savedReportContent = getLastSavedObject(state).visualizationObject?.content;
    const currentReportContent = getVisualizationObjectForSaveContent(state);

    const ignoreGeoTooltipText = shouldIgnoreGeoTooltipTextInSaveComparison(state);

    return isEqual(
        prepareForComparison(savedReportContent, { ignoreGeoTooltipText }),
        prepareForComparison(currentReportContent, { ignoreGeoTooltipText }),
    );
}

export const hasTitleChanged = (state: IAppState): boolean =>
    getLastSavedObject(state).visualizationObject?.meta?.title !== getInsightTitle(state);

export const hasDescriptionChanged = (state: IAppState): boolean =>
    getLastSavedObject(state).visualizationObject?.meta?.summary !== getInsightSummary(state);

const savingInProgressSelector = (state: IAppState): boolean =>
    isSavingSelector(state) || isSavingAsNewSelector(state);

const reportCanBeSaved = (state: IAppState): boolean => {
    return (
        !isReportInvalidSelector(state) &&
        !hasReportLoadingError(state) &&
        !isUnsupportedConfiguration(state) &&
        (hasDataSelector(state) ||
            isInvalidConfigurationSelector(state) ||
            isReportEmptySelector(state) ||
            isReportTooLargeSelector(state) ||
            isProtectedReportSelector(state))
    );
};

const isCurrentWithUnchangedTitle = (state: IAppState): boolean =>
    isSavedReportCurrentReport(state) && !hasTitleChanged(state);

const isCurrentDescriptionUnchanged = (state: IAppState): boolean =>
    isSavedReportCurrentReport(state) && !hasDescriptionChanged(state);

export const isSaveDisabledSelector = (state: IAppState): boolean =>
    !reportCanBeSaved(state) ||
    savingInProgressSelector(state) ||
    (isCurrentWithUnchangedTitle(state) && isCurrentDescriptionUnchanged(state)) ||
    // When asOfDate query param is used, we disable persisting actions
    !!getRouteQueryAsOfDate(state);

export const showDisabledSaveButtonTooltip = (state: IAppState): boolean => !!getRouteQueryAsOfDate(state);

export const isSaveAsNewDisabledSelector = (state: IAppState): boolean =>
    !reportCanBeSaved(state) || savingInProgressSelector(state);

export const isUsedOnOtherThanSourceDashboard = createSelector(
    getInsightUsageOnDashboardsSelector,
    getSourceDashboardId,
    (usages, sourceDashboardId) => {
        return usages.allDashboards.filter((usage) => usage.id != sourceDashboardId).length > 0;
    },
);

export const saveReportSelector = createSelector(
    isSavingSelector,
    isSaveDisabledSelector,
    isUsedOnOtherThanSourceDashboard,
    isEditFromKD,
    showDisabledSaveButtonTooltip,
    (isSaving, isDisabled, usedOnOther, editingFromKD, showDisabledTooltip) => ({
        isSaving,
        isDisabled,
        displaySaveInsightFromKDDialog: editingFromKD && usedOnOther,
        showDisabledTooltip,
    }),
);

export const saveAsNewReportSelector = createSelector(
    isSavingAsNewSelector,
    isSaveAsNewDisabledSelector,

    (isSaving, isDisabled) => ({
        isSaving,
        isDisabled,
    }),
);
