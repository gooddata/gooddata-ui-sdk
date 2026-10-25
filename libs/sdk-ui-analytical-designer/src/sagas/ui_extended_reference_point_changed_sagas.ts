// (C) 2020-2026 GoodData Corporation

import { put, select, takeEvery } from "redux-saga/effects";

import { type ISortItem, isAttributeSort } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

import {
    type IUiExtendedReferencePointChangedAction,
    extendedReferencePointChanged,
} from "../actions/report_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { isGenericDateGranularity } from "../models/granularity.js";
import { getDecoratedBucketItems } from "../selectors/buckets_selector.js";
import { storeAppliedChartSort, storeChartSortConfig } from "../store/chart_sort/chart_sort_actions.js";
import { getSortConfig } from "../store/chart_sort/chart_sort_selector.js";
import { type IDecoratedBucketItems } from "../typings/buckets.js";

import { findGranularity } from "./../components/sort/chart_sort_bucket_items.js";

const isEmptySortConfig = (sortConfig: ISortConfig) =>
    sortConfig.availableSorts.length === 0 && sortConfig.defaultSort.length === 0;

const getBucketItemByLocalIdentifier = (bucketItems: IDecoratedBucketItems, localIdentifier: string) =>
    bucketItems.find((item) => item.localIdentifier === localIdentifier);

function updateGenericDateSortDirection(
    appliedSort: ISortItem[],
    bucketItems: IDecoratedBucketItems,
): ISortItem[] {
    return appliedSort.map((sortItem: ISortItem) => {
        if (isAttributeSort(sortItem)) {
            const bucketItem = getBucketItemByLocalIdentifier(
                bucketItems,
                sortItem.attributeSortItem.attributeIdentifier,
            );

            if (!bucketItem) {
                return sortItem;
            }

            const granularityOption = findGranularity(bucketItem);

            return granularityOption && isGenericDateGranularity(granularityOption)
                ? {
                      ...sortItem,
                      attributeSortItem: {
                          ...sortItem.attributeSortItem,
                          direction: "asc",
                      },
                  }
                : sortItem;
        }

        return sortItem;
    });
}

export function* onUiExtendedReferencePointChanged(action: IUiExtendedReferencePointChangedAction) {
    const { extendedReferencePoint, sortConfig } = action.payload;
    // every change in multiple places in appState which affect the execution and require to be in sync with bucket content need to be done before extendedReferencePointChanged
    if (sortConfig.supported) {
        const newSortConfig = action.payload.sortConfig;
        const bucketItems: ReturnType<typeof getDecoratedBucketItems> = yield select(getDecoratedBucketItems);
        const appliedSortWithGenericDateFixed: ISortItem[] = updateGenericDateSortDirection(
            newSortConfig.appliedSort,
            bucketItems,
        );
        const sortConfig: ReturnType<typeof getSortConfig> = yield select(getSortConfig);

        yield put(storeChartSortConfig({ ...newSortConfig, appliedSort: appliedSortWithGenericDateFixed }));
        // update only when it is not the first call after persisted insight was opened, otherwise persisted sort will be lost
        if (newSortConfig.appliedSort && !isEmptySortConfig(sortConfig)) {
            yield put(storeAppliedChartSort(appliedSortWithGenericDateFixed));
        }
    } else {
        yield put(
            storeChartSortConfig({
                supported: false,
                disabled: true,
                defaultSort: [],
                availableSorts: [],
            }),
        );
        yield put(storeAppliedChartSort([]));
    }

    // this action will set up extended reference point and set validity of whole report, which will start new execution
    yield put(extendedReferencePointChanged(extendedReferencePoint));
}

export function* watchUiExtendedReferencePointChanged() {
    yield takeEvery(ActionTypeKeys.UI_EXTENDED_REFERENCE_POINT_CHANGED, onUiExtendedReferencePointChanged);
}
