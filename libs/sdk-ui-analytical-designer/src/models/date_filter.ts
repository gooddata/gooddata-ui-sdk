// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { ALL_TIME } from "../constants/presets.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";

import { type IDecoratedDateDatasetMeta } from "./date_dataset.js";
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

/**
 * Words the empty date values mode like the metric date filter chip and the filter bar's button:
 * "Empty values" for only, "All time except Empty values" for exclude on All time.
 */
function getIntervalTitle(filter: IDecoratedDateFilter, intl: IntlShape, formatLocale?: string) {
    const mode = filter.original?.emptyDateValuesFilter;
    const emptyValuesLabel = () => intl.formatMessage({ id: "filter.date.additional_filter.empty_values" });
    if (mode === "only") {
        return emptyValuesLabel();
    }
    const periodTitle = DecoratedPresetItem.getTitle(
        filter.interval,
        intl,
        0,
        LOCAL_TIMEZONE_OFFSET,
        formatLocale,
    );
    if (mode === "exclude" && isAllTime(filter)) {
        return `${periodTitle} ${intl.formatMessage({ id: "gs.list.except" })} ${emptyValuesLabel()}`;
    }
    return periodTitle;
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
