// (C) 2007-2026 GoodData Corporation

import { type AttributeDisplayFormType, type ObjRef, type TotalType } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";

import { type IBucketItemMetricFilter } from "./bucket_item_filter.js";

export interface IBucket {
    localIdentifier: string;
    items: IBucketItem[];
    totals: ITotal[];
}

export interface ITotal {
    attributeIdentifier: string;
    measureIdentifier: string;
    type: TotalType;
}

// a type literal (not an interface) so it satisfies IRawBucketItem's index signature — legacy
// consumers treat these interchangeably with the raw state items
export type IBucketItem = {
    attribute: string;
    aggregation: string | null;
    showInPercent: boolean;
    operator?: string;
    displayForm: string;
    dimensionUri: string;
    summary: string;
    operandLocalIdentifiers?: string[];
    identifier: string;
    dfRef: ObjRef;
    dfUri: string;
    dfIdentifier: string;
    uri: string;
    granularity: string;
    format?: string;
    alias: string;
    masterLocalIdentifier?: string;
    overTimeComparisonType?: OverTimeComparisonType;
    localIdentifier: string;
    elementsUri: string;
    title: string;
    showOnSecondaryAxis: boolean;
    type: string;
    id: string;
    filters: IBucketItemMetricFilter[];
    isAvailable: boolean;
    dateDatasetRef: ObjRef;
    isTotalMeasure?: boolean;
    isThresholdMeasure?: boolean;
    isKdaDisabled?: boolean;
    ref: ObjRef;
    areaDisplayFormRef?: ObjRef;

    /**
     * Set on an ATTRIBUTE item built from a computed attribute - see
     * {@link IRawBucketItem#isComputedAttribute} in typings/buckets.ts for why the flag exists.
     */
    isComputedAttribute?: boolean;
};

export interface ICacheItemDisplayForm {
    readonly title: string;
    readonly ref: ObjRef;
    readonly id: string;
    readonly uri: string;

    // optional to match runtime truth: date-derived and fixture display forms carry no type, and
    // models/display_form.ts#isSupportedDisplayFormType explicitly treats undefined as supported
    readonly type?: AttributeDisplayFormType | string;
    readonly displayFormType?: AttributeDisplayFormType | string;
    readonly isDefault?: boolean;
    readonly isPrimary?: boolean;
}

export interface ICacheItem {
    readonly ref: ObjRef;
    readonly title: string;
    readonly identifier: string;
    readonly uri: string;
    readonly type: "attribute" | "metric" | "fact" | "date" | "attributeHierarchy" | "computedAttribute";
    readonly summary?: string;
    readonly format?: string;
    readonly dfRef?: ObjRef;
    readonly dfUri?: string;
    readonly dfUris?: string[];
    readonly dfIdentifier?: string;
    readonly dfIdentifiers?: string[];
    readonly displayForms?: ICacheItemDisplayForm[];
    readonly expression?: string;
    readonly locationDisplayFormRef?: ObjRef;
    readonly locationDisplayFormUri?: string;
    readonly locationDisplayFormIdentifier?: string;
    readonly areaDisplayFormRef?: ObjRef;
    readonly areaDisplayFormUri?: string;
    readonly areaDisplayFormIdentifier?: string;
    readonly dateType?: string;
}

/**
 * A catalog object as the app carries it: the `data.itemCache` entry, and every value that flows out
 * of it — the decorated bucket item's `attribute`, the drag & drop catalog item, the synthetic date
 * item. It is ONE interface for one currency, named for what it holds rather than for where it
 * happens to be stored.
 *
 * Every field is optional and there is DELIBERATELY NO INDEX SIGNATURE: entries have three
 * provenances (catalog items via `utils/organized_catalog.ts`, date-attribute entries derived from
 * the date-datasets meta, and the display-form/geo decorations
 * `models/decorated_bucket_item.ts#getAttribute` merges in), so a union of optional fields is the
 * honest shape — and without an index signature a read of a field no provenance carries is a compile
 * error. Contrast {@link ICacheItem}: that one is the STRICT shape the catalog conversion produces,
 * and it is assignable to this.
 *
 * Every field is READONLY because readers get the STORED entry (`getCacheItemByDisplayFormRef`,
 * `getAttribute`'s undecorated short-circuit) and immer's freeze only guards dev builds — the
 * compiler carries the no-mutation guarantee in production. Writers build fresh objects (spread /
 * literals), so readonly costs them nothing.
 *
 * Not to be merged with `typings/catalog.ts#IOrganizedCatalogItem` either, tempting as it looks:
 * that one is the catalog-LIST projection (what `utils/organized_catalog.ts` builds for the catalog
 * tree) and it is a strict SUBSET. A cache entry additionally carries `format` (read by the MVF
 * metric-format lookup), `dateType`/`granularity`/`dfUris`/`dfIdentifiers` (the date-derived
 * entries, read by control filtering and the granularity selectors), `primaryRef` (the
 * attribute-filter add path), and `attribute`/`intl`/`interval` (the synthetic date item) — and it
 * makes `ref`/`identifier`/`title`/`type` optional, because a granularity-derived entry has no
 * `type` at all. A catalog item is one of the three provenances, not the shape itself.
 *
 * The MD-OBJECT transform inside `models/metadata.ts` consumes these entries directly.
 */
export interface ICatalogEntry {
    readonly ref?: ObjRef;
    /** Set on an attribute bucket item built from a computed attribute. */
    readonly isComputedAttribute?: boolean;
    readonly title?: string;
    readonly identifier?: string;
    readonly uri?: string;
    readonly type?: string;
    readonly summary?: string;
    readonly format?: string;
    readonly expression?: string;
    readonly dfRef?: ObjRef;
    readonly dfUri?: string;
    readonly dfUris?: readonly string[];
    readonly dfIdentifier?: string;
    readonly dfIdentifiers?: readonly string[];
    readonly displayForms?: readonly ICacheItemDisplayForm[];
    /** The display form the user picked on the bucket item, copied in by `getAttribute`. */
    readonly displayForm?: ObjRef | string;
    readonly primaryRef?: ObjRef;
    readonly primaryUri?: string;
    readonly locationDisplayFormRef?: ObjRef;
    readonly locationDisplayFormUri?: string;
    readonly locationDisplayFormIdentifier?: string;
    readonly areaDisplayFormRef?: ObjRef;
    readonly areaDisplayFormUri?: string;
    readonly areaDisplayFormIdentifier?: string;
    readonly isLocationIconVisible?: boolean;
    // --- date-derived entries: the SET_DATE_DATASETS_META fan-out and utils/api.ts date attributes
    readonly granularity?: string;
    readonly dateType?: string;
    readonly id?: string;
    readonly isAvailable?: boolean;
    readonly dimensionUri?: string;
    readonly elementsUri?: string;
    // --- the synthetic date item (models/date_item.ts#createDateItem)
    readonly attribute?: string;
    readonly intl?: boolean;
    readonly interval?: unknown;
    // --- catalog-list items reaching the shared consumers through drag & drop
    readonly available?: boolean;
    readonly hiddenFromKda?: boolean;
}

export type ICatalogEntries = Record<string, ICatalogEntry>;
