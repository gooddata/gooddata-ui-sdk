// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type IAttributeFilterConfigs } from "@gooddata/sdk-model";

import { type GeoLabelType } from "../constants/geo.js";
import { type IBucketsMetaState } from "../store/buckets/buckets_meta_state.js";
import {
    type IExtendedRefPointBucketUiConfig,
    type IExtendedRefPointBucketsUiConfig,
} from "../store/reference_point/extended_reference_point_state.js";
import {
    type IDecoratedBucket,
    type IDecoratedBuckets,
    type IRawBucket,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IMeasuresDescriptions } from "../typings/measure_descriptions.js";
import { type ICatalogEntries } from "../typings/state_objects.js";
import { getMeasuresDescriptions } from "../utils/measure_descriptions.js";

import { type ISelectedDateDatasets } from "./date_dataset.js";
import { decoratedBucketItem, fromPartial } from "./decorated_bucket_item.js";

/**
 * Sentinel used as the default bucket title/subtitle before the visualization's uiConfig
 * provides real (translated) values. Buckets that never receive a subtitle (e.g. the rows
 * and columns buckets of a pivot table) keep this default, so the UI must treat it as
 * "no value" rather than rendering it verbatim.
 */
export const EMPTY_BUCKET_LABEL = "empty_value";

const DECORATED_BUCKET_DEFAULTS: IDecoratedBucket = {
    localIdentifier: null,
    title: EMPTY_BUCKET_LABEL,
    subtitle: EMPTY_BUCKET_LABEL,
    icon: null,
    items: [],
    totals: [],
    original: null,
    accepts: [],
    itemsLimit: 20,
    itemsLimitByType: null,
    enabled: true,
    allowsDuplicateItems: false,
    allowsDuplicateDates: false,
    allowsDifferentAttributes: true,
    allowsSwapping: false,
    allowsReordering: false,
    canAddItems: true,
    warningMessage: "",
    transformAttributeToMeasure: true,
};

/**
 * Plain-object builder with the old Record semantics: unknown keys are dropped and
 * explicitly-undefined values fall back to the defaults.
 */
export function newDecoratedBucket(props: Partial<IDecoratedBucket> = {}): IDecoratedBucket {
    return fromPartial(DECORATED_BUCKET_DEFAULTS, props);
}

const DEFAULT_BUCKET_SETTINGS: IExtendedRefPointBucketUiConfig = {
    accepts: [],
};

const toArray = <T>(value: readonly T[] | null | undefined): readonly T[] => value ?? [];

export function decoratedBucket(
    measuresDescriptions: IMeasuresDescriptions,
    bucket: IRawBucket,
    itemCache: ICatalogEntries,
    selectedDateDatasets: ISelectedDateDatasets,
    uiSettings: IExtendedRefPointBucketsUiConfig | undefined = {},
    bucketsMeta: Partial<IBucketsMetaState> | undefined = {},
    attributeFilterConfigs: IAttributeFilterConfigs,
    intl: IntlShape,
    isLocationIconEnabled = false,
    formatLocale?: string,
    geoLabelType?: GeoLabelType,
): IDecoratedBucket {
    const localIdentifier = bucket?.localIdentifier;
    // The bucket rules from uiConfig; a missing entry falls back to the defaults.
    const rules = uiSettings?.[localIdentifier] ?? DEFAULT_BUCKET_SETTINGS;

    const items = toArray(bucket?.items).map((item) =>
        decoratedBucketItem(
            item,
            itemCache,
            selectedDateDatasets,
            measuresDescriptions,
            bucketsMeta,
            attributeFilterConfigs,
            intl,
            isLocationIconEnabled,
            formatLocale,
            geoLabelType,
        ),
    );

    return fromPartial(DECORATED_BUCKET_DEFAULTS, {
        ...rules,
        localIdentifier,
        totals: bucket?.totals,
        items,
        original: bucket,
    });
}

export function decoratedBuckets(
    buckets: IRawBuckets,
    bucketsMeta: Partial<IBucketsMetaState> | undefined,
    itemCache: ICatalogEntries,
    selectedDateDatasets: ISelectedDateDatasets,
    uiSettings: IExtendedRefPointBucketsUiConfig | undefined,
    attributeFilterConfigs: IAttributeFilterConfigs,
    intl: IntlShape,
    isLocationIconEnabled = false,
    formatLocale?: string,
    geoLabelType?: GeoLabelType,
): IDecoratedBuckets {
    if (!buckets) {
        return null;
    }

    const measuresDescriptions = getMeasuresDescriptions(buckets, itemCache, intl);

    return toArray(buckets).map((bucket) =>
        decoratedBucket(
            measuresDescriptions,
            bucket,
            itemCache,
            selectedDateDatasets,
            uiSettings,
            bucketsMeta,
            attributeFilterConfigs,
            intl,
            isLocationIconEnabled,
            formatLocale,
            geoLabelType,
        ),
    );
}
