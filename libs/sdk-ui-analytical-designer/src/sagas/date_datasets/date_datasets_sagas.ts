// (C) 2007-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put, select, take, takeEvery } from "redux-saga/effects";

import {
    type ICatalogDateAttributeHierarchy,
    type IDateHierarchyTemplate,
    type IInsightDefinition,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    insightAttributes,
    insightBuckets,
    insightMeasures,
    measureLocalId,
    objRefToString,
} from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import {
    removeBucketDerivedItems,
    setAllBucketsDateDataset,
    setBucketDateDataset,
    setBucketItemDateDataset,
    setBucketItemGranularity,
} from "../../actions/buckets_actions.js";
import {
    dateDatasetsUpdated,
    setDateDatasetsDropdownLoaded,
    setDateDatasetsMeta,
    setDateDatasetsUpdating,
} from "../../actions/data_actions.js";
import {
    MeasureDateDatasetsActions,
    type measureDateDatasetsRequested,
} from "../../actions/measure_date_datasets_actions.js";
import { backend } from "../../backend.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { ALL_TIME } from "../../constants/presets.js";
import { type Granularity } from "../../models/granularity.js";
import { supportsNonProductionDatasets } from "../../selectors/backend_capabilities_selector.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { getDateBucketItems } from "../../selectors/buckets_selector.js";
import {
    getInsightWithFilteredExpandedDate,
    getInsightWithoutDates,
} from "../../selectors/date_datasets_selector.js";
import { isPoPSetup } from "../../selectors/date_filter_selector.js";
import {
    enableSecondGranularities,
    enableUnavailableItemsVisibility,
} from "../../selectors/feature_flag_selector.js";
import { getInsightWithBucketsViaMd } from "../../selectors/insight_selectors.js";
import { getDatasetIdentifier, getTagsConfiguration } from "../../selectors/route_selector.js";
import {
    isSynchronizedDatesPreferred,
    visualizationAllowsMultipleDateDatasets,
} from "../../selectors/ui_config_selector.js";
import { getBucketIdentifierByItemId } from "../../services/buckets_service.js";
import { DateDatasetsMetaService } from "../../services/date_datasets_meta_service.js";
import { storeUpdateDateFilterDateDataset } from "../../store/bucket_filters/bucket_filters_actions.js";
import { dateFilterDateDatasetChanged } from "../../store/bucket_filters/bucket_filters_operation_events.js";
import { updateDateFilter } from "../../store/bucket_filters/bucket_filters_sagas.js";
import { bucketsDateDatasetChanged } from "../../store/buckets/buckets_operation_events.js";
import { setDateHierarchies } from "../../store/catalog/catalog_store_actions.js";
import { getDateFilters } from "../../store/filter_bar/filter_bar_selector.js";
import { type IDateFilterConfig } from "../../store/filter_bar/filter_bar_types.js";
import { getMeasureDateDatasetStatus } from "../../store/measure_date_datasets/measure_date_datasets_selectors.js";
import { type IRawBucketItems } from "../../typings/buckets.js";
import { type IDateDatasets } from "../../typings/datasets.js";
import { type ILoadDateDatasetsOptions, loadCachedDateDatasets, loadDateDatasets } from "../../utils/api.js";
import { DateDatasetsMetaUtils } from "../../utils/date_datasets_meta.js";
import { logError } from "../../utils/logging/error_logging.js";
import { updateSelectedDataset } from "../datasets_sagas.js";

import {
    type IChangeBucketItemDateDatasetAction,
    type IChangeBucketItemDateDatasetGranularityAction,
    type ILoadDateDatasetsToDateDropdown,
    type IUpdateDateFilterAction,
} from "./date_datasets_actions.js";

export function* updateDateDataSets(
    projectId: string,
    activeDatasetId: string,
    insight?: IInsightDefinition,
) {
    const tagsConfiguration: ReturnType<typeof getTagsConfiguration> = yield select(getTagsConfiguration);
    const options: ILoadDateDatasetsOptions = {
        insight,
        dataSetIdentifier: activeDatasetId && idRef(activeDatasetId),
        production: !activeDatasetId,
        ...tagsConfiguration,
    };
    const datasetChanged: ReturnType<typeof updateSelectedDataset> = yield call(updateSelectedDataset);

    yield put(setDateDatasetsUpdating(true));

    if (insight && insightBuckets(insight).length && !datasetChanged) {
        const dateDataSets: SagaReturnType<typeof loadCachedDateDatasets> = yield call(
            loadCachedDateDatasets,
            projectId,
            options,
        );
        yield put(dateDatasetsUpdated(dateDataSets));
        yield call(loadDateHierarchies, dateDataSets);
    } else {
        const dateDataSets: SagaReturnType<typeof loadDateDatasets> = yield call(
            loadDateDatasets,
            projectId,
            options,
        );
        yield put(dateDatasetsUpdated(dateDataSets));
        yield call(loadDateHierarchies, dateDataSets);
    }
}

export function* loadDateHierarchies(dateDatasets: IDateDatasets) {
    const workspace: ReturnType<typeof getProjectId> = yield select(getProjectId);
    const secondGranularitiesEnabled: ReturnType<typeof enableSecondGranularities> =
        yield select(enableSecondGranularities);
    const dateHierarchyTemplates: IDateHierarchyTemplate[] = yield call(fetchDateHierarchies, workspace);
    const dateHierarchies: ICatalogDateAttributeHierarchy[] = dateDatasets.allItems.flatMap((dataSet) => {
        return dateHierarchyTemplates.map((template) => {
            const allowedGranularities = secondGranularitiesEnabled
                ? template.granularities
                : template.granularities.filter((granularity) => granularity !== "GDC.time.second");
            return {
                type: "dateAttributeHierarchy",
                // create ref of adhoc date hierarchy by combining date dataset id and date template id
                // this ref should not be stored on MD server as it is not existing MD object
                ref: idRef(`${template.id}/${objRefToString(dataSet.ref)}`, "dateAttributeHierarchy"),
                dateDatasetRef: dataSet.ref,
                templateId: template.id,
                title: dataSet.title,
                attributes: allowedGranularities
                    .map((granularity: string) => {
                        return dataSet.attributes.find((attribute) => attribute.dateType === granularity)
                            ?.ref;
                    })
                    .filter((attribute) => !!attribute),
            };
        });
    });
    yield put(setDateHierarchies(dateHierarchies));
}

async function fetchDateHierarchies(workspace: string) {
    if (!backend.capabilities.supportsAttributeHierarchies) {
        return Promise.resolve([]);
    }
    return backend.workspace(workspace).attributeHierarchies().getDateHierarchyTemplates();
}

function* loadMeasureDateDatasets(
    action: ReturnType<typeof measureDateDatasetsRequested>,
): SagaIterator<void> {
    const { localIdentifier } = action.payload;

    const measureDateDatasetStatus: ReturnType<typeof getMeasureDateDatasetStatus> = yield select(
        getMeasureDateDatasetStatus,
        localIdentifier,
    );

    if (!measureDateDatasetStatus.isLoading) {
        yield put(MeasureDateDatasetsActions.measureDateDatasetsStarted(localIdentifier));

        const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
        const insight: ReturnType<typeof getInsightWithBucketsViaMd> =
            yield select(getInsightWithBucketsViaMd);
        const activeDatasetId: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);
        const tagsConfiguration: ReturnType<typeof getTagsConfiguration> = yield select(getTagsConfiguration);

        try {
            /*
             * All attributes that are in the insight + the selected measure need to go down to the catalog
             * service as bucket items. This is essential because attributes must be known for some measures such
             * as compute ratio measures. These calculate contribution of slice to the sum - the slices are done
             * for elements of an attribute.
             */
            const attributes = insightAttributes(insight);
            const selectedMeasure = insightMeasures(insight).find(
                (measure) => measureLocalId(measure) === localIdentifier,
            );

            const dateDatasets: SagaReturnType<typeof loadDateDatasets> = yield call(
                loadDateDatasets,
                projectId,
                {
                    items: selectedMeasure && [selectedMeasure, ...attributes],
                    dataSetIdentifier: activeDatasetId && idRef(activeDatasetId),
                    production: !activeDatasetId,
                    ...tagsConfiguration,
                },
            );
            const shouldUnavailableItemsVisibility: ReturnType<typeof enableUnavailableItemsVisibility> =
                yield select(enableUnavailableItemsVisibility);

            yield put(
                MeasureDateDatasetsActions.measureDateDatasetsFinished(
                    localIdentifier,
                    shouldUnavailableItemsVisibility ? dateDatasets.allItems : dateDatasets.available,
                    dateDatasets.unavailable,
                ),
            );
        } catch (error) {
            logError("Error while loading measure date datasets", error);

            yield put(MeasureDateDatasetsActions.measureDateDatasetsError(localIdentifier, error as Error));
        }
    }
}

/**
 * Loads the date datasets META: every date dataset with the attributes it currently has. The
 * bootstrap saga calls it alongside the catalog load, BEFORE any insight is opened, because the
 * open relies on it (measure date datasets, additional date filter sanitization). A failure is
 * logged and leaves the meta empty rather than failing the bootstrap.
 */
export function* initializeDateDatasetsMeta(): SagaIterator<void> {
    try {
        const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);

        let dateDatasets: SagaReturnType<typeof loadDateDatasets>;

        const nonProductionDatasetsAllowed = yield select(supportsNonProductionDatasets);
        if (nonProductionDatasetsAllowed) {
            dateDatasets = yield call(loadDateDatasets, projectId);
        } else {
            dateDatasets = yield call(loadDateDatasets, projectId, { production: true });
        }

        const dateDatasetsMeta = DateDatasetsMetaUtils.collectMeta(dateDatasets);
        yield put(setDateDatasetsMeta(dateDatasetsMeta));
    } catch (error) {
        logError("Error while loading date datasets meta", error);
    }
}

function* syncFilterItemDateDataset({ payload }: IUpdateDateFilterAction): SagaIterator<void> {
    // do all logic around date filter

    yield call(updateDateFilter, payload);
}

export function* handleBucketDerivedItemsWithDateFilter() {
    const popIsSetup: ReturnType<typeof isPoPSetup> = yield select(isPoPSetup);
    if (!popIsSetup) {
        yield put(removeBucketDerivedItems());
    }
}

export function* isGranularitySupportedByDataset(
    granularity: Granularity,
    dateDatasetRef: ObjRef,
): SagaIterator<boolean> {
    const datasetMetaItems: ReturnType<typeof DateDatasetsMetaService.getDateDatasetsMetaItems> =
        yield select(DateDatasetsMetaService.getDateDatasetsMetaItems);
    return datasetMetaItems
        .find((item) => areObjRefsEqual(item.ref, dateDatasetRef))
        .attributes.some((attribute) => attribute.dateType === granularity);
}

function* synchronizeDateFilterDateDataset(dateDatasetRef: ObjRef, initialBucketItems: IRawBucketItems) {
    const dateFilters: ReturnType<typeof getDateFilters> = yield select(getDateFilters);
    if (dateFilters.length !== 1) {
        return;
    }
    const dateFilter = dateFilters[0];

    const dateBucketItems: ReturnType<typeof getDateBucketItems> = yield select(getDateBucketItems);

    const isBucketAndFilterEqual =
        initialBucketItems.length === 1 &&
        areObjRefsEqual(initialBucketItems[0].dateDatasetRef, dateFilter.dateDatasetRef);

    if (dateBucketItems.length === 1 && isBucketAndFilterEqual) {
        const granularitySupportedByDataset: SagaReturnType<typeof isGranularitySupportedByDataset> =
            yield call(isGranularitySupportedByDataset, dateFilter.filterConfig.granularity, dateDatasetRef);
        const { localIdentifier } = dateFilter;
        if (granularitySupportedByDataset) {
            yield put(storeUpdateDateFilterDateDataset(localIdentifier, dateDatasetRef));
        } else {
            const allTimeFilterConfig: IDateFilterConfig = {
                name: ALL_TIME,
                interval: undefined,
                granularity: undefined,
            };
            yield put(
                storeUpdateDateFilterDateDataset(
                    localIdentifier,
                    dateDatasetRef,
                    allTimeFilterConfig,
                    OverTimeComparisonTypes.NOTHING,
                ),
            );
        }
        // WAIT FOR THE WRITE — the same shape as the `bucketsDateDatasetChanged` take below (a
        // put-trigger-then-select finding): the trigger writes nothing, the operation
        // commits with `dateFilterDateDatasetChanged` in a LATER dispatch, and the caller's
        // follow-up (`handleBucketDerivedItemsWithDateFilter` → `isPoPSetup`) reads the FILTER's
        // dateDatasetRef. The operation fires the event even when it changes nothing, so this
        // cannot hang on a no-op.
        yield take(dateFilterDateDatasetChanged.type);
    }
}

function* syncBucketItemsDateDataset(action: IChangeBucketItemDateDatasetAction): SagaIterator<void> {
    const visualizationAllowsMultipleDates: ReturnType<typeof visualizationAllowsMultipleDateDatasets> =
        yield select(visualizationAllowsMultipleDateDatasets);
    const { dateDatasetRef, bucketItemLocalIdentifier } = action.payload;
    const initialBucketItems: ReturnType<typeof getDateBucketItems> = yield select(getDateBucketItems);
    const itemBucketIdentifier: ReturnType<typeof getBucketIdentifierByItemId> = yield select(
        getBucketIdentifierByItemId,
        bucketItemLocalIdentifier,
    );
    const itemBucketPrefersDateSyncing: ReturnType<typeof isSynchronizedDatesPreferred> = yield select(
        isSynchronizedDatesPreferred,
        itemBucketIdentifier,
    );

    if (itemBucketPrefersDateSyncing) {
        // set new dateDataset only to items in the bucket in which the item is located
        yield put(setBucketDateDataset(dateDatasetRef, bucketItemLocalIdentifier, itemBucketIdentifier));
    } else if (visualizationAllowsMultipleDates) {
        // set new dateDataset only to the modified item
        yield put(setBucketItemDateDataset(dateDatasetRef, bucketItemLocalIdentifier));
    } else {
        // set new dateDataset to all date items
        yield put(setAllBucketsDateDataset(dateDatasetRef));
    }

    // WAIT FOR THE WRITE. All three triggers above are buckets OPERATIONS: the trigger
    // itself writes nothing and `buckets_operations_saga.ts` commits the new date dataset with
    // `bucketsDateDatasetChanged` in a LATER dispatch. Until that event lands, `data.buckets` still
    // carries the old dateDatasetRef — and both follow-ups below read it (`getDateBucketItems`, and
    // `isPoPSetup` through `handleBucketDerivedItemsWithDateFilter`). Reading before the commit made
    // `isPoPSetup` answer against the pre-change dimension, so a mismatching filter never purged its
    // derived measures ("Should remove derived items when date dimensions are not same in buckets
    // and in filter").
    yield take(bucketsDateDatasetChanged.type);

    yield call(synchronizeDateFilterDateDataset, dateDatasetRef, initialBucketItems);
    yield call(handleBucketDerivedItemsWithDateFilter);
}

function* updateBucketItemGranularity({
    payload: { localIdentifier, value },
}: IChangeBucketItemDateDatasetGranularityAction) {
    yield put(setBucketItemGranularity(localIdentifier, value));
}

export function* loadDateDatasetsWithAllDates() {
    try {
        const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
        const activeDatasetId: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);
        const reducedInsight: ReturnType<typeof getInsightWithoutDates> =
            yield select(getInsightWithoutDates);
        yield call(updateDateDataSets, projectId, activeDatasetId, reducedInsight);
    } catch (error) {
        logError("Error while loading date datasets", error);
    }
}

export function* loadDateDatasetsWithReducedDates({
    payload: { ignoreDateDataset },
}: ILoadDateDatasetsToDateDropdown) {
    try {
        const projectId: ReturnType<typeof getProjectId> = yield select(getProjectId);
        const activeDatasetId: ReturnType<typeof getDatasetIdentifier> = yield select(getDatasetIdentifier);

        if (ignoreDateDataset) {
            const reducedInsight: ReturnType<typeof getInsightWithoutDates> =
                yield select(getInsightWithoutDates);
            yield call(updateDateDataSets, projectId, activeDatasetId, reducedInsight);
        } else {
            const reducedInsight: ReturnType<typeof getInsightWithFilteredExpandedDate> = yield select(
                getInsightWithFilteredExpandedDate,
            );
            yield call(updateDateDataSets, projectId, activeDatasetId, reducedInsight);
        }
    } catch (error) {
        logError("Error while loading date datasets", error);
    }
}

export function* loadDateDatasetsDropdown(action: ILoadDateDatasetsToDateDropdown): SagaIterator<void> {
    yield put(setDateDatasetsDropdownLoaded(false));

    yield call(loadDateDatasetsWithReducedDates, action);

    yield put(setDateDatasetsDropdownLoaded(true));
}

export function* watchDateDatasets() {
    // the date datasets meta is not loaded from here: the bootstrap saga calls
    // initializeDateDatasetsMeta itself, so the meta is in place before the first open
    yield all([
        takeEvery(ActionTypeKeys.MEASURE_DATE_DATASETS_REQUESTED, loadMeasureDateDatasets),
        takeEvery(ActionTypeKeys.UI_UPDATE_DATE_FILTER, syncFilterItemDateDataset),
        takeEvery(ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET, syncBucketItemsDateDataset),
        takeEvery(ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_GRANULARITY, updateBucketItemGranularity),
        takeEvery(ActionTypeKeys.UI_LOAD_DATE_DATASETS_TO_DATE_DROPDOWN, loadDateDatasetsDropdown),
    ]);
}
