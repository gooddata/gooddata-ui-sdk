// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type DisplayFormRefType } from "@gooddata/sdk-embedding/internal";
import { type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { type IDateFilterOption } from "../../components/filterBar/dateFilter/dateFilterOptionFactory.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { type IPresetItem } from "../../models/preset_item.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeElement,
    type IAttributeFilter,
    type IDateFilterConfig,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type MeasureValueFilterCondition,
    type TextModeFilterData,
} from "../filter_bar/filter_bar_types.js";

/**
 * These type keys live in the global ActionTypeKeys enum because the time-travel whitelist matches
 * on them there, so their values must not change.
 */

export interface IUpdateDateFilterActionPayload {
    localIdentifier: string;
    overTimeComparisonType?: OverTimeComparisonType;
    overTimeComparisonMeasures?: string[];
    filterConfig: IDateFilterConfig;
    dateDatasetRef: ObjRef;
    additionalDateAttributeFilters?: IFilter[];
    isCurrentPeriodExcluded?: boolean;
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
}

export interface IChangeBucketItemDateDatasetActionPayload {
    dateDatasetRef: ObjRef;
    bucketItemLocalIdentifier?: string;
}

export type IUpdateAttributeFilterActionPayload = {
    filterLocalIdentifier: string;
    totalElementsCount?: number;
    selectedElements?: ReadonlyArray<IAttributeElement>;
    isInverted?: boolean;
    cacheItemIdentifier?: string;
    dfUri?: string;
    dfIdentifier?: string;
    /**
     * Whether `dfIdentifier` names a label or a computed attribute (see {@link DisplayFormRefType}).
     * A computed attribute is referenced directly, so this decides the type of the display form ref
     * built for the filter. Missing means a label.
     */
    dfType?: DisplayFormRefType;
    displayFormRef?: ObjRef;
    textModeFilter?: TextModeFilterData;
};

export const storeUpdateAttributeFilter = createAction(
    ActionTypeKeys.STORE_UPDATE_ATTRIBUTE_FILTER,
    (payload: IUpdateAttributeFilterActionPayload) => ({ payload }),
);

export type IStoreUpdateAttributeFilterAction = ReturnType<typeof storeUpdateAttributeFilter>;

export const storeUpdateDateFilter = createAction(
    ActionTypeKeys.STORE_UPDATE_DATE_FILTER,
    (payload: IUpdateDateFilterActionPayload) => ({ payload }),
);

export type IStoreUpdateDateFilterAction = ReturnType<typeof storeUpdateDateFilter>;

export const storeUpdateDateFilterDateDataset = createAction(
    ActionTypeKeys.STORE_UPDATE_DATE_FILTER_DATE_DATASET,
    (
        localIdentifier: string,
        dateDatasetRef: ObjRef,
        filterConfig?: IDateFilterConfig,
        overTimeComparisonType?: OverTimeComparisonType,
    ) => ({
        payload: {
            localIdentifier,
            dateDatasetRef,
            filterConfig,
            overTimeComparisonType,
        },
    }),
);

export type IStoreUpdateDateFilterDateDatasetAction = ReturnType<typeof storeUpdateDateFilterDateDataset>;

/**
 * The patch a metric-filter edit sends. Everything merges into the filter over a cleared
 * `textModeFilter` — including the two over-time riders — except `dateDataset`, which is stripped.
 */
export interface IMetricFilterChanges extends Omit<IBucketItemMetricFilter, "selectedElements"> {
    selectedElements?: ReadonlyArray<unknown>;
    /** stripped by the patch before merging */
    dateDataset?: unknown;
}

export const storeSetBucketItemAddMetricFilter = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
    // `attribute` is itemCache currency and the reducer merges it INTO `data.itemCache`, so it is
    // typed as a cache entry rather than `any`
    (item: IRawBucketItem, attribute: ICatalogEntry, selectedDateDatasetIdentifier: string) => ({
        payload: {
            item,
            attribute,
            selectedDateDatasetIdentifier,
        },
    }),
);

export type IStoreSetBucketItemAddMetricFilterAction = ReturnType<typeof storeSetBucketItemAddMetricFilter>;

export const storeSetBucketItemAddMetricFilters = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTERS,
    (item: IRawBucketItem, attributes: ReadonlyArray<ICatalogEntry>) => ({
        payload: {
            item,
            attributes,
        },
    }),
);

export type IStoreSetBucketItemAddMetricFiltersAction = ReturnType<typeof storeSetBucketItemAddMetricFilters>;

export const storeSetBucketItemRemoveMetricFilter = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER,
    (
        item: IRawBucketItem,
        filter: IBucketItemMetricFilter,
        removeAdditionalDateFilters: boolean = false,
    ) => ({
        payload: {
            item,
            filter,
            removeAdditionalDateFilters,
        },
    }),
);

export type IStoreSetBucketItemRemoveMetricFilterAction = ReturnType<
    typeof storeSetBucketItemRemoveMetricFilter
>;

export const storeSetBucketItemUpdateMetricFilter = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
    (
        item: IRawBucketItem,
        filter: IBucketItemMetricFilter,
        changes: IMetricFilterChanges,
        isModified: boolean = true,
    ) => ({
        payload: {
            item,
            filter,
            changes,
            isModified,
        },
    }),
);

export type IStoreSetBucketItemUpdateMetricFilterAction = ReturnType<
    typeof storeSetBucketItemUpdateMetricFilter
>;

/**
 * Everything the metric date filter picker applies at once, the way the filter bar's Apply carries
 * the period, the date dataset and the additional date filters in one `UI_UPDATE_DATE_FILTER`.
 */
export interface IMetricDateFilterApplyPayload {
    /**
     * The stored date filter the picker edits; undefined adds a new one. A metric can carry a date
     * filter per date dataset, so the edited one is named explicitly.
     */
    dateFilter: IBucketItemMetricFilter | undefined;
    /** the period as the shared date filter picker produces it */
    dateFilterOption: IDateFilterOption;
    dateDatasetIdentifier: string;
    /** the metric's attribute filters on the date dataset's own attributes, as edited in the picker */
    additionalDateFilters: ReadonlyArray<IAttributeFilter>;
    /** the empty date values mode picked in the picker; undefined removes it */
    emptyDateValuesFilter?: EmptyDateValuesFilterMode;
}

/** The STORE counterpart: the period already in the shape the metric date filter stores it. */
export interface IMetricDateFilterStorePayload extends Omit<
    IMetricDateFilterApplyPayload,
    "dateFilterOption"
> {
    interval: IPresetItem;
}

export const storeSetBucketItemApplyMetricDateFilter = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER,
    (item: IRawBucketItem, payload: IMetricDateFilterStorePayload) => ({
        payload: {
            item,
            ...payload,
        },
    }),
);

export type IStoreSetBucketItemApplyMetricDateFilterAction = ReturnType<
    typeof storeSetBucketItemApplyMetricDateFilter
>;

export interface IUpdateMetricFilterDisplayFormActionPayload {
    itemLocalIdentifier: string;
    filterAttribute: string;
    filterLocalIdentifier: string;
    displayAsDfRef: ObjRef;
    primaryDfRef?: ObjRef;
    selectedElements?: IAttributeElement[];
}

export const storeSetBucketItemUpdateMetricFilterDisplayForm = createAction(
    ActionTypeKeys.STORE_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER_DISPLAY_FORM,
    (payload: IUpdateMetricFilterDisplayFormActionPayload) => ({ payload }),
);

export const updateAttributeFilter = createAction(
    ActionTypeKeys.UI_UPDATE_ATTRIBUTE_FILTER,
    (payload: IUpdateAttributeFilterActionPayload) => ({ payload }),
);

export type IUpdateArbitraryFilterActionPayload = {
    filterLocalIdentifier?: string;
    dfIdentifier?: string;
    dfType?: DisplayFormRefType;
    cacheItemIdentifier?: string;
    values: string[];
    negativeSelection: boolean;
};

export type IUpdateMatchFilterActionPayload = {
    filterLocalIdentifier?: string;
    dfIdentifier?: string;
    dfType?: DisplayFormRefType;
    cacheItemIdentifier?: string;
    operator: "contains" | "startsWith" | "endsWith";
    literal: string;
    caseSensitive?: boolean;
    negativeSelection?: boolean;
};

export type IUpdateExternalMeasureValueFilterPayload = {
    measureIdentifier: string;
    conditions?: MeasureValueFilterCondition[];
};

export interface ICommandUpdateFilterItemsActionPayload {
    attributeFilters?: IUpdateAttributeFilterActionPayload[];
    arbitraryFilters?: IUpdateArbitraryFilterActionPayload[];
    matchFilters?: IUpdateMatchFilterActionPayload[];
    dateFilter?: IUpdateDateFilterActionPayload; // TODO deprecated payload, use dateFilters only from next major
    dateFilters?: IUpdateDateFilterActionPayload[];
    rankingFilter?: IUpdateRankingFilterActionPayload;
    measureValueFilters?: IUpdateExternalMeasureValueFilterPayload[];
}

export const commandAddOrUpdateFilterItems = createAction(
    ActionTypeKeys.STORE_ADD_OR_UPDATE_FILTER_ITEMS,
    (filterConfigs: ICommandUpdateFilterItemsActionPayload) => ({
        payload: filterConfigs,
    }),
);

export type ICommandUpdateFilterItemsAction = ReturnType<typeof commandAddOrUpdateFilterItems>;

export type IUpdateAttributeFilterDisplayFormActionPayload = {
    filterLocalIdentifier: string;
    displayAsDfRef: ObjRef;
    primaryDfRef?: ObjRef;
    selectedElements?: IAttributeElement[];
};

export const updateAttributeFilterDisplayForm = createAction(
    ActionTypeKeys.UI_UPDATE_ATTRIBUTE_FILTER_DISPLAY_FORM,
    (payload: IUpdateAttributeFilterDisplayFormActionPayload) => ({ payload }),
);

export const storeUpdateAttributeFilterDisplayForm = createAction(
    ActionTypeKeys.STORE_UPDATE_ATTRIBUTE_FILTER_DISPLAY_FORM,
    (payload: IUpdateAttributeFilterDisplayFormActionPayload) => ({ payload }),
);

export const setBucketItemAddMetricFilter = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTER,
    // itemCache currency — see the STORE_ twin below
    (item: IRawBucketItem, attribute: ICatalogEntry, selectedDateDatasetIdentifier: string) => ({
        payload: {
            item,
            attribute,
            selectedDateDatasetIdentifier,
        },
    }),
);

/**
 * Adds an attribute filter per picked attribute to the metric as ONE gesture (one undo step): the
 * "Add filter" menu's attribute picker is multi-select, like the filter bar's.
 */
export const setBucketItemAddMetricFilters = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_ADD_METRIC_FILTERS,
    (item: IRawBucketItem, attributes: ReadonlyArray<ICatalogEntry>) => ({
        payload: {
            item,
            attributes,
        },
    }),
);

export const setBucketItemRemoveMetricFilter = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_REMOVE_METRIC_FILTER,
    // `removeAdditionalDateFilters`: a removed date filter takes the metric's attribute filters on
    // the date dataset's own attributes with it (the shared date filter picker owns those)
    (
        item: IRawBucketItem,
        filter: IBucketItemMetricFilter,
        removeAdditionalDateFilters: boolean = false,
    ) => ({
        payload: {
            item,
            filter,
            removeAdditionalDateFilters,
        },
    }),
);

export const setBucketItemUpdateMetricFilter = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER,
    (
        item: IRawBucketItem,
        filter: IBucketItemMetricFilter,
        changes: IMetricFilterChanges,
        isModified: boolean = true,
    ) => ({
        payload: {
            item,
            filter,
            changes,
            isModified,
        },
    }),
);

export const setBucketItemUpdateMetricFilterDisplayForm = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_UPDATE_METRIC_FILTER_DISPLAY_FORM,
    (payload: IUpdateMetricFilterDisplayFormActionPayload) => ({ payload }),
);

/**
 * Applies the metric date filter picker as ONE gesture: the period (adding the date filter when the
 * metric has none), the date dataset and the additional date filters — so it is one undo step, as
 * the filter bar's date filter Apply is.
 */
export const setBucketItemApplyMetricDateFilter = createAction(
    ActionTypeKeys.UI_BUCKETS_SET_BUCKET_ITEM_APPLY_METRIC_DATE_FILTER,
    (item: IRawBucketItem, payload: IMetricDateFilterApplyPayload) => ({
        payload: {
            item,
            ...payload,
        },
    }),
);

export const updateMeasureValueFilter = createAction(
    ActionTypeKeys.UI_UPDATE_MEASURE_VALUE_FILTER,
    (filter: IMeasureValueFilter) => ({ payload: { filter } }),
);

export type IUpdateMeasureValueFilterAction = ReturnType<typeof updateMeasureValueFilter>;

export interface IUpdateRankingFilterActionPayload {
    filter: IRankingFilter;
}

export const updateRankingFilter = createAction(
    ActionTypeKeys.UI_UPDATE_RANKING_FILTER,
    (filter: IRankingFilter) => ({ payload: { filter } }),
);

export type IUpdateRankingFilterAction = ReturnType<typeof updateRankingFilter>;

export const storeUpdateMeasureValueFilter = createAction(
    ActionTypeKeys.STORE_UPDATE_MEASURE_VALUE_FILTER,
    (filter: IMeasureValueFilter) => ({ payload: { filter } }),
);

export type IStoreUpdateMeasureValueFilterAction = ReturnType<typeof storeUpdateMeasureValueFilter>;

export const storeUpdateRankingFilter = createAction(
    ActionTypeKeys.STORE_UPDATE_RANKING_FILTER,
    (filter: IRankingFilter) => ({ payload: { filter } }),
);

export type IStoreUpdateRankingFilterAction = ReturnType<typeof storeUpdateRankingFilter>;

export const measureValueFilterConfigurationOpened = createAction(
    ActionTypeKeys.UI_MEASURE_VALUE_FILTER_OPENED,
    (filter: IMeasureValueFilter) => ({ payload: { filter } }),
);

export const dateFilterClosed = createAction(ActionTypeKeys.UI_DATE_FILTER_CLOSED);
