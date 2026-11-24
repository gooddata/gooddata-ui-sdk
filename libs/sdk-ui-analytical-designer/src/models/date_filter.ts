// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { ALL_TIME } from "../constants/presets.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";

import { type IDecoratedDateDatasetMeta } from "./date_dataset.js";
import { getPeriodTitleWithEmptyValues } from "./empty_date_values_title.js";
import {
    DecoratedPresetItem,
    type IDecoratedPresetItem,
    LOCAL_TIMEZONE_OFFSET,
    PRESETS,
    createDecoratedPresetItem,
} from "./preset_item.js";

export interface IDecoratedDateFilter {
    interval: IDecoratedPresetItem;
    /**
     * The raw bucket filter, as stored in `data.buckets[i].items[j].filters[k]`. Write-back paths
     * dispatch it verbatim.
     */
    original: IBucketItemMetricFilter | null;
    dateDataset: IDecoratedDateDatasetMeta | null;
    isModified: boolean;
    isDate: true;
}

function getAttributeTitle(filter: IDecoratedDateFilter) {
    return filter.dateDataset?.attributeTitle;
}

function getIntervalTitle(filter: IDecoratedDateFilter, intl: IntlShape, formatLocale?: string) {
    const periodTitle = DecoratedPresetItem.getTitle(
        filter.interval,
        intl,
        0,
        LOCAL_TIMEZONE_OFFSET,
        formatLocale,
    );
    return getPeriodTitleWithEmptyValues(
        periodTitle,
        isAllTime(filter),
        filter.original?.emptyDateValuesFilter,
        intl,
    );
}

function getTitle(filter: IDecoratedDateFilter, intl: IntlShape, formatLocale?: string) {
    return `${getAttributeTitle(filter)}: ${getIntervalTitle(filter, intl, formatLocale)}`;
}

function isAllTime(filter: IDecoratedDateFilter) {
    return filter.interval?.name === ALL_TIME;
}

export const DecoratedDateFilter = {
    getTitle,
    getAttributeTitle,
    getIntervalTitle,
    isAllTime,
};

export function createDecoratedDateFilter(
    filter: IBucketItemMetricFilter | null,
    dateDataset: IDecoratedDateDatasetMeta | null,
    bucketsMeta: Partial<IBucketsMetaState> | undefined = undefined,
    isMeasure = false,
): IDecoratedDateFilter {
    return {
        original: filter,
        interval: createDecoratedPresetItem(filter?.interval || PRESETS[0]),
        isModified: isMeasure ? true : bucketsMeta?.modified?.[filter?.attribute],
        dateDataset,
        isDate: true,
    };
}
