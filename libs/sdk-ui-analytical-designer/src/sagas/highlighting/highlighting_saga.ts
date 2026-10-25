// (C) 2019-2026 GoodData Corporation

import { type SagaReturnType, call, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import { ActionTypeKeys } from "../../constants/actions.js";
import { isPoPAvailable } from "../../selectors/date_filter_selector.js";
import {
    hasBucketDateItem,
    removeAllDerivedBucketItems,
    removeMultipleBucketItemsWithDependencies,
    replaceBucketItemWithCatalogItem,
} from "../../services/buckets_service.js";
import { getAllBucketItems } from "../../store/buckets/buckets_selectors.js";
import {
    getDraggedBucketItem,
    getDraggedCatalogItem,
    getDraggedFilterItem,
} from "../../store/drag_and_drop/dnd_selectors.js";
import { getDateFilterIndex, getFilterItems } from "../../store/filter_bar/filter_bar_selector.js";
import {
    resetAboutToBeRemovedBucketAndFilterItems,
    resetHighlightedBucketItems,
    resetHighlightedFilterItem,
    setAboutToBeRemovedBucketAndFilterItems,
    setHighlightedBucketItems,
    setHighlightedFilterItem,
} from "../../store/highlighting/highlighting_actions.js";
import { type IAppState } from "../../store/types.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type IBucketItem } from "../../typings/metadata.js";

import {
    HighlightingUiActionTypeKeys,
    type IHighlightBucketAndFilterItems,
    type IHighlightItemsToBeRemovedBySwapAction,
} from "./highlighting_ui_actions.js";

function* findRemovedBucketItems(
    futureState: IAppState,
    aboutToBeRemovedBucketItemIdentifier: string | null,
) {
    const futureItemsRaw: SagaReturnType<typeof getAllBucketItems> = yield call(
        getAllBucketItems,
        futureState,
    );
    const futureItems: IBucketItem[] = futureItemsRaw as IBucketItem[];
    const currentItemsRaw: ReturnType<typeof getAllBucketItems> = yield select(getAllBucketItems);
    const currentItems: IBucketItem[] = currentItemsRaw as IBucketItem[];

    const futureLocalIdentifiers = futureItems.map((item) => item.localIdentifier);
    return currentItems
        .filter((item) => !futureLocalIdentifiers.includes(item.localIdentifier))
        .map((item) => item.localIdentifier)
        .filter((localIdentifier) => localIdentifier !== aboutToBeRemovedBucketItemIdentifier);
}

function* findRemoveMeasureFilters(futureState: IAppState) {
    const currentFilters: ReturnType<typeof getFilterItems> = yield select(getFilterItems);
    const futureFilters: ReturnType<typeof getFilterItems> = yield call(getFilterItems, futureState);

    return currentFilters
        .filter(
            (currentFilter) =>
                !futureFilters.find(
                    (futureFilter) => futureFilter.localIdentifier === currentFilter.localIdentifier,
                ),
        )
        .map((filter) => filter.localIdentifier);
}

function* findRemovedBucketAndFilterItems(
    futureState: IAppState,
    aboutToBeRemovedBucketItemIdentifier: string | null,
) {
    const removedBucketItems: SagaReturnType<typeof findRemovedBucketItems> = yield call(
        findRemovedBucketItems,
        futureState,
        aboutToBeRemovedBucketItemIdentifier,
    );

    const removedFilters: SagaReturnType<typeof findRemoveMeasureFilters> = yield call(
        findRemoveMeasureFilters,
        futureState,
    );

    return [...removedBucketItems, ...removedFilters];
}

function* highlightAboutToBeRemovedItems(
    futureState: IAppState,
    aboutToBeRemovedBucketItemIdentifier: string,
) {
    const removedBucketAndFilterItems: SagaReturnType<typeof findRemovedBucketAndFilterItems> = yield call(
        findRemovedBucketAndFilterItems,
        futureState,
        aboutToBeRemovedBucketItemIdentifier,
    );

    if (removedBucketAndFilterItems.length > 0) {
        yield put(setAboutToBeRemovedBucketAndFilterItems(removedBucketAndFilterItems));
    }
}

function* handleAboutToBeRemovedBucketItem(aboutToBeRemovedBucketItem: IRawBucketItem) {
    const aboutToBeRemovedBucketItemIdentifier = aboutToBeRemovedBucketItem?.localIdentifier;
    let futureState: ReturnType<typeof removeMultipleBucketItemsWithDependencies> = yield select(
        removeMultipleBucketItemsWithDependencies,
        [aboutToBeRemovedBucketItemIdentifier],
    );

    if (!isPoPAvailable(futureState) && hasBucketDateItem(futureState)) {
        futureState = yield removeAllDerivedBucketItems(futureState);
    }

    yield call(highlightAboutToBeRemovedItems, futureState, aboutToBeRemovedBucketItemIdentifier);
}

function* highlightItemsToBeRemovedByTrashSaga() {
    const aboutToBeRemovedBucketItem: ReturnType<typeof getDraggedBucketItem> =
        yield select(getDraggedBucketItem);
    const aboutToBeRemovedFilterItem: ReturnType<typeof getDraggedFilterItem> =
        yield select(getDraggedFilterItem);

    if (aboutToBeRemovedBucketItem) {
        yield call(handleAboutToBeRemovedBucketItem, aboutToBeRemovedBucketItem);
    }

    if (aboutToBeRemovedFilterItem) {
        const dateFilterIndex: ReturnType<typeof getDateFilterIndex> = yield select(
            getDateFilterIndex,
            aboutToBeRemovedFilterItem.localIdentifier,
        );
        if (dateFilterIndex === 0) {
            const futureState: ReturnType<typeof removeAllDerivedBucketItems> =
                yield select(removeAllDerivedBucketItems);
            yield call(highlightAboutToBeRemovedItems, futureState, null);
        }
    }
}

function* highlightItemsToBeRemovedBySwapSaga({
    payload: { replacedItem },
}: IHighlightItemsToBeRemovedBySwapAction) {
    const catalogItem: ReturnType<typeof getDraggedCatalogItem> = yield select(getDraggedCatalogItem);
    const replacedLocalIdentifier = replacedItem?.localIdentifier;

    const futureState: ReturnType<typeof replaceBucketItemWithCatalogItem> = yield select(
        replaceBucketItemWithCatalogItem,
        replacedItem,
        catalogItem,
    );
    yield call(highlightAboutToBeRemovedItems, futureState, replacedLocalIdentifier);
}

function* resetHighlightItemsToBeRemovedSaga() {
    yield put(resetAboutToBeRemovedBucketAndFilterItems());
}

function* highlightBucketAndFilterItems(action: IHighlightBucketAndFilterItems) {
    const { bucketItemLocalIdentifiers, filterLocalIdentifier } = action.payload;
    yield put(setHighlightedBucketItems(bucketItemLocalIdentifiers));
    if (filterLocalIdentifier) {
        yield put(setHighlightedFilterItem(filterLocalIdentifier));
    }
}

function* resetHighlightedBucketAndFilterItems() {
    yield put(resetHighlightedFilterItem());
    yield put(resetHighlightedBucketItems());
}

export function* highlightingWatcher() {
    yield takeEvery(
        HighlightingUiActionTypeKeys.UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_TRASH,
        highlightItemsToBeRemovedByTrashSaga,
    );
    yield takeEvery(
        HighlightingUiActionTypeKeys.UI_HIGHLIGHT_ITEMS_TO_BE_REMOVED_BY_SWAP,
        highlightItemsToBeRemovedBySwapSaga,
    );
    yield takeEvery(
        HighlightingUiActionTypeKeys.UI_RESET_HIGHLIGHTED_ITEMS_TO_BE_REMOVED,
        resetHighlightItemsToBeRemovedSaga,
    );
    yield takeLatest(
        HighlightingUiActionTypeKeys.UI_HIGHLIGHT_BUCKET_AND_FILTER_ITEMS,
        highlightBucketAndFilterItems,
    );
    yield takeLatest(
        HighlightingUiActionTypeKeys.UI_RESET_HIGHLIGHTED_BUCKET_AND_FILTER_ITEMS,
        resetHighlightedBucketAndFilterItems,
    );

    yield takeEvery(ActionTypeKeys.UNDO_ACTION, resetHighlightItemsToBeRemovedSaga);
    yield takeEvery(ActionTypeKeys.REDO_ACTION, resetHighlightItemsToBeRemovedSaga);
}
