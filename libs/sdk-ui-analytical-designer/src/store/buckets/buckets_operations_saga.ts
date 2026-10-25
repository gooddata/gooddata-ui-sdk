// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import {
    type IRemoveBucketItemsByLocalIdsAction,
    type ISelectVisualizationTypeAction,
    type ISetAllBucketsDateDatasetAction,
    type ISetBucketDateDatasetAction,
    type ISetBucketItemAggregationAction,
    type ISetBucketItemDateDatasetAction,
    type ISetBucketItemDisplayFormAction,
    type ISetBucketItemGranularityAction,
    type ISetBucketItemShowOnSecondaryAxisAction,
    type IStoreSetBucketItemIsThresholdMeasureAction,
    type IStoreSetBucketItemIsTotalMeasureAction,
    type IStoreSetBucketItemShowInPercentAction,
    changeMeasureChartType,
    setBucketItemAggregation,
    setBucketItemFormat,
    setBucketItemShowOnSecondaryAxis,
    setBucketItemTitle,
    storeBucketItemEnableThresholdMeasure,
    storeBucketItemShowAllValues,
    storeSetBucketItemIsTotalMeasure,
} from "../../actions/buckets_actions.js";
import {
    type IDropCatalogItemAction,
    type IRemoveBucketItemAction,
    type IReorderBucketItemAction,
    type IReplaceBucketItemAction,
    type ISwapBucketItemAction,
} from "../../actions/dnd_actions.js";
import { type IToggleDualAxisAction, toggleDualAxis } from "../../actions/properties_actions.js";
import {
    type IExtendedReferencePointChangedAction,
    type INewDerivedBucketItemsPlacedAction,
} from "../../actions/report_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { FilterBarActionTypeKeys, type IFiltersWereChangedAction } from "../filter_bar/filter_bar_actions.js";

import { addBucketItemFromCatalog } from "./buckets_add_operation.js";
import {
    type BucketItemEdit,
    changeBucketsDateDataset,
    editBucketItem,
    selectVisualizationType,
    toggleBucketsDualAxis,
} from "./buckets_edit_operations.js";
import { applyFilterRemoval } from "./buckets_filter_removal_operation.js";
import {
    type IRemoveBucketItemsOperationParams,
    removeBucketItemsOperation,
    reorderBucketItem,
    replaceBucketItemWithCatalogItem,
    swapBucketItems,
} from "./buckets_move_operations.js";
import {
    bucketItemAdded,
    bucketItemEdited,
    bucketItemReordered,
    bucketItemReplaced,
    bucketItemsRemoved,
    bucketItemsSwapped,
    bucketsDateDatasetChanged,
    derivedBucketItemsPlaced,
    dualAxisToggled,
    extendedReferencePointApplied,
    filterRemovalApplied,
    visualizationTypeSelected,
} from "./buckets_operation_events.js";
import {
    buildAddBucketItemDeps,
    buildBucketItemEditDeps,
    buildBucketsDateDatasetChangeDeps,
    buildExtendedReferencePointAppliedDeps,
    buildFilterRemovalDeps,
    buildRemoveBucketItemsDeps,
    buildReorderBucketItemDeps,
    buildReplaceBucketItemDeps,
    buildSwapBucketItemDeps,
    readAddBucketItemInput,
    readBucketItemEditInput,
    readDerivedBucketItemsPlacedInput,
    readDualAxisToggleInput,
    readExtendedReferencePointAppliedInput,
    readFilterRemovalInput,
    readReferencePointSyncValues,
    readRemoveBucketItemsInput,
    readSwapBucketItemInput,
} from "./buckets_operation_inputs.js";
import { getDerivedBucketItemsInBuckets } from "./buckets_read_helpers.js";
import { getBucketsState } from "./buckets_selectors.js";
import {
    applyExtendedReferencePoint,
    applyPlacedDerivedBucketItems,
} from "./extended_reference_point_operations.js";

/**
 * THE BUCKETS OPERATION SAGAS.
 *
 * Every handler has the SAME four-step shape, and it is verbose on purpose:
 *
 *     select the typed domain values it needs
 *     select / call the foreign facts as a deps object
 *     call the narrow pure operation
 *     put ONE semantic event
 *
 * FOUR RULES the handlers follow, each of them structural rather than asserted:
 *
 * 1. **no effect between the selects and the put** other than pure `call`s — compute everything
 *    first, then put. One `put` per operation is what makes that structural instead of a convention;
 * 2. **the trigger writes nothing.** No slice has a case for any trigger below, so one gesture is one
 *    store write and no intermediate state is observable;
 * 3. **`takeEvery`, not `takeLatest`.** None of these handlers awaits I/O, so a handler runs to
 *    completion before the next trigger is taken and there is no interleaving to reason about. Every
 *    dispatch applies, and last-wins would silently drop gestures;
 * 4. **an operation may legitimately commit nothing.** The granularity and display-form edits and the
 *    replace bail out for an item that is in no bucket, and the handler then puts no event. It is NOT
 *    expressed by putting an event with unchanged values, because that would still write
 *    `isVisualizationMdObjectValid`.
 *
 * `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED` is deliberately absent: it writes `bucketsMeta` and nothing
 * else, so it is a plain slice case with no saga at all.
 */

// --- the twelve bucket-item edits -----------------------------------------------------------------

/**
 * The one handler behind all twelve edit triggers. Each trigger's own watcher maps its payload to a
 * {@link BucketItemEdit} and hands it over, so the select/compute/put half exists once.
 */
function* handleBucketItemEdit(edit: BucketItemEdit): SagaIterator {
    const input: ReturnType<typeof readBucketItemEditInput> = yield select(readBucketItemEditInput);
    const deps: ReturnType<typeof buildBucketItemEditDeps> = yield select(buildBucketItemEditDeps);

    const result: ReturnType<typeof editBucketItem> = yield call(editBucketItem, input, edit, deps);

    // rule 4: the addressed item is in no bucket, so the gesture does nothing at all
    if (!result) {
        return;
    }

    yield put(bucketItemEdited(result));
}

function* handleSetBucketItemTitle({ payload }: ReturnType<typeof setBucketItemTitle>): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "title",
        localIdentifier: payload.localIdentifier,
        title: payload.title,
    });
}

function* handleSetBucketItemFormat({ payload }: ReturnType<typeof setBucketItemFormat>): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "format",
        localIdentifier: payload.localIdentifier,
        format: payload.format,
    });
}

function* handleSetBucketItemShowAllValues({
    payload,
}: ReturnType<typeof storeBucketItemShowAllValues>): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "showAllValues",
        localIdentifier: payload.localIdentifier,
        showAllValues: payload.showAllValues,
    });
}

function* handleSetBucketItemIsTotalMeasure({
    payload,
}: IStoreSetBucketItemIsTotalMeasureAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "relatedFlag",
        property: "isTotalMeasure",
        localIdentifier: payload.localIdentifier,
        value: payload.value,
    });
}

function* handleSetBucketItemShowOnSecondaryAxis({
    payload,
}: ISetBucketItemShowOnSecondaryAxisAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "relatedFlag",
        property: "showOnSecondaryAxis",
        localIdentifier: payload.localIdentifier,
        value: payload.value,
    });
}

function* handleSetBucketItemIsThresholdMeasure({
    payload,
}: IStoreSetBucketItemIsThresholdMeasureAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "relatedFlag",
        property: "isThresholdMeasure",
        localIdentifier: payload.localIdentifier,
        value: payload.value,
    });
}

function* handleSetBucketItemAggregation({ payload }: ISetBucketItemAggregationAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "aggregation",
        item: payload.item as IRawBucketItem,
        value: payload.value,
    });
}

function* handleChangeMeasureChartType({ payload }: ReturnType<typeof changeMeasureChartType>): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "chartType",
        bucketLocalIdentifier: payload.localIdentifier,
        chartType: payload.type,
    });
}

/**
 * Dual axis is its OWN operation, not a {@link BucketItemEdit}: it decides the visualization-properties
 * `dualAxis` control as well as the bucket items' `showOnSecondaryAxis`, and the two have to land in one
 * event or the control is on while the items are not yet flagged.
 */
function* handleToggleDualAxis({ payload }: IToggleDualAxisAction): SagaIterator {
    const input: ReturnType<typeof readDualAxisToggleInput> = yield select(readDualAxisToggleInput);
    const deps: ReturnType<typeof readReferencePointSyncValues> = yield select(readReferencePointSyncValues);

    const result: ReturnType<typeof toggleBucketsDualAxis> = yield call(
        toggleBucketsDualAxis,
        input,
        { bucketLocalIdentifier: payload.localIdentifier, value: payload.value },
        deps,
    );

    yield put(dualAxisToggled(result));
}

function* handleSetBucketItemShowInPercent({
    payload,
}: IStoreSetBucketItemShowInPercentAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "showInPercent",
        localIdentifier: payload.localIdentifier,
        value: payload.value,
    });
}

function* handleSetBucketItemGranularity({ payload }: ISetBucketItemGranularityAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "granularity",
        localIdentifier: payload.localIdentifier,
        value: payload.value,
    });
}

function* handleSetBucketItemDisplayForm({ payload }: ISetBucketItemDisplayFormAction): SagaIterator {
    yield call(handleBucketItemEdit, {
        kind: "displayForm",
        localIdentifier: payload.localIdentifier,
        displayForm: payload.displayForm,
    });
}

// --- the three date-dataset triggers ---------------------------------------------------------------

function* handleBucketsDateDatasetChange(
    dateDatasetRef: ISetAllBucketsDateDatasetAction["payload"]["dateDatasetRef"],
    target: { bucketItemLocalIdentifier?: string; bucketLocalIdentifier?: string },
): SagaIterator {
    const input: ReturnType<typeof readBucketItemEditInput> = yield select(readBucketItemEditInput);
    const deps: ReturnType<typeof buildBucketsDateDatasetChangeDeps> = yield select(
        buildBucketsDateDatasetChangeDeps,
    );

    const result: ReturnType<typeof changeBucketsDateDataset> = yield call(
        changeBucketsDateDataset,
        input,
        { dateDatasetRef, ...target },
        deps,
    );

    yield put(bucketsDateDatasetChanged(result));
}

function* handleSetAllBucketsDateDataset({ payload }: ISetAllBucketsDateDatasetAction): SagaIterator {
    yield call(handleBucketsDateDatasetChange, payload.dateDatasetRef, {});
}

function* handleSetBucketItemDateDataset({ payload }: ISetBucketItemDateDatasetAction): SagaIterator {
    yield call(handleBucketsDateDatasetChange, payload.dateDatasetRef, {
        bucketItemLocalIdentifier: payload.bucketItemLocalIdentifier,
    });
}

function* handleSetBucketDateDataset({ payload }: ISetBucketDateDatasetAction): SagaIterator {
    yield call(handleBucketsDateDatasetChange, payload.dateDatasetRef, {
        bucketItemLocalIdentifier: payload.bucketItemLocalIdentifier,
        bucketLocalIdentifier: payload.synchronizingLocalIdentifier,
    });
}

// --- picking a visualization type ------------------------------------------------------------------

/**
 * The only handler with no `select` at all: the payload IS the class, and everything the operation
 * decides follows from it. Kept a saga rather than a slice case because THREE domains change together
 * (the class, the cleared extended reference point, the flag) and one event is what keeps that atomic.
 */
function* handleSelectVisualizationType({ payload }: ISelectVisualizationTypeAction): SagaIterator {
    yield put(visualizationTypeSelected(selectVisualizationType(payload)));
}

// --- adding a catalog item -------------------------------------------------------------------------

function* handleDropCatalogItem({ payload }: IDropCatalogItemAction): SagaIterator {
    const input: ReturnType<typeof readAddBucketItemInput> = yield select(readAddBucketItemInput);
    const deps: ReturnType<typeof buildAddBucketItemDeps> = yield select(
        buildAddBucketItemDeps,
        payload.localIdentifier,
    );

    const result: ReturnType<typeof addBucketItemFromCatalog> = yield call(
        addBucketItemFromCatalog,
        input,
        {
            bucketLocalIdentifier: payload.localIdentifier,
            catalogItem: payload.catalogItem,
            bucketPosition: payload.bucketPosition,
        },
        deps,
    );

    yield put(bucketItemAdded(result));
}

// --- removing items --------------------------------------------------------------------------------

function* handleRemoveBucketItems(params: IRemoveBucketItemsOperationParams): SagaIterator {
    const input: ReturnType<typeof readRemoveBucketItemsInput> = yield select(readRemoveBucketItemsInput);
    const deps: ReturnType<typeof buildRemoveBucketItemsDeps> = yield select(buildRemoveBucketItemsDeps);

    const result: ReturnType<typeof removeBucketItemsOperation> = yield call(
        removeBucketItemsOperation,
        input,
        params,
        deps,
    );

    yield put(bucketItemsRemoved(result));
}

/**
 * The drag-OUT gesture. It is the only trigger that asks for the second removal pass, which purges
 * the remaining derived measures when the first pass left period-over-period comparison unavailable.
 */
function* handleDragItemOut({ payload }: IRemoveBucketItemAction): SagaIterator {
    yield call(handleRemoveBucketItems, {
        localIdentifiers: [payload.bucketItem.localIdentifier],
        notifyOnlyAboutRemovedDependencies: true,
        purgeDerivedWhenPopUnavailable: true,
    });
}

function* handleRemoveBucketItemsByLocalIds({ payload }: IRemoveBucketItemsByLocalIdsAction): SagaIterator {
    yield call(handleRemoveBucketItems, {
        localIdentifiers: payload,
        notifyOnlyAboutRemovedDependencies: true,
    });
}

/**
 * `REMOVE_DERIVED_ITEMS` names no identifiers — it means "every derived measure there is", so the
 * handler resolves them at the boundary and the operation stays the same one.
 */
function* handleRemoveDerivedBucketItems(): SagaIterator {
    const buckets: ReturnType<typeof getBucketsState> = yield select(getBucketsState);
    const localIdentifiers = getDerivedBucketItemsInBuckets(buckets).map(
        (item: IRawBucketItem) => item.localIdentifier,
    );

    yield call(handleRemoveBucketItems, {
        localIdentifiers,
        // the removal notifies about every purged measure
        notifyOnlyAboutRemovedDependencies: false,
    });
}

// --- replacing, swapping, reordering ---------------------------------------------------------------

function* handleReplaceBucketItem({ payload }: IReplaceBucketItemAction): SagaIterator {
    const input: ReturnType<typeof readRemoveBucketItemsInput> = yield select(readRemoveBucketItemsInput);
    const bucketLocalIdentifier: string = yield select((state) =>
        readBucketLocalIdentifierOfItem(state, payload.bucketItem),
    );
    const deps: ReturnType<typeof buildReplaceBucketItemDeps> = yield select(
        buildReplaceBucketItemDeps,
        bucketLocalIdentifier,
    );

    const result: ReturnType<typeof replaceBucketItemWithCatalogItem> = yield call(
        replaceBucketItemWithCatalogItem,
        input,
        { bucketItem: payload.bucketItem, catalogItem: payload.catalogItem },
        deps,
    );

    // rule 4: the replaced item is in no bucket, so nothing is committed
    if (!result) {
        return;
    }

    yield put(bucketItemReplaced(result));
}

function* handleSwapBucketItem({ payload }: ISwapBucketItemAction): SagaIterator {
    const input: ReturnType<typeof readSwapBucketItemInput> = yield select(readSwapBucketItemInput);
    const deps: ReturnType<typeof buildSwapBucketItemDeps> = yield select(
        buildSwapBucketItemDeps,
        payload.localIdentifier,
    );

    const result: ReturnType<typeof swapBucketItems> = yield call(
        swapBucketItems,
        input,
        {
            targetBucketLocalIdentifier: payload.localIdentifier,
            from: payload.from,
            to: payload.to,
        },
        deps,
    );

    yield put(bucketItemsSwapped(result));
}

function* handleReorderBucketItem({ payload }: IReorderBucketItemAction): SagaIterator {
    const input: ReturnType<typeof readSwapBucketItemInput> = yield select(readSwapBucketItemInput);
    const deps: ReturnType<typeof buildReorderBucketItemDeps> = yield select(buildReorderBucketItemDeps);

    const result: ReturnType<typeof reorderBucketItem> = yield call(
        reorderBucketItem,
        input,
        {
            bucketLocalIdentifier: payload.localIdentifier,
            from: payload.from,
            bucketPosition: payload.bucketPosition,
        },
        deps,
    );

    yield put(bucketItemReordered(result));
}

// --- the pluggable-visualization answer ------------------------------------------------------------

function* handleExtendedReferencePointChanged({
    payload,
}: IExtendedReferencePointChangedAction): SagaIterator {
    const input: ReturnType<typeof readExtendedReferencePointAppliedInput> = yield select(
        readExtendedReferencePointAppliedInput,
    );
    const deps: ReturnType<typeof buildExtendedReferencePointAppliedDeps> = yield select(
        buildExtendedReferencePointAppliedDeps,
    );

    const result: ReturnType<typeof applyExtendedReferencePoint> = yield call(
        applyExtendedReferencePoint,
        input,
        { extendedReferencePoint: payload.extendedReferencePoint },
        deps,
    );

    yield put(extendedReferencePointApplied(result));
}

function* handleNewDerivedBucketItemsPlaced({ payload }: INewDerivedBucketItemsPlacedAction): SagaIterator {
    const input: ReturnType<typeof readDerivedBucketItemsPlacedInput> = yield select(
        readDerivedBucketItemsPlacedInput,
    );
    const deps: ReturnType<typeof readReferencePointSyncValues> = yield select(readReferencePointSyncValues);

    const result: ReturnType<typeof applyPlacedDerivedBucketItems> = yield call(
        applyPlacedDerivedBucketItems,
        input,
        // the plug-viz reference point's buckets BECOME the raw state buckets verbatim (see
        // IDerivedBucketItemsPlacedParams) — the sdk shape is the state shape at this boundary
        { buckets: payload.referencePoint.buckets as unknown as IRawBuckets },
        deps,
    );

    yield put(derivedBucketItemsPlaced(result));
}

// --- filters were removed --------------------------------------------------------------------------

function* handleFiltersWereChanged({ payload }: IFiltersWereChangedAction): SagaIterator {
    const input: ReturnType<typeof readFilterRemovalInput> = yield select(readFilterRemovalInput);
    const deps: ReturnType<typeof buildFilterRemovalDeps> = yield select(buildFilterRemovalDeps);

    const result: ReturnType<typeof applyFilterRemoval> = yield call(
        applyFilterRemoval,
        input,
        { removedFilters: payload.removedFilters },
        deps,
    );

    yield put(filterRemovalApplied(result));
}

// --- the boundary read the replace needs -----------------------------------------------------------

/**
 * Which bucket the item being replaced sits in. The replace's uiConfig deps are about THAT bucket, and
 * the operation cannot answer the question before the deps exist — so it is a boundary read, like every
 * other foreign fact.
 */
function readBucketLocalIdentifierOfItem(
    state: Parameters<typeof getBucketsState>[0],
    bucketItem: IRawBucketItem,
): string {
    const buckets = getBucketsState(state);
    const bucket = buckets.find((candidate) =>
        (candidate.items ?? []).some((item) => item.localIdentifier === bucketItem.localIdentifier),
    );

    return bucket?.localIdentifier;
}

export function* watchBucketsOperations(): SagaIterator {
    // the twelve bucket-item edits
    yield takeEvery(setBucketItemTitle.type, handleSetBucketItemTitle);
    yield takeEvery(setBucketItemFormat.type, handleSetBucketItemFormat);
    yield takeEvery(storeBucketItemShowAllValues.type, handleSetBucketItemShowAllValues);
    yield takeEvery(storeSetBucketItemIsTotalMeasure.type, handleSetBucketItemIsTotalMeasure);
    yield takeEvery(setBucketItemShowOnSecondaryAxis.type, handleSetBucketItemShowOnSecondaryAxis);
    yield takeEvery(storeBucketItemEnableThresholdMeasure.type, handleSetBucketItemIsThresholdMeasure);
    yield takeEvery(setBucketItemAggregation.type, handleSetBucketItemAggregation);
    yield takeEvery(changeMeasureChartType.type, handleChangeMeasureChartType);
    yield takeEvery(toggleDualAxis.type, handleToggleDualAxis);
    yield takeEvery(
        ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
        handleSetBucketItemShowInPercent,
    );
    yield takeEvery(ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_GRANULARITY, handleSetBucketItemGranularity);
    yield takeEvery(
        ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_DISPLAY_FORM,
        handleSetBucketItemDisplayForm,
    );

    // the three date-dataset triggers
    yield takeEvery(
        ActionTypeKeys.STORE_BUCKETS_SET_ALL_BUCKETS_DATE_DATASET,
        handleSetAllBucketsDateDataset,
    );
    yield takeEvery(
        ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
        handleSetBucketItemDateDataset,
    );
    yield takeEvery(ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_DATE_DATASET, handleSetBucketDateDataset);

    // the drag-and-drop gestures
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_INSERT, handleDropCatalogItem);
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_REMOVE, handleDragItemOut);
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_REPLACE, handleReplaceBucketItem);
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_SWAP, handleSwapBucketItem);
    yield takeEvery(ActionTypeKeys.BUCKETS_DND_ITEM_REORDER, handleReorderBucketItem);

    // the explicit removals
    yield takeEvery(ActionTypeKeys.BUCKETS_REMOVE_ITEMS, handleRemoveBucketItemsByLocalIds);
    yield takeEvery(ActionTypeKeys.STORE_BUCKETS_REMOVE_DERIVED_ITEMS, handleRemoveDerivedBucketItems);

    // the visualization type and the pluggable-visualization round trip
    yield takeEvery(ActionTypeKeys.BUCKETS_SELECT_VISUALIZATION_TYPE, handleSelectVisualizationType);
    yield takeEvery(ActionTypeKeys.EXTENDED_REFERENCE_POINT_CHANGED, handleExtendedReferencePointChanged);
    yield takeEvery(ActionTypeKeys.NEW_DERIVED_BUCKET_ITEMS_PLACED, handleNewDerivedBucketItemsPlaced);

    // the filter-removal reaction
    yield takeEvery(FilterBarActionTypeKeys.SAGA_FILTERS_WERE_CHANGED, handleFiltersWereChanged);
}
