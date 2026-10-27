// (C) 2007-2026 GoodData Corporation

import { partition } from "lodash-es";
import { defineMessages } from "react-intl";
import { type SagaReturnType, all, call, delay, put, select, take, takeEvery } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import { type IInsightReferences } from "@gooddata/sdk-backend-spi";
import { dateAttributeIdToSdkGranularity } from "@gooddata/sdk-backend-tiger";
import {
    type IInsight,
    type IMetadataObject,
    insightParameters,
    insightSorts,
    insightUri,
    insightVisualizationUrl,
    isAllTimeDateFilter,
    isDateFilterGranularity,
    isRelativeDateFilter,
    isUriRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";

import { changeDataset, updateInsightUsageOnDashboards, updateItemCache } from "../actions/data_actions.js";
import { addMessage, hideMessage, showWarningMessage } from "../actions/messages_actions.js";
import {
    type IOpenReportFinishedAction,
    type IOpenReportRequestedAction,
    openReportConfirmation,
    openReportFailed,
    openReportFinished,
    openReportStarted,
} from "../actions/open_actions.js";
import { backend } from "../backend.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { generateBucketItemIdentifier } from "../models/bucket_item_identifier.js";
import {
    enableAnalyticalDesignerCatalogSideload,
    enableImprovedMetricDateFilter,
    enableParameters,
    enableStringParameters,
    enableVisualizationPermissions,
} from "../selectors/feature_flag_selector.js";
import { getTagsConfiguration } from "../selectors/route_selector.js";
import { isSaveDisabledSelector } from "../selectors/save_report_selector.js";
import { getBucketsMeta } from "../services/buckets_service.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import { logVisualizationOpen } from "../services/telemetry/tracking_events.js";
import {
    getDefaultVisualizationClass,
    getVisualizationClassByUrl,
    getVisualizationClassType,
    isVisualizationClassDeletedOrDeprecated,
} from "../services/visualization_class_service.js";
import { buildApplicationResetCarrier } from "../store/app_context/application_reset_events.js";
import { resetRemovedItems } from "../store/bucket_notifications/bucket_notifications_actions.js";
import { getCatalogParameters, hasCatalogFirstLoaded } from "../store/catalog/catalog_selector.js";
import { storeAppliedChartSort } from "../store/chart_sort/chart_sort_actions.js";
import { getDateDatasetsState } from "../store/date_datasets/date_datasets_selectors.js";
import { getDateDatasetsMeta } from "../store/date_datasets_meta/date_datasets_meta_selectors.js";
import { getFilterBarState } from "../store/filter_bar/filter_bar_selector.js";
import {
    type IParameterRestoreResult,
    restoreParameterFilters,
} from "../store/filter_bar/parameter_filter_service.js";
import { getItemCacheState } from "../store/item_cache/item_cache_selectors.js";
import { getMeasureDateDatasetsState } from "../store/measure_date_datasets/measure_date_datasets_selectors.js";
import {
    MissingInsightItemsError,
    findMissingDateFilterItems,
    isMissingInsightItemsError,
} from "../store/report/handle_missing_date_filters.js";
import { applyOpenReport } from "../store/report/open_report_operation.js";
import { type IAppState } from "../store/types.js";
import {
    getVisualizationClassState,
    getVisualizationClassesState,
} from "../store/visualization_classes/visualization_classes_selectors.js";
import { type IApplicationResetCarrier } from "../typings/application_reset.js";
import { type ILoadedReportItems, type IMissingDateFilterItem } from "../typings/report.js";
import { getItemCacheItems, getObjectIdFromUri } from "../utils/api.js";
import { getInsightRef } from "../utils/insight_ref.js";
import { getRouteParams, getRouteUri, setLocation } from "../utils/location.js";
import { logError } from "../utils/logging/error_logging.js";
import { OrganizedCatalogUtils } from "../utils/organized_catalog.js";

import { CatalogSagaActionTypeKeys } from "./catalog/catalog_saga_actions.js";

const openReportMessages = defineMessages({
    openReportError: { id: "messages.openReportError" },
    openReportErrorDetails: { id: "messages.openReportErrorDetails" },
    defaultTable: { id: "messages.defaultTable" },
    defaultOther: { id: "messages.defaultOther" },
});

const parameterWarningMessages = defineMessages({
    reset: { id: "messages.parameterReset" },
    removed: { id: "messages.parameterRemoved" },
    incompatible: { id: "messages.parameterIncompatible" },
});

// Same as the dashboard parameter toast. It is longer than other toasts because the user must read it and act.
const PARAMETER_WARNING_DURATION_MS = 8000;

export function getStartTime() {
    return Date.now();
}

export function getDuration(startTime: number) {
    return Date.now() - startTime;
}

export function* openReportRequested({ payload: { forceOpen, insightRef } }: IOpenReportRequestedAction) {
    const isSaveDisabled: ReturnType<typeof isSaveDisabledSelector> = yield select(isSaveDisabledSelector);
    const insightIdOrUri = objRefToString(insightRef);

    if (isSaveDisabled || forceOpen) {
        const reportMetadataObjectIdOrIdentifier = isUriRef(insightRef)
            ? getObjectIdFromUri(insightIdOrUri)
            : insightIdOrUri;

        const targetRouteUri: ReturnType<typeof getRouteUri> = yield select(getRouteUri, {
            reportId: reportMetadataObjectIdOrIdentifier,
        });
        const currentRouteUri: ReturnType<typeof getRouteUri> = yield select(getRouteUri);
        // add '/reload' at the end of URI but before query if trying to redirect to the same URI
        const newUri =
            targetRouteUri === currentRouteUri
                ? currentRouteUri.replace(/#([^?]*)(\W|$)/, "#$1/reload$2")
                : targetRouteUri;

        yield call(setLocation, newUri);
    } else {
        yield put(openReportConfirmation(insightRef));
    }
}

export function* getReferencedObjects(projectId: string, insight: IInsight) {
    try {
        const loader = backend.workspace(projectId).insights();
        const objects: SagaReturnType<typeof loader.getInsightReferencedObjects> = yield call(
            [loader, loader.getInsightReferencedObjects],
            insight,
            ["dataSet", "measure", "fact", "attribute"],
        );
        return objects;
    } catch {
        // default to returning an empty array for backends that do not support the necessary calls
        return {};
    }
}

/**
 * Strips query parameters from a URI
 * @param uri - The URI to strip query parameters from
 * @returns The URI without query parameters
 */
function stripQueryParams(uri: string): string {
    const questionMarkIndex = uri.indexOf("?");
    // for some reason when we use includeObjectsWithTags or excludeObjectsWithTags, the URI contains a query parameter
    // we need to strip it to get the correct URI
    return questionMarkIndex === -1 ? uri : uri.substring(0, questionMarkIndex);
}

export function* getObjectsReferencing(projectId: string, insight: IInsight) {
    try {
        const uri = insightUri(insight);
        const strippedUri = stripQueryParams(uri);
        const loader = backend.workspace(projectId).insights();
        const references: SagaReturnType<typeof loader.getInsightReferencingObjects> = yield call(
            [loader, loader.getInsightReferencingObjects],
            uriRef(strippedUri),
        );
        return references.analyticalDashboards || [];
    } catch {
        return [];
    }
}

/**
 * Switches to a dataset that is relevant to the current insight if the dataset selected when opening the insight is not relevant.
 * @param datasetsFromInsight - datasets referenced by insight
 */
export function* ensureDominantDatasetSelected(datasetsFromInsight: IMetadataObject[]) {
    const { dataset: currentDatasetId }: ReturnType<typeof getRouteParams> = yield select(getRouteParams);
    const currentProduction = !currentDatasetId;

    if (!datasetsFromInsight?.length) {
        // if we do not know the dataset we need, just do nothing for now (this is for tiger which does not support the necessary calls)
        return;
    }

    const [productionDatasets, nonProductionDatasets] = partition(
        datasetsFromInsight,
        (dataset) => dataset.production,
    );

    const usesProductionData = productionDatasets.length > 0;

    const currentDatasetRelevant =
        // There is either a production dataset in the insight and we are currently on production...
        (currentProduction && usesProductionData) ||
        // ...or the non-production dataset we currently have is relevant for the insight.
        nonProductionDatasets.some((dataset) => dataset.id === currentDatasetId);

    const needsDatasetSwitch = !currentDatasetRelevant;

    // prioritize production dataset as the dominant catalog to show in the ui if the current dataset is not relevant
    const targetProduction = currentDatasetRelevant ? currentProduction : usesProductionData;
    // pick the first non-production dataset if the insight contains only non-production datasets
    const targetDatasetId = currentDatasetRelevant
        ? currentDatasetId
        : targetProduction
          ? ""
          : nonProductionDatasets[0].id;

    if (needsDatasetSwitch) {
        // change the dataset and wait for the new catalog load
        yield put(changeDataset(targetDatasetId));
        yield take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED);
    }
}

export function* getInsight(projectId: string, insightId: string, sideloadInsightItems: boolean = false) {
    const insightRef = getInsightRef(projectId, insightId);
    const loader = backend.workspace(projectId).insights();
    const loadPermissions: ReturnType<typeof enableVisualizationPermissions> = yield select(
        enableVisualizationPermissions,
    );
    const options = loadPermissions ? { loadPermissions: true } : {};

    if (sideloadInsightItems) {
        const { insight, catalogItems }: SagaReturnType<typeof loader.getInsightWithCatalogItems> =
            yield call([loader, loader.getInsightWithCatalogItems], insightRef, options);
        return { insight, catalogItems };
    }

    const insight: SagaReturnType<typeof loader.getInsight> = yield call(
        [loader, loader.getInsight],
        insightRef,
        options,
    );
    return { insight };
}

/**
 * An insight may be referencing objects, which are currently not in catalog; there are three reasons for this:
 *
 * 1. Insight uses objects from non-production data sets, and AD only has production catalog loaded (or the other way around)
 * 2. Insight uses metrics that are not visible in users catalog; this is the case of unlisted metrics owned by
 *    someone else.
 * 3. Include/Exclude tags configuration makes the particular item not available in the catalog.
 *
 * This function will first obtain data sets and metrics referenced by the insight. Then stores the metrics into
 * the state and then triggers logic to ensure relevant non-prod catalogs are refreshed.
 */
export function* updateCatalogWithExtras(extras: IInsightReferences = {}) {
    if (extras.catalogItems) {
        const cachedItems = OrganizedCatalogUtils.convertToItemCacheMap(extras.catalogItems);
        yield put(updateItemCache(cachedItems));
    }
}

/**
 * THE OPEN-REPORT OPERATION'S BOUNDARY. Reads the typed domain values the pure operation needs,
 * resolves the two foreign lookups (the visualization class and the date-dataset-meta URI resolver),
 * and answers the result the OPEN_REPORT_FINISHED event carries. The state it reads is the
 * PRE-dispatch state. A plain function over `state`, so the domain suites can drive the identical
 * boundary against a fixture.
 */
export function resolveOpenReportResult(
    state: IAppState,
    insight: IInsight,
    loadedItems: ILoadedReportItems,
    useDefaultClass: boolean,
) {
    // the class rule is the SERVICE's (table, else the first ENABLED class) — deliberately a
    // different rule than the reset carrier's default
    const visualizationClass = useDefaultClass
        ? (getDefaultVisualizationClass(state) ?? null)
        : (getVisualizationClassByUrl(state, insightVisualizationUrl(insight)) ?? null);

    return applyOpenReport(
        {
            itemCache: getItemCacheState(state),
            bucketsMeta: getBucketsMeta(state),
            filterBar: getFilterBarState(state),
            measuresDateDatasets: getMeasureDateDatasetsState(state),
            dateDatasets: getDateDatasetsState(state),
        },
        { insight, loadedItems, visualizationClass },
        {
            dateDatasetUriByIdentifier: (identifier: string) =>
                DateDatasetsMetaService.getDateDatasetUriByIdentifier(state, identifier),
            generateFilterLocalIdentifier: generateBucketItemIdentifier,
            keepFurtherMetricDateFilters: enableImprovedMetricDateFilter(state),
        },
    );
}

export function* buildOpenReportResult(
    insight: IInsight,
    loadedItems: ILoadedReportItems,
    useDefaultClass: boolean,
) {
    const state: IAppState = yield select();
    return resolveOpenReportResult(state, insight, loadedItems, useDefaultClass);
}

/**
 * An open failure resets the application, and the reset's two recomputed values ride ON the
 * failure action (store/app_context/application_reset_events.ts) — built here at the
 * dispatch boundary because the default class derives from `data.visualizationClasses`.
 */
export function* selectOpenReportFailureReset() {
    const visualizationClasses: ReturnType<typeof getVisualizationClassesState> = yield select(
        getVisualizationClassesState,
    );
    return buildApplicationResetCarrier(visualizationClasses);
}

function* showInvalidInsightLoadingErrorMessage() {
    // hide previous message if it was not dismissed yet
    yield put(hideMessage(openReportMessages.openReportError.id));
    // animate message hiding (if there was no message to hide, it will be just a tiny delay before
    // error is shown
    yield delay(500);
    // show a new message
    yield put(
        addMessage({
            type: "error",
            translationKey: openReportMessages.openReportError.id,
            errorDetails: {
                id: openReportMessages.openReportErrorDetails.id,
                values: {},
            },
        }),
    );
}

/**
 * Fails the open when the insight's date filters or additional date filters reference a granularity
 * that was disabled in the LDM since the save. Such a filter can be neither loaded nor applied, and
 * it is caught here, before anything sends the filters to the backend, so the failure can name
 * every missing item instead of surfacing as a backend error or a broken page.
 */
export function* failOnMissingDateFilterItems(insight: IInsight) {
    const dateDatasetsMeta: ReturnType<typeof getDateDatasetsMeta> = yield select(getDateDatasetsMeta);
    const missingItems = findMissingDateFilterItems(
        insight,
        dateDatasetsMeta,
        dateAttributeIdToSdkGranularity,
    );
    if (missingItems.length > 0) {
        throw new MissingInsightItemsError(missingItems);
    }
}

/**
 * Whether one of the insight's relative date filters has a granularity AD cannot load. All time is
 * supported: it is stored as the real All time filter (ALL_TIME_GRANULARITY) when it carries the empty
 * date values mode.
 */
export function hasDateFilterWithUnsupportedGranularity(insight: IInsight): boolean {
    return insight.insight.filters
        .filter(isRelativeDateFilter)
        .some(
            (filter) =>
                !isAllTimeDateFilter(filter) &&
                !isDateFilterGranularity(filter.relativeDateFilter.granularity),
        );
}

const missingItemsOf = (error: unknown): ReadonlyArray<IMissingDateFilterItem> | undefined =>
    isMissingInsightItemsError(error) ? error.missingItems : undefined;

export function* fetchReport(projectId: string, reportId: string) {
    try {
        yield put(openReportStarted(projectId, reportId));
        const startTime: ReturnType<typeof getStartTime> = yield call(getStartTime);
        // Ensure the catalog is loaded before opening an insight.
        // This prevents errors when opening an insight while the catalog is still loading
        // (e.g., when opening an empty Analytical Designer and then quickly opening an insight).
        // Without loaded catalog items, they might be missing in itemCache
        // and then the insight buckets cannot be properly mapped to their internal store representation.
        // (transformation in metadata.ts file throws error),
        // resulting in a "Sorry, we cannot find visualization" error.
        const hasCatalogItemsLoaded: ReturnType<typeof hasCatalogFirstLoaded> =
            yield select(hasCatalogFirstLoaded);
        if (!hasCatalogItemsLoaded) {
            yield take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED);
        }

        const {
            includeObjectsWithTags = [],
            excludeObjectsWithTags = [],
        }: ReturnType<typeof getTagsConfiguration> = yield select(getTagsConfiguration);

        const catalogSideloadEnabled: ReturnType<typeof enableAnalyticalDesignerCatalogSideload> =
            yield select(enableAnalyticalDesignerCatalogSideload);

        const sideloadInsightItems =
            catalogSideloadEnabled && !!(includeObjectsWithTags.length || excludeObjectsWithTags.length);
        const { insight, catalogItems }: SagaReturnType<typeof getInsight> = yield call(
            getInsight,
            projectId,
            reportId,
            sideloadInsightItems,
        );

        if (hasDateFilterWithUnsupportedGranularity(insight)) {
            const reset: IApplicationResetCarrier = yield call(selectOpenReportFailureReset);
            yield put(openReportFailed(reset, false, "incorrectMetadata"));
            // uses delay, must be called after previous call to not block it
            yield call(showInvalidInsightLoadingErrorMessage);
            return;
        }

        const [insightReferencing]: [IMetadataObject[], void] = yield all([
            call(getObjectsReferencing, projectId, insight),
            catalogItems
                ? call(updateCatalogWithExtras, {
                      catalogItems,
                  })
                : call(() => {}),
        ]);

        yield call(failOnMissingDateFilterItems, insight);

        const userDashboards: SagaReturnType<typeof fetchDashboards> = yield call(fetchDashboards, projectId);

        yield put(updateInsightUsageOnDashboards(insightReferencing, userDashboards));
        yield put(storeAppliedChartSort(insightSorts(insight)));

        const state: IAppState = yield select();
        const baseLoadedItems: SagaReturnType<typeof getItemCacheItems> = yield call(
            getItemCacheItems,
            insight,
            state,
        );
        const {
            filters: parameterFilters,
            warnings: parameterWarnings,
        }: SagaReturnType<typeof restoreInsightParameterFilters> = yield call(
            restoreInsightParameterFilters,
            insight,
        );
        const loadedItems: ILoadedReportItems = { ...baseLoadedItems, parameterFilters, parameterWarnings };

        const time: ReturnType<typeof getDuration> = yield call(getDuration, startTime);
        yield call(logVisualizationOpen, { state, time });
        const useDefaultClass: ReturnType<typeof isVisualizationClassDeletedOrDeprecated> = yield call(
            isVisualizationClassDeletedOrDeprecated,
            state,
            insightVisualizationUrl(insight),
        );
        const result: SagaReturnType<typeof buildOpenReportResult> = yield call(
            buildOpenReportResult,
            insight,
            loadedItems,
            useDefaultClass,
        );
        yield put(openReportFinished(insight, loadedItems, time, useDefaultClass, result));
    } catch (err) {
        logError("Error while opening insight", err);

        const reset: IApplicationResetCarrier = yield call(selectOpenReportFailureReset);
        yield put(openReportFailed(reset, false, undefined, missingItemsOf(err)));
    }
}

export function* fetchDashboards(projectId: string) {
    const loader = backend.workspace(projectId).dashboards();
    const dashboards: SagaReturnType<typeof loader.getDashboards> = yield call([
        loader,
        loader.getDashboards,
    ]);
    return dashboards || [];
}

export function* fetchDraftReport(projectId: string, reportId: string) {
    try {
        yield put(openReportStarted(projectId, reportId));

        // Wait for catalog load so parameter metadata is available when mapping
        // the draft's saved insight.parameters to filter bar state.
        const hasCatalogItemsLoaded: ReturnType<typeof hasCatalogFirstLoaded> =
            yield select(hasCatalogFirstLoaded);
        if (!hasCatalogItemsLoaded) {
            yield take(CatalogSagaActionTypeKeys.SAGA_CATALOG_LOAD_FINISHED);
        }

        const {
            includeObjectsWithTags = [],
            excludeObjectsWithTags = [],
        }: ReturnType<typeof getTagsConfiguration> = yield select(getTagsConfiguration);

        const catalogSideloadEnabled: ReturnType<typeof enableAnalyticalDesignerCatalogSideload> =
            yield select(enableAnalyticalDesignerCatalogSideload);

        const sideloadInsightItems =
            catalogSideloadEnabled && !!(includeObjectsWithTags.length || excludeObjectsWithTags.length);

        const { insight, catalogItems }: SagaReturnType<typeof getInsight> = yield call(
            getInsight,
            projectId,
            reportId,
            sideloadInsightItems,
        );

        if (catalogItems) {
            yield call(updateCatalogWithExtras, {
                catalogItems,
            });
        }

        yield call(failOnMissingDateFilterItems, insight);

        yield put(storeAppliedChartSort(insightSorts(insight)));

        const state: IAppState = yield select();
        const baseLoadedItems: SagaReturnType<typeof getItemCacheItems> = yield call(
            getItemCacheItems,
            insight,
            state,
        );
        const {
            filters: parameterFilters,
            warnings: parameterWarnings,
        }: SagaReturnType<typeof restoreInsightParameterFilters> = yield call(
            restoreInsightParameterFilters,
            insight,
        );
        const loadedItems: ILoadedReportItems = { ...baseLoadedItems, parameterFilters, parameterWarnings };

        const useDefaultClass: SagaReturnType<typeof isVisualizationClassDeletedOrDeprecated> = yield call(
            isVisualizationClassDeletedOrDeprecated,
            state,
            insightVisualizationUrl(insight),
        );

        const result: SagaReturnType<typeof buildOpenReportResult> = yield call(
            buildOpenReportResult,
            insight,
            loadedItems,
            useDefaultClass,
        );
        yield put(openReportFinished(insight, loadedItems, 0, useDefaultClass, result, true));
    } catch (err) {
        logError("Error while opening draft insight", err);
        const reset: IApplicationResetCarrier = yield call(selectOpenReportFailureReset);
        yield put(openReportFailed(reset, true, undefined, missingItemsOf(err)));
    }
}

export function* restoreInsightParameterFilters(insight: IInsight) {
    const noParameters: IParameterRestoreResult = { filters: [], warnings: [] };
    const overrides = insightParameters(insight);
    const parametersEnabled: boolean = yield select(enableParameters);
    const catalogLoaded: boolean = yield select(hasCatalogFirstLoaded);
    if (overrides.length === 0 || !parametersEnabled || !catalogLoaded) {
        return noParameters;
    }
    const stringParametersEnabled: boolean = yield select(enableStringParameters);
    const enabledOverrides = stringParametersEnabled
        ? overrides
        : overrides.filter((override) => typeof override.value !== "string");
    const catalogParameters: ReturnType<typeof getCatalogParameters> = yield select(getCatalogParameters);
    return restoreParameterFilters(enabledOverrides, catalogParameters);
}

export function* showOpenReportMessage({
    payload: { isDraft, useDefaultClass, loadedItems },
}: IOpenReportFinishedAction) {
    for (const { kind, name } of loadedItems.parameterWarnings) {
        const translationKey = parameterWarningMessages[kind].id;
        yield put(
            addMessage({
                id: `${translationKey}:${uuid()}`,
                type: "warning",
                translationKey,
                values: { name },
                durationInMs: PARAMETER_WARNING_DURATION_MS,
            }),
        );
    }
    if (!isDraft && useDefaultClass) {
        const state: IAppState = yield select();
        const visualizationClassType: ReturnType<typeof getVisualizationClassType> = yield call(
            getVisualizationClassType,
            getVisualizationClassState(state),
        );

        if (visualizationClassType === "table") {
            yield put(showWarningMessage(openReportMessages.defaultTable.id));
        } else {
            yield put(showWarningMessage(openReportMessages.defaultOther.id));
        }
    }
}

function* resetBucketNotifications() {
    yield put(resetRemovedItems());
}

export function* watchOpenReport() {
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_REQUESTED, openReportRequested);
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_STARTED, resetBucketNotifications);
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_FINISHED, showOpenReportMessage);
    yield takeEvery(ActionTypeKeys.OPEN_REPORT_FINISHED, resetBucketNotifications);
}
