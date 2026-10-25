// (C) 2007-2026 GoodData Corporation

import { type ITotal, type ObjRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { type IDecoratedDateDatasetItem } from "../models/date_dataset.js";

import { type IBucketItemMetricFilter } from "./bucket_item_filter.js";
import { type IDateDatasetAttribute } from "./dataset_attribute.js";
import { type IDecoratedMetricFilters } from "./measure_filters.js";
import { type ICacheItemDisplayForm, type ICatalogEntry } from "./state_objects.js";

/**
 * THE RAW BUCKETS SUBTREE — `data.buckets`, and by reference `data.referencePoint.buckets`. "Raw" is
 * what distinguishes these from the DECORATED models below (`IDecoratedBucket*`, derived on write).
 *
 * The MD-OBJECT family (saved-insight content, `lastSavedObject`, save/compare currency) is a
 * DIFFERENT family with the same shapes, typed by the bear visualization-object types
 * (`typings/bear/bearTypes.ts`) rather than by these state aliases.
 */
export interface IRawBucketItem {
    localIdentifier?: string;
    masterLocalIdentifier?: string | null;
    type?: string;
    attribute?: string | null;
    /** a DATE item's attribute uri (the open-report date-dataset pick keys on it) */
    uri?: string;
    filters?: IBucketItemMetricFilter[];
    aggregation?: string | null;
    format?: string | null;
    alias?: string | null;
    operator?: string | null;
    operandLocalIdentifiers?: Array<string | null> | null;
    overTimeComparisonType?: OverTimeComparisonType;
    showInPercent?: boolean | null;
    showOnSecondaryAxis?: boolean | null;
    showAllValues?: boolean | null;
    isTotalMeasure?: boolean | null;
    isThresholdMeasure?: boolean | null;
    isKdaDisabled?: boolean | null;
    granularity?: string | null;
    dateDatasetRef?: ObjRef | null;
    dfRef?: ObjRef | null;
    /** an ATTRIBUTE item's explicitly user-picked display form (models/metadata.ts reads it over dfRef) */
    displayForm?: ObjRef | null;
    /** a DATE item's resolved display-form uri/identifier (models/metadata.ts#findItemInDateDatasets) */
    dfUri?: string;
    dfIdentifier?: string;
    // copied verbatim off the catalog item the item was built from (models/bucket_item.ts)
    identifier?: string;
    isLocationIconVisible?: boolean;
    locationDisplayFormRef?: ObjRef | null;
    areaDisplayFormRef?: ObjRef | null;
    ref?: ObjRef | null;
    displayForms?: readonly ICacheItemDisplayForm[];

    /**
     * Set on an ATTRIBUTE item that was built from a computed attribute. A computed attribute is an
     * attribute for every bucket, so `type` stays `"attribute"` and this flag is what preserves the
     * knowledge of what it really is — it selects the itemCache namespace to resolve the item in
     * (see models/item_cache_lookup.ts) and is what the execution conversion will branch on once the
     * AFM API accepts computed attributes.
     */
    isComputedAttribute?: boolean;
    [key: string]: unknown;
}

export type IRawBucketItems = IRawBucketItem[];

export interface IRawBucket {
    localIdentifier?: string;
    items?: IRawBucketItems;
    totals?: ITotal[];
    chartType?: string;
    [key: string]: unknown;
}

export type IRawBuckets = IRawBucket[];

/**
 * The granularity resolved for a date bucket item: a date dataset attribute, optionally
 * overridden with the display form the user picked on the bucket item.
 */
export type IDecoratedGranularity = IDateDatasetAttribute & {
    dfRef?: ObjRef;
    dfUri?: string;
    dfIdentifier?: string;
};

// The factories for the decorated bucket models live in
// models/decorated_bucket.ts and models/decorated_bucket_item.ts.
export interface IDecoratedBucketItem {
    ref: unknown;
    aggregation: string | null;
    showInPercent: boolean | null;
    showAllValues: boolean | null;
    showOnSecondaryAxis: boolean | null;
    isThresholdMeasure: boolean | null;
    isTotalMeasure: boolean | null;
    isKdaDisabled: boolean | null;
    alias: string | null;
    localIdentifier: string | null;
    masterLocalIdentifier: string | null;
    operator: string | null;
    operandLocalIdentifiers: unknown;
    format: string | null;
    sort: unknown;
    // --- decorations computed by decoratedBucketItem ---
    /** itemCache entry / synthetic date item. */
    attribute: ICatalogEntry | null;
    collapsed: boolean;
    dateDataset: IDecoratedDateDatasetItem | null;
    filters: IDecoratedMetricFilters;
    isMeasure: boolean;
    isArithmeticMeasure: boolean;
    isDate: boolean;
    isDerived: boolean;
    measureAxisLabel: string;
    measureTitle: string;
    label: string;
    /**
     * The raw bucket item. Write-back paths dispatch it verbatim. Null only for builder-made test
     * objects; the factory always sets it.
     */
    original: IRawBucketItem | null;
    granularity: IDecoratedGranularity | undefined;
    uri: string | undefined;
}

export type IDecoratedBucketItems = IDecoratedBucketItem[];

export interface IDecoratedBucket {
    localIdentifier: string | null;
    title: string;
    subtitle: string;
    icon: string | null;
    items: IDecoratedBucketItem[];
    /** The raw totals — copied verbatim from the raw bucket. */
    totals: ITotal[] | undefined;
    /**
     * The raw bucket. Write-back paths dispatch it verbatim. Null only for builder-made test
     * objects; the factory always sets it.
     */
    original: IRawBucket | null;
    // --- bucket rules from the visualization's uiConfig ---
    accepts: string[];
    itemsLimit: number;
    itemsLimitByType: { [type: string]: number } | null;
    enabled: boolean;
    allowsDuplicateItems: boolean;
    allowsDuplicateDates: boolean;
    allowsDifferentAttributes: boolean;
    allowsSwapping: boolean;
    allowsReordering: boolean;
    canAddItems: boolean;
    warningMessage: string;
    transformAttributeToMeasure: boolean;
}

export type IDecoratedBuckets = IDecoratedBucket[];
