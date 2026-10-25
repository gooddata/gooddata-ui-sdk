// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ITotal, type IVisualizationClass, type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { ActionTypeKeys } from "../constants/actions.js";
import { type Granularity } from "../models/granularity.js";
import { type IRawBucketItem } from "../typings/buckets.js";
import { type VisualizationType } from "../typings/visualization.js";

export const selectVisualizationType = createAction(
    ActionTypeKeys.BUCKETS_SELECT_VISUALIZATION_TYPE,
    (type: IVisualizationClass) => ({ payload: type }),
);

export type ISelectVisualizationTypeAction = ReturnType<typeof selectVisualizationType>;

export const toggleBucketItemExpanded = createAction(
    ActionTypeKeys.BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED,
    (item: IRawBucketItem) => ({ payload: { item } }),
);

export type ISetBucketItemExpandedAction = ReturnType<typeof toggleBucketItemExpanded>;

export const storeConfigurationPanelCollapsed = createAction(
    ActionTypeKeys.STORE_CONFIGURATION_PANEL_COLLAPSED,
    (collapsed: boolean) => ({
        payload: { collapsed },
    }),
);

export const storeConfigurationPanelCollapsedByDragging = createAction(
    ActionTypeKeys.STORE_CONFIGURATION_PANEL_COLLAPSED_BY_DRAGGING,
    (collapsedByDragging: boolean) => ({
        payload: { collapsedByDragging },
    }),
);

export const setBucketItemAggregation = createAction(
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_AGGREGATION,
    (item: IRawBucketItem, value: string) => ({ payload: { item, value } }),
);

export type ISetBucketItemAggregationAction = ReturnType<typeof setBucketItemAggregation>;

export const storeSetBucketItemShowInPercent = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type IStoreSetBucketItemShowInPercentAction = ReturnType<typeof storeSetBucketItemShowInPercent>;

export const setBucketItemShowInPercent = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_SHOW_IN_PERCENT,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type ISetBucketItemShowInPercentAction = ReturnType<typeof setBucketItemShowInPercent>;

export const setBucketItemShowOnSecondaryAxis = createAction(
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_SHOW_ON_SECONDARY_AXIS,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type ISetBucketItemShowOnSecondaryAxisAction = ReturnType<typeof setBucketItemShowOnSecondaryAxis>;

export const setBucketItemIsThresholdMeasure = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type ISetBucketItemIsThresholdMeasureAction = ReturnType<typeof setBucketItemIsThresholdMeasure>;

export const storeBucketItemEnableThresholdMeasure = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_IS_THRESHOLD_MEASURE,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type IStoreSetBucketItemIsThresholdMeasureAction = ReturnType<
    typeof storeBucketItemEnableThresholdMeasure
>;

export const storeSetBucketItemIsTotalMeasure = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_IS_TOTAL_MEASURE,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export type IStoreSetBucketItemIsTotalMeasureAction = ReturnType<typeof storeSetBucketItemIsTotalMeasure>;

export const setBucketItemIsTotalMeasure = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_IS_TOTAL_MEASURE,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export const setAllBucketsDateDataset = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_ALL_BUCKETS_DATE_DATASET,
    (dateDatasetRef: ObjRef) => ({ payload: { dateDatasetRef } }),
);

export type ISetAllBucketsDateDatasetAction = ReturnType<typeof setAllBucketsDateDataset>;

export const setBucketItemDateDataset = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_DATE_DATASET,
    (dateDatasetRef: ObjRef, bucketItemLocalIdentifier: string) => ({
        payload: { dateDatasetRef, bucketItemLocalIdentifier },
    }),
);

export type ISetBucketItemDateDatasetAction = ReturnType<typeof setBucketItemDateDataset>;

export const setBucketDateDataset = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_DATE_DATASET,
    (dateDatasetRef: ObjRef, bucketItemLocalIdentifier: string, synchronizingLocalIdentifier: string) => ({
        payload: { dateDatasetRef, bucketItemLocalIdentifier, synchronizingLocalIdentifier },
    }),
);

export type ISetBucketDateDatasetAction = ReturnType<typeof setBucketDateDataset>;

export const setBucketItemGranularity = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_GRANULARITY,
    (localIdentifier: string, value: Granularity) => ({ payload: { localIdentifier, value } }),
);

export type ISetBucketItemGranularityAction = ReturnType<typeof setBucketItemGranularity>;

export const removeBucketDerivedItems = createAction(ActionTypeKeys.STORE_BUCKETS_REMOVE_DERIVED_ITEMS);

export const logUpdateCompareFilter = createAction(
    ActionTypeKeys.LOG_UPDATE_COMPARE_FILTER,
    (overTimeComparisonType: OverTimeComparisonType) => ({ payload: { overTimeComparisonType } }),
);

export const setBucketItemTitle = createAction(
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_TITLE,
    (localIdentifier: string, title: string) => ({ payload: { localIdentifier, title } }),
);

export const setRenamingBucketItemStarted = createAction(
    ActionTypeKeys.BUCKETS_SET_RENAMING_BUCKET_ITEM_STARTED,
);

export const setRenamingBucketItemEnded = createAction(ActionTypeKeys.BUCKETS_SET_RENAMING_BUCKET_ITEM_ENDED);

export const logBucketTotals = createAction(
    ActionTypeKeys.BUCKETS_LOG_BUCKET_TOTALS,
    (localIdentifier: string, totals: ITotal[]) => ({ payload: { localIdentifier, totals } }),
);

export const changeMeasureChartType = createAction(
    ActionTypeKeys.BUCKET_CHANGE_CHART_TYPE,
    (localIdentifier: string, type: VisualizationType) => ({ payload: { type, localIdentifier } }),
);

export const setBucketItemFormat = createAction(
    ActionTypeKeys.BUCKETS_SET_BUCKET_ITEM_FORMAT,
    (localIdentifier: string, format: string, presetId: string) => ({
        payload: { localIdentifier, format, presetId },
    }),
);

export const changeBucketItemDisplayForm = createAction(
    ActionTypeKeys.UI_BUCKETS_CHANGE_BUCKET_ITEM_DISPLAY_FORM,
    (localIdentifier: string, displayForm: ObjRef) => ({ payload: { localIdentifier, displayForm } }),
);

export type IChangeBucketItemDisplayFormAction = ReturnType<typeof changeBucketItemDisplayForm>;

export const storeBucketItemDisplayForm = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_DISPLAY_FORM,
    (localIdentifier: string, displayForm: ObjRef) => ({ payload: { localIdentifier, displayForm } }),
);

export type ISetBucketItemDisplayFormAction = ReturnType<typeof storeBucketItemDisplayForm>;

export const removeBucketItemsByLocalIds = createAction(
    ActionTypeKeys.BUCKETS_REMOVE_ITEMS,
    (localIdentifiers: string[]) => ({ payload: localIdentifiers }),
);

export type IRemoveBucketItemsByLocalIdsAction = ReturnType<typeof removeBucketItemsByLocalIds>;

export const changeBucketItemShowAllValues = createAction(
    ActionTypeKeys.UI_BUCKETS_CHANGE_BUCKET_ITEM_SHOW_ALL_VALUES,
    (localIdentifier: string, showAllValues: boolean) => ({ payload: { localIdentifier, showAllValues } }),
);

export type IChangeBucketItemDisplayShowAllValues = ReturnType<typeof changeBucketItemShowAllValues>;

export const storeBucketItemShowAllValues = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_SHOW_ALL_VALUES,
    (localIdentifier: string, showAllValues: boolean) => ({ payload: { localIdentifier, showAllValues } }),
);
