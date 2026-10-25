// (C) 2007-2026 GoodData Corporation

import { createSelector, createStructuredSelector } from "reselect";

import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";
import { ErrorCodes, OverTimeComparisonTypes } from "@gooddata/sdk-ui";
import { PluggableVisualizationErrorCodes } from "@gooddata/sdk-ui-ext/internal";

import { NOT_FOUND } from "../constants/errors.js";
import { CHOROPLETH, PUSHPIN } from "../constants/visualization_types.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { GRANULARITY } from "../models/granularity.js";
import { isNoMetricConfigSupported } from "../services/buckets_service.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { getAppSessionId } from "../store/app_context/app_context_selectors.js";
import { getExecutionState } from "../store/execution/execution_selectors.js";
import { areSomeFiltersSetUp, getFirstDateFilter } from "../store/filter_bar/filter_bar_selector.js";
import { getInsightSummary, getInsightTags, getInsightTitle } from "../store/insight/insight_selectors.js";
import { getInsightUsageOnDashboardsSelector } from "../store/insight_usage/insight_usage_selectors.js";
import {
    getLastSavedObject,
    getReportLoadingError as getReportLoadingErrorState,
    isReportOpening,
} from "../store/report/report_selectors.js";
import { type OpenReportError } from "../store/report/report_state.js";
import { type IAppState } from "../store/types.js";
import { type IErrorResponseData, type IMissingDateFilterItem } from "../typings/report.js";

import { getProjectId } from "./bootstrap_selector.js";
import {
    areMeasureFiltersSetUp,
    currentReportMDObjectExtended,
    getBucketItemsSelector,
} from "./buckets_selector.js";
import { getUiConfigCustomErrorSelector } from "./extended_reference_point_selector.js";
import { getIntlMessagesForLocale } from "./intl_selector.js";
import { displayBlockSelector, getDroppedCatalogItem } from "./shortcuts_selector.js";

// Stable empty fallbacks: a fresh value per call would defeat the shallow prop comparison of the
// components reading them.
// Frozen for consistency with the non-empty case: everything else these selectors return is
// immer-frozen slice state already, so a consumer mutating the shared fallback would otherwise be
// the one write that "works" — silently, for every other consumer at once.
const EMPTY_RESPONSE_DATA = Object.freeze({}) as IErrorResponseData;
const EMPTY_LIMIT_BREAKS: ReadonlyArray<IExecutionResultLimitBreak> = Object.freeze([]);

// The execution domain's readers hang off its ONE input selector.
const getExecutionError = (state: IAppState) => getExecutionState(state).error;

const getExecutionErrorStatus = (state: IAppState) => getExecutionState(state).error?.status;

// the domain accessor converts back to `undefined` for "no error" — the slice stores null
// (a non-draftable state cannot be undefined) and both readers below test against undefined
function getReportLoadingError(state: IAppState): OpenReportError | undefined {
    return getReportLoadingErrorState(state);
}

/**
 * Returns the STORED object directly rather than a copy: every consumer only reads from it (traceId,
 * httpStatus, rawData), and the stable reference keeps the error components from re-rendering on
 * unrelated store changes.
 */
export function getExecutionErrorResponseData(state: IAppState) {
    return getExecutionState(state).error?.responseData ?? EMPTY_RESPONSE_DATA;
}

// the report domain's readers hang off getLastSavedObject. The leaf is absent on the pristine
// post-reset state, where the accessor serves the domain's initial value, so the child reads below
// are safe there.
export const isReportLockedSelector = (state: IAppState): boolean =>
    !!getLastSavedObject(state).visualizationObject?.meta?.locked;

export const getLastSavedReportPermissions = (state: IAppState) =>
    getLastSavedObject(state).visualizationObject?.meta?.permissions;

export function isComputingShortcutSelector(state: IAppState): boolean {
    return !!getDroppedCatalogItem(state);
}

export const lastSavedReportSelector = (state: IAppState) => getLastSavedObject(state).visualizationObject;

export const isEnabledInsightUsageOnDashboards = (state: IAppState): boolean => {
    const usages = getInsightUsageOnDashboardsSelector(state);
    const hasUsages = usages && !!usages.allDashboardsCount;

    return !isReportOpening(state) && hasUsages;
};

export const openReportIdSelector = createSelector([lastSavedReportSelector], (lastSavedReport) => {
    return lastSavedReport?.meta?.identifier;
});

export const getLastSavedReportVisClassUrl = (state: IAppState): string | undefined =>
    getLastSavedObject(state).visualizationObject?.content?.visualizationClass?.uri;

export const getLastSavedReportTitle = (state: IAppState): string | undefined =>
    getLastSavedObject(state).visualizationObject?.meta?.title;

export const getLastSavedReportIdentifier = (state: IAppState): string | undefined =>
    getLastSavedObject(state).visualizationObject?.meta?.identifier;

export const getLastSavedReportUri = (state: IAppState): string | undefined =>
    getLastSavedObject(state).visualizationObject?.meta?.uri;

export const getLastSavedReportIsHidden = (state: IAppState): boolean | undefined =>
    getLastSavedObject(state).visualizationObject?.meta?.isHidden;

export const isReportSavedSelector = (state: IAppState): boolean => !!getLastSavedReportUri(state);

// the insight domain's readers hang off its accessors — the leaves are slice-owned
// and genuinely absent on the pristine post-reset state, where the accessors serve the
// domain's initial values ("", [], "")
export const getReportTitle = (state: IAppState): string | undefined => getInsightTitle(state);

export const getReportTags = (state: IAppState): string[] | undefined => getInsightTags(state);

export const getReportSummary = (state: IAppState): string | undefined => getInsightSummary(state);

/** `undefined` until the first app reset writes it — the combined root only HOLDS the key. */
export const appSessionIdSelector = (state: IAppState): string | undefined => getAppSessionId(state);

export const isExecutionRunningSelector = (state: IAppState): boolean => getExecutionState(state).running;

export const hasDataSelector = (state: IAppState): boolean => getExecutionState(state).hasData;

const getExecutionLimitBreaksState = (state: IAppState) => getExecutionState(state).warning?.limitBreaks;

export const getExecutionLimitBreaks = createSelector(
    getExecutionLimitBreaksState,
    (limitBreaks) => limitBreaks ?? EMPTY_LIMIT_BREAKS,
);

export const hasPartialDataLimitBreaks = createSelector(
    getExecutionLimitBreaks,
    (limitBreaks) => limitBreaks.length > 0,
);

export const isReportNotFoundSelector = createSelector(
    getExecutionError,
    displayBlockSelector,

    (error, areShortcutsShown) => !!error && error.status === NOT_FOUND && !areShortcutsShown,
);

const NO_MISSING_ITEMS: ReadonlyArray<IMissingDateFilterItem> = [];

/** The items a not-found open failure names: what the insight references but the workspace no longer has. */
export const getReportNotFoundMissingItems = createSelector(
    getExecutionError,
    (error): ReadonlyArray<IMissingDateFilterItem> => error?.missingItems ?? NO_MISSING_ITEMS,
);

export const isDataTooLargeToComputeSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
);

export const isDataTooLargeToDisplaySelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
);

export const isReportTooLargeSelector = createSelector(
    isDataTooLargeToComputeSelector,
    isDataTooLargeToDisplaySelector,
    (isDataTooLargeToCompute, isDataTooLargeToDisplay) => isDataTooLargeToCompute || isDataTooLargeToDisplay,
);

export const isInvalidConfigurationSelector = createSelector(
    getExecutionErrorStatus,
    (status) => status === ErrorCodes.UNKNOWN_ERROR || status === ErrorCodes.BAD_REQUEST,
);

export const hasNegativeValueSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.NEGATIVE_VALUES,
);

export const isReportEmptySelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.NO_DATA,
);

const areFiltersSetUp = createSelector(
    areSomeFiltersSetUp,
    areMeasureFiltersSetUp,
    (someGlobalFiltersSetUp, measureFiltersSetUp) => someGlobalFiltersSetUp || measureFiltersSetUp,
);

export const isReportWithFiltersEmptySelector = createSelector(
    isReportEmptySelector,
    areFiltersSetUp,
    (isEmpty, filtersSetUp) => isEmpty && filtersSetUp,
);

export const isReportWithoutFiltersEmptySelector = createSelector(
    isReportEmptySelector,
    areFiltersSetUp,
    (isEmpty, filtersSetUp) => isEmpty && !filtersSetUp,
);

export const isBadRequestSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.BAD_REQUEST,
);

export const isProtectedReportSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === ErrorCodes.PROTECTED_REPORT,
);

export const hasReportLoadingError = createSelector(getReportLoadingError, (error) => error !== undefined);

export const isReportMissingLocationSelector = createSelector(
    getExecutionError,
    getVisualizationClassTypeFromState,
    (error, visualizationType) =>
        !!error && error.status === ErrorCodes.GEO_LOCATION_MISSING && visualizationType === PUSHPIN,
);

export const isReportMissingAreaSelector = createSelector(
    getExecutionError,
    getVisualizationClassTypeFromState,
    (error, visualizationType) =>
        !!error && error.status === ErrorCodes.GEO_AREA_MISSING && visualizationType === CHOROPLETH,
);

export const isReportMissingMetricSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === PluggableVisualizationErrorCodes.INVALID_BUCKETS,
);

export const isReportMissingColumnsSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === PluggableVisualizationErrorCodes.INVALID_COLUMNS,
);

export const hasEmptyAfmSelector = createSelector(
    getExecutionError,
    (error) => !!error && error.status === PluggableVisualizationErrorCodes.EMPTY_AFM,
);

export const isReportExecutableSelector = createSelector(
    currentReportMDObjectExtended,

    (mdObject) => {
        const buckets = mdObject.buckets ?? [];
        const hasMeasure = buckets.some((bucket) => (bucket.items ?? []).some((item) => "measure" in item));
        const hasAttribute = buckets.some((bucket) =>
            (bucket.items ?? []).some((item) => "visualizationAttribute" in item),
        );

        return hasMeasure || hasAttribute;
    },
);

export const isUnsupportedConfiguration = createSelector(
    getFirstDateFilter, // only first date filter is relevant for PoP metric
    getBucketItemsSelector,
    (filter, bucketItems) => {
        const dateBucketItem = bucketItems.find(
            (bucketItem) => bucketItem.attribute === DATE_DATASET_ATTRIBUTE,
        );
        if (dateBucketItem === undefined || filter?.filterConfig === undefined) {
            return false;
        }
        const viewedByDayGranularity = dateBucketItem.granularity === GRANULARITY.DATE;
        const hasPreviousPeriodComparison = bucketItems.some(
            (bucketItem) => bucketItem.overTimeComparisonType === OverTimeComparisonTypes.PREVIOUS_PERIOD,
        );
        const isAbsoluteDateFilter = filter.filterConfig.type === "absolute";
        return hasPreviousPeriodComparison && isAbsoluteDateFilter && !viewedByDayGranularity;
    },
);

export const isReportValid = createSelector(
    hasDataSelector,
    isReportTooLargeSelector,
    isInvalidConfigurationSelector,
    isReportEmptySelector,
    isReportMissingMetricSelector,
    hasEmptyAfmSelector,
    getReportLoadingError,

    (
        hasData,
        isReportTooLarge,
        isInvalidConfiguration,
        isReportEmpty,
        isMissingMetric,
        hasEmptyAfm,
        loadingError,
    ) => {
        return (
            hasData &&
            !isReportTooLarge &&
            !isInvalidConfiguration &&
            !isReportEmpty &&
            !isMissingMetric &&
            !hasEmptyAfm &&
            loadingError === undefined
        );
    },
);

const reportTopLayerDataSelector = createStructuredSelector({
    appSessionId: appSessionIdSelector,
    isExecutionRunning: isExecutionRunningSelector,
    isReportNotFound: isReportNotFoundSelector,
    reportNotFoundMissingItems: getReportNotFoundMissingItems,
    isReportTooLargeToCompute: isDataTooLargeToComputeSelector,
    isReportTooLargeToDisplay: isDataTooLargeToDisplaySelector,
    isInvalidConfiguration: isInvalidConfigurationSelector,
    isReportEmpty: isReportEmptySelector,
    isReportWithFiltersEmpty: isReportWithFiltersEmptySelector,
    isReportWithoutFiltersEmpty: isReportWithoutFiltersEmptySelector,
    isBadRequest: isBadRequestSelector,
    isReportProtected: isProtectedReportSelector,
    isMissingLocation: isReportMissingLocationSelector,
    isMissingArea: isReportMissingAreaSelector,
    isMissingMetric: isReportMissingMetricSelector,
    isMissingColumns: isReportMissingColumnsSelector,
    isExecutable: isReportExecutableSelector,
    isComputingShortcut: isComputingShortcutSelector,
    hasNegativeValue: hasNegativeValueSelector,
    unsupportedConfiguration: isUnsupportedConfiguration,
    hasReportLoadingError: hasReportLoadingError,
    customError: getUiConfigCustomErrorSelector,
});

export const reportSelector = createSelector(
    getProjectId,
    getIntlMessagesForLocale,
    reportTopLayerDataSelector,
    isNoMetricConfigSupported,

    (projectId, messages, reportTopLayerData, isNoMetricSupported) => {
        return {
            projectId,
            // This probably should be used as its own selector, I did not want to change the API, though.
            ...reportTopLayerData,
            messages,
            isNoMetricSupported,
        };
    },
);
