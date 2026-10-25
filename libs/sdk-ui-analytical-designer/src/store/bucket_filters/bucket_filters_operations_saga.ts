// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import {
    selectDateDataset,
    selectDateDatasetWithoutTimeTravel,
} from "../../actions/measure_date_datasets_actions.js";
import { generateBucketItemIdentifier } from "../../models/bucket_item_identifier.js";
import { getDateDatasetRefsWithGranularities } from "../../selectors/date_dataset_with_granularities_selector.js";
import { getItemCache } from "../../selectors/item_cache_selector.js";
import { logError } from "../../utils/logging/error_logging.js";
import {
    buildReferencePointSyncDeps,
    buildRemovalDeps,
    readBucketsMeta,
    readIsVisualizationMdObjectValid,
    readPluggableVisualization,
    readRemoveBucketItemsInput,
} from "../buckets/buckets_operation_inputs.js";
import { getBucketsState } from "../buckets/buckets_selectors.js";
import {
    getDateDatasetUriByIdentifier,
    getDateDatasetsMetaItems,
} from "../date_datasets_meta/date_datasets_meta_selectors.js";
import { flattenDateDatasetAttributes } from "../filter_bar/filter_bar_helpers.js";
import { getFilterBarState } from "../filter_bar/filter_bar_selector.js";
import { getReferencePoint } from "../reference_point/reference_point_selectors.js";
import { type IAppState } from "../types.js";

import {
    type ICommandUpdateFilterItemsAction,
    type IStoreSetBucketItemAddMetricFilterAction,
    type IStoreSetBucketItemAddMetricFiltersAction,
    type IStoreSetBucketItemApplyMetricDateFilterAction,
    type IStoreSetBucketItemRemoveMetricFilterAction,
    type IStoreSetBucketItemUpdateMetricFilterAction,
    type IStoreUpdateAttributeFilterAction,
    type IStoreUpdateDateFilterAction,
    type IStoreUpdateDateFilterDateDatasetAction,
    type IStoreUpdateMeasureValueFilterAction,
    type IStoreUpdateRankingFilterAction,
    commandAddOrUpdateFilterItems,
    storeSetBucketItemAddMetricFilter,
    storeSetBucketItemAddMetricFilters,
    storeSetBucketItemApplyMetricDateFilter,
    storeSetBucketItemRemoveMetricFilter,
    storeSetBucketItemUpdateMetricFilter,
    storeUpdateAttributeFilter,
    storeUpdateDateFilter,
    storeUpdateDateFilterDateDataset,
    storeUpdateMeasureValueFilter,
    storeUpdateRankingFilter,
} from "./bucket_filters_actions.js";
import {
    attributeFilterUpdated,
    dateFilterDateDatasetChanged,
    dateFilterUpdated,
    filterItemsCommandFailed,
    filterItemsUpdatedFromCommand,
    measureDateFilterApplied,
    measureDateFilterDateDatasetSelected,
    measureFilterAdded,
    measureFilterRemoved,
    measureFilterUpdated,
    measureValueFilterUpdated,
    rankingFilterUpdated,
} from "./bucket_filters_operation_events.js";
import {
    type IAttributeFilterUpdateInput,
    type ICommandFilterItemsUpdateDeps,
    type ICommandFilterItemsUpdateInput,
    type IDateFilterDateDatasetChangeDeps,
    type IDateFilterDateDatasetChangeInput,
    type IDateFilterUpdateDeps,
    type IDateFilterUpdateInput,
    type IFilterStoreInput,
    type IMetricDateFilterApplyInput,
    type IMetricDateFilterDeps,
    type IMetricFilterAddInput,
    type IMetricFilterRemoveInput,
    type IMetricFilterUpdateInput,
    applyAttributeFilterUpdate,
    applyCommandFilterItemsUpdate,
    applyDateFilterDateDatasetChange,
    applyDateFilterUpdate,
    applyFilterStore,
    applyMetricDateFilterChange,
    applyMetricDateFilterDateDatasetSelection,
    applyMetricFilterAdd,
    applyMetricFilterRemove,
    applyMetricFilterUpdate,
    applyMetricFiltersAdd,
} from "./bucket_filters_operations.js";

/**
 * THE BUCKET-FILTERS OPERATION SAGA, in the `buckets_operations_saga.ts` shape: select the typed
 * input, select the deps, call the pure operation, put ONE semantic event. The trigger writes
 * nothing; `takeEvery`, because every dispatch applies.
 *
 * Three operations can answer `undefined` — an attribute-filter update (alone or inside the embedded
 * command) addressing a filter that does not exist, and a metric-filter operation addressing a
 * bucket item that is in no bucket. Those commit NOTHING.
 * `dateFilterDateDatasetChanged` on the other hand ALWAYS fires, no-op or not, because
 * `sagas/date_datasets` waits on it with a `take` before reading the filter it asked to change.
 */

// --- the shared reads and deps ----------------------------------------------------------------------

/**
 * The over-time-comparison-shaped input the three removal-chain-capable operations read.
 * Exported for the operation tests that pin the derived-measure consequence against real state.
 */
export const readBucketFiltersDerivedChainInput = (state: IAppState) => ({
    ...readRemoveBucketItemsInput(state),
    pluggableVisualization: readPluggableVisualization(state),
    isVisualizationMdObjectValid: readIsVisualizationMdObjectValid(state),
});

const readFilterBarSyncInput = (state: IAppState): IFilterStoreInput & IAttributeFilterUpdateInput => ({
    buckets: getBucketsState(state),
    bucketsMeta: readBucketsMeta(state),
    filterBar: getFilterBarState(state),
    referencePoint: getReferencePoint(state),
});

/** The removal + sync deps those operations take. Exported for the same tests. */
export const buildBucketFiltersDerivedChainDeps = (state: IAppState) => ({
    ...buildRemovalDeps(state),
    ...buildReferencePointSyncDeps(state),
});

/**
 * The date-dataset attributes come from the date-datasets META items — the same source the
 * `getAdditionalDateAttributeFilters` selector uses, and deliberately NOT the granularity list the
 * dataset-change operation resolves below. Two domains answer "which filters are additional date
 * filters", and only the explicit argument makes that visible.
 */
const buildDateFilterUpdateDeps = (state: IAppState): IDateFilterUpdateDeps => ({
    ...buildBucketFiltersDerivedChainDeps(state),
    dateDatasetAttributes: flattenDateDatasetAttributes(getDateDatasetsMetaItems(state)),
});

// --- the handlers ------------------------------------------------------------------------------------

function* handleUpdateAttributeFilter({ payload }: IStoreUpdateAttributeFilterAction): SagaIterator {
    const input: ReturnType<typeof readFilterBarSyncInput> = yield select(readFilterBarSyncInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    const result = applyAttributeFilterUpdate(input, payload, deps);
    if (result) {
        yield put(attributeFilterUpdated(result));
    }
}

function* handleUpdateDateFilter({ payload }: IStoreUpdateDateFilterAction): SagaIterator {
    const input: IDateFilterUpdateInput = yield select(readBucketFiltersDerivedChainInput);
    const deps: ReturnType<typeof buildDateFilterUpdateDeps> = yield select(buildDateFilterUpdateDeps);

    yield put(dateFilterUpdated(applyDateFilterUpdate(input, payload, deps)));
}

const readDateFilterDateDatasetChangeInput = (state: IAppState): IDateFilterDateDatasetChangeInput => ({
    ...readFilterBarSyncInput(state),
    isVisualizationMdObjectValid: readIsVisualizationMdObjectValid(state),
});

const buildDateFilterDateDatasetChangeDeps = (state: IAppState): IDateFilterDateDatasetChangeDeps => ({
    ...buildReferencePointSyncDeps(state),
    dateDatasetsWithGranularities: getDateDatasetRefsWithGranularities(state),
});

function* handleUpdateDateFilterDateDataset({
    payload,
}: IStoreUpdateDateFilterDateDatasetAction): SagaIterator {
    const input: ReturnType<typeof readDateFilterDateDatasetChangeInput> = yield select(
        readDateFilterDateDatasetChangeInput,
    );
    const deps: ReturnType<typeof buildDateFilterDateDatasetChangeDeps> = yield select(
        buildDateFilterDateDatasetChangeDeps,
    );

    // ALWAYS put — sagas/date_datasets takes this event before reading the filter (see the module note)
    yield put(dateFilterDateDatasetChanged(applyDateFilterDateDatasetChange(input, payload, deps)));
}

function* handleCommandAddOrUpdateFilterItems({ payload }: ICommandUpdateFilterItemsAction): SagaIterator {
    const input: ICommandFilterItemsUpdateInput = yield select(readBucketFiltersDerivedChainInput);
    const dateFilterDeps: ReturnType<typeof buildDateFilterUpdateDeps> =
        yield select(buildDateFilterUpdateDeps);
    const deps: ICommandFilterItemsUpdateDeps = {
        ...dateFilterDeps,
        generateFilterLocalIdentifier: generateBucketItemIdentifier,
    };

    let result: ReturnType<typeof applyCommandFilterItemsUpdate>;
    try {
        result = yield call(applyCommandFilterItemsUpdate, input, payload, deps);
    } catch (error) {
        // `control_filtering_saga` BLOCKS on this operation's event, so an unexpected throw here
        // must not just kill this worker — it would wedge the embed command flow forever with no
        // reply to the host. Carrying the error as a SIGNAL instead (raced against the event over
        // there) produces the error reply and keeps this watcher alive for the commands that follow.
        logError("Bucket-filters command operation failed", error);
        yield put(filterItemsCommandFailed({ error }));
        return;
    }

    yield put(filterItemsUpdatedFromCommand(result));
}

function* handleUpdateMeasureValueFilter({
    payload: { filter },
}: IStoreUpdateMeasureValueFilterAction): SagaIterator {
    const input: ReturnType<typeof readFilterBarSyncInput> = yield select(readFilterBarSyncInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    yield put(measureValueFilterUpdated(applyFilterStore(input, filter, deps)));
}

function* handleUpdateRankingFilter({ payload: { filter } }: IStoreUpdateRankingFilterAction): SagaIterator {
    const input: ReturnType<typeof readFilterBarSyncInput> = yield select(readFilterBarSyncInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    yield put(rankingFilterUpdated(applyFilterStore(input, filter, deps)));
}

const readMetricFilterAddInput = (state: IAppState): IMetricFilterAddInput => ({
    ...readFilterBarSyncInput(state),
    itemCache: getItemCache(state),
    measuresDateDatasets: state.data.measuresDateDatasets,
});

function* handleSetBucketItemAddMetricFilter({
    payload,
}: IStoreSetBucketItemAddMetricFilterAction): SagaIterator {
    const input: ReturnType<typeof readMetricFilterAddInput> = yield select(readMetricFilterAddInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    const result = applyMetricFilterAdd(
        input,
        // the fresh-identifier impurity stays at the boundary
        { ...payload, newFilterLocalIdentifier: generateBucketItemIdentifier() },
        deps,
    );
    if (result) {
        yield put(measureFilterAdded(result));
    }
}

function* handleSetBucketItemAddMetricFilters({
    payload,
}: IStoreSetBucketItemAddMetricFiltersAction): SagaIterator {
    const input: ReturnType<typeof readMetricFilterAddInput> = yield select(readMetricFilterAddInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    const result = applyMetricFiltersAdd(
        input,
        {
            ...payload,
            newFilterLocalIdentifiers: payload.attributes.map(() => generateBucketItemIdentifier()),
        },
        deps,
    );
    if (result) {
        yield put(measureFilterAdded(result));
    }
}

const readMetricFilterRemoveInput = (state: IAppState): IMetricFilterRemoveInput => ({
    ...readFilterBarSyncInput(state),
    measuresDateDatasets: state.data.measuresDateDatasets,
});

// the same meta-items source the filter bar's additional date filters are decided against
const buildMetricDateFilterDeps = (state: IAppState): IMetricDateFilterDeps => ({
    ...buildReferencePointSyncDeps(state),
    dateDatasetAttributes: flattenDateDatasetAttributes(getDateDatasetsMetaItems(state)),
    generateFilterLocalIdentifier: generateBucketItemIdentifier,
    dateDatasetUriByIdentifier: (identifier) => getDateDatasetUriByIdentifier(state, identifier),
});

function* handleSetBucketItemRemoveMetricFilter({
    payload,
}: IStoreSetBucketItemRemoveMetricFilterAction): SagaIterator {
    const input: ReturnType<typeof readMetricFilterRemoveInput> = yield select(readMetricFilterRemoveInput);
    const deps: ReturnType<typeof buildMetricDateFilterDeps> = yield select(buildMetricDateFilterDeps);

    const result = applyMetricFilterRemove(input, payload, deps);
    if (result) {
        yield put(measureFilterRemoved(result));
    }
}

const readMetricDateFilterApplyInput = (state: IAppState): IMetricDateFilterApplyInput => ({
    ...readFilterBarSyncInput(state),
    measuresDateDatasets: state.data.measuresDateDatasets,
});

function* handleSetBucketItemApplyMetricDateFilter({
    payload,
}: IStoreSetBucketItemApplyMetricDateFilterAction): SagaIterator {
    const input: ReturnType<typeof readMetricDateFilterApplyInput> = yield select(
        readMetricDateFilterApplyInput,
    );
    const deps: ReturnType<typeof buildMetricDateFilterDeps> = yield select(buildMetricDateFilterDeps);

    const result = applyMetricDateFilterChange(input, payload, deps);
    if (result) {
        yield put(measureDateFilterApplied(result));
    }
}

function* handleSetBucketItemUpdateMetricFilter({
    payload,
}: IStoreSetBucketItemUpdateMetricFilterAction): SagaIterator {
    const input: IMetricFilterUpdateInput = yield select(readBucketFiltersDerivedChainInput);
    const deps: ReturnType<typeof buildBucketFiltersDerivedChainDeps> = yield select(
        buildBucketFiltersDerivedChainDeps,
    );

    const result = applyMetricFilterUpdate(input, payload, deps);
    if (result) {
        yield put(measureFilterUpdated(result));
    }
}

function* handleMetricDateDatasetSelected({
    payload,
}:
    | ReturnType<typeof selectDateDataset>
    | ReturnType<typeof selectDateDatasetWithoutTimeTravel>): SagaIterator {
    const input: ReturnType<typeof readFilterBarSyncInput> = yield select(readFilterBarSyncInput);
    const deps: ReturnType<typeof buildReferencePointSyncDeps> = yield select(buildReferencePointSyncDeps);

    const result = applyMetricDateFilterDateDatasetSelection(
        input,
        {
            measureLocalIdentifier: payload.localIdentifier,
            dateDatasetIdentifier: payload.dateDatasetIdentifier,
        },
        deps,
    );
    if (result) {
        yield put(measureDateFilterDateDatasetSelected(result));
    }
}

export function* watchBucketFilterOperations(): SagaIterator {
    yield takeEvery(storeUpdateAttributeFilter.type, handleUpdateAttributeFilter);
    yield takeEvery(storeUpdateDateFilter.type, handleUpdateDateFilter);
    yield takeEvery(storeUpdateDateFilterDateDataset.type, handleUpdateDateFilterDateDataset);
    yield takeEvery(commandAddOrUpdateFilterItems.type, handleCommandAddOrUpdateFilterItems);
    yield takeEvery(storeUpdateMeasureValueFilter.type, handleUpdateMeasureValueFilter);
    yield takeEvery(storeUpdateRankingFilter.type, handleUpdateRankingFilter);
    yield takeEvery(storeSetBucketItemAddMetricFilter.type, handleSetBucketItemAddMetricFilter);
    yield takeEvery(storeSetBucketItemAddMetricFilters.type, handleSetBucketItemAddMetricFilters);
    yield takeEvery(storeSetBucketItemRemoveMetricFilter.type, handleSetBucketItemRemoveMetricFilter);
    yield takeEvery(storeSetBucketItemUpdateMetricFilter.type, handleSetBucketItemUpdateMetricFilter);
    yield takeEvery(storeSetBucketItemApplyMetricDateFilter.type, handleSetBucketItemApplyMetricDateFilter);
    yield takeEvery(selectDateDataset.type, handleMetricDateDatasetSelected);
    yield takeEvery(selectDateDatasetWithoutTimeTravel.type, handleMetricDateDatasetSelected);
}
