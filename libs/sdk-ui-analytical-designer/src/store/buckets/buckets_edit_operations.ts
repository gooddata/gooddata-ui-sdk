// (C) 2026 GoodData Corporation

import { type IVisualizationClass, type ObjRef } from "@gooddata/sdk-model";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { isAttribute, isComputedAttributeItem, isDate } from "../../models/bucket_item.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";
import { setDualAxisControl } from "../properties/properties_helpers.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncValues,
    syncReferencePoint,
} from "../reference_point/reference_point_sync.js";

import {
    getBucketItemAddress,
    getBucketItemAt,
    replaceBucketItemAt,
    updateBucketItemAt,
} from "./bucket_item_address.js";
import {
    type DateDatasetByRefResolver,
    setBucketItemsDateDataset,
    syncDateBucketItemGranularityAndDfRef,
} from "./buckets_date_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    changeMeasureChartTypeInBuckets,
    findBucketItemInBuckets,
    renameBucketItemInBuckets,
    setBucketItemAggregationInBuckets,
    setBucketItemFormatInBuckets,
    setBucketItemShowAllValuesInBuckets,
    setRelatedBucketItemsPropertyInBuckets,
    toggleDualAxisInBuckets,
} from "./buckets_write_helpers.js";
import { isDateItem } from "./helpers/bucket_item_predicates.js";
import {
    type CatalogItemTypeResolver,
    sanitizeMeasureFormatForCatalogType,
} from "./helpers/measure_format.js";

/**
 * THE NARROW BUCKETS OPERATIONS — the ones whose whole cross-domain consequence is the
 * reference-point sync. The filter-removal reaction is the one narrow-looking trigger that is NOT
 * here, because it can widen into the removal chain — see `buckets_filter_removal_operation.ts`.
 *
 * `undefined` IS A RESULT: the granularity and display-form edits must bail out when the addressed
 * item is in no bucket, skipping the sync AND leaving `isVisualizationMdObjectValid` alone. Answering
 * `undefined` is how — the saga puts no event, so nothing is committed. Returning the inputs by
 * reference would still write the flag.
 *
 * The other edits are deliberately UNGUARDED: an item that is in no bucket has no address, and the
 * write then throws a `TypeError`. That asymmetry is behavior, not an oversight, and it is pinned in
 * both directions.
 */

// --- the eleven bucket-item edits + dual axis ------------------------------------------------------

/**
 * WHICH edit — the discriminant of ONE operation with eleven parameterizations, not eleven operations:
 * the buckets value is all that differs, the reference-point consequence is identical.
 */
export type BucketItemEdit =
    | { kind: "title"; localIdentifier: string; title: string }
    | { kind: "format"; localIdentifier: string; format: string }
    | { kind: "showAllValues"; localIdentifier: string; showAllValues: boolean }
    | {
          kind: "relatedFlag";
          property: "isTotalMeasure" | "showOnSecondaryAxis" | "isThresholdMeasure";
          localIdentifier: string;
          value: boolean;
      }
    | { kind: "aggregation"; item: IRawBucketItem; value: string }
    | { kind: "chartType"; bucketLocalIdentifier: string; chartType: string }
    | { kind: "showInPercent"; localIdentifier: string; value: boolean }
    | { kind: "granularity"; localIdentifier: string; value: string }
    | { kind: "displayForm"; localIdentifier: string; displayForm: ObjRef };

/** Resolves one of an attribute's cached display forms by its `ObjRef`. Backed by the item cache. */
export type AttributeDisplayFormByRefResolver = (
    cacheItemIdentifier: string,
    displayFormRef: ObjRef,
    isComputedAttribute: boolean,
) => ICacheItemDisplayForm | undefined;

export interface IBucketItemEditInput {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState | undefined;
}

export interface IBucketItemEditDeps extends IReferencePointSyncValues {
    /** the `showInPercent` edit's format rule — `undefined` type means "no catalog item" */
    catalogItemType: CatalogItemTypeResolver;
    /** the granularity and display-form edits' date branch */
    dateDatasetByRef: DateDatasetByRefResolver;
    /** the display-form edit's non-date branch */
    attributeDisplayFormByRef: AttributeDisplayFormByRefResolver;
}

export interface IBucketItemEditResult {
    buckets: IRawBuckets;
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

/**
 * `showInPercent` on the addressed measure AND on everything derived from it, then the format rule.
 *
 * The item is re-read out of the WRITTEN buckets before it is sanitized, because
 * `setRelatedBucketItemsPropertyInBuckets` is what put the new `showInPercent` on it — and the format
 * decision compares the two versions.
 */
function editShowInPercent(
    buckets: IRawBuckets,
    localIdentifier: string,
    value: boolean,
    catalogItemType: CatalogItemTypeResolver,
): IRawBuckets {
    const previousItem = findBucketItemInBuckets(buckets, localIdentifier);
    const address = getBucketItemAddress(buckets, previousItem);

    const withFlag = setRelatedBucketItemsPropertyInBuckets(buckets, "showInPercent", localIdentifier, value);

    const modifiedItem = getBucketItemAt(withFlag, address);
    const sanitizedItem = sanitizeMeasureFormatForCatalogType(
        previousItem,
        modifiedItem,
        catalogItemType(modifiedItem.attribute),
    );

    return replaceBucketItemAt(withFlag, address, sanitizedItem);
}

/**
 * A date item's granularity is synced together with its `dfRef` (the display form IS the granularity
 * attribute); anything else just takes the value.
 */
function editGranularity(
    buckets: IRawBuckets,
    bucketItem: IRawBucketItem,
    value: string,
    dateDatasetByRef: DateDatasetByRefResolver,
): IRawBuckets {
    const address = getBucketItemAddress(buckets, bucketItem);

    if (isDate(bucketItem)) {
        return replaceBucketItemAt(buckets, address, syncDateItem(bucketItem, dateDatasetByRef, value));
    }

    return updateBucketItemAt(buckets, address, (item) =>
        item.granularity === value ? item : { ...item, granularity: value },
    );
}

/**
 * Points a bucket item at another display form.
 *
 * The two branches are told apart by `isDateItem` (the DATE DATASET ATTRIBUTE), not by `isDate` (the
 * item TYPE) — the granularity edit above uses the other one.
 *
 * The non-date branch is unguarded on the cache lookup: an `ObjRef` the attribute does not carry
 * throws a `TypeError`. Guarding it would silently keep a stale `dfUri`/`dfIdentifier` pair next to
 * the new `dfRef`, which is worse than the throw.
 */
function editDisplayForm(
    buckets: IRawBuckets,
    bucketItem: IRawBucketItem,
    displayFormRef: ObjRef,
    deps: Pick<IBucketItemEditDeps, "dateDatasetByRef" | "attributeDisplayFormByRef">,
): IRawBuckets {
    const address = getBucketItemAddress(buckets, bucketItem);

    if (isDateItem(bucketItem)) {
        const withDfRef =
            bucketItem.dfRef === displayFormRef ? bucketItem : { ...bucketItem, dfRef: displayFormRef };
        return replaceBucketItemAt(buckets, address, syncDateItem(withDfRef, deps.dateDatasetByRef));
    }

    const matchingDisplayForm = deps.attributeDisplayFormByRef(
        bucketItem?.attribute,
        displayFormRef,
        isComputedAttributeItem(bucketItem),
    );

    // The FOUR fields move together — the ref the item points at, plus the resolved uri/identifier
    // pair the execution needs. Written in one pass so a re-point costs a single item copy.
    return updateBucketItemAt(buckets, address, (item) => {
        if (
            item.dfRef === displayFormRef &&
            item["displayForm"] === displayFormRef &&
            item["dfUri"] === matchingDisplayForm.uri &&
            item["dfIdentifier"] === matchingDisplayForm.id
        ) {
            return item;
        }
        return {
            ...item,
            dfRef: displayFormRef,
            displayForm: displayFormRef,
            dfUri: matchingDisplayForm.uri,
            dfIdentifier: matchingDisplayForm.id,
        };
    });
}

/** The date-dataset lookup + sync pair, which three of the edits need. */
function syncDateItem(
    bucketItem: IRawBucketItem,
    dateDatasetByRef: DateDatasetByRefResolver,
    granularityOverride?: string,
): IRawBucketItem {
    const dateDatasetRef: ObjRef | undefined = isDate(bucketItem) ? bucketItem?.dateDatasetRef : undefined;
    const dateDataset = dateDatasetRef ? dateDatasetByRef(dateDatasetRef) : undefined;

    return syncDateBucketItemGranularityAndDfRef(bucketItem, dateDataset, granularityOverride);
}

/**
 * The buckets half of {@link editBucketItem}. `undefined` means "the addressed item is not in any
 * bucket, so this gesture does nothing at all" — see the module note; only the two edits that had that
 * guard can answer it.
 */
export function editBucketsForItem(
    buckets: IRawBuckets,
    edit: BucketItemEdit,
    deps: IBucketItemEditDeps,
): IRawBuckets | undefined {
    switch (edit.kind) {
        case "title":
            return renameBucketItemInBuckets(buckets, edit.localIdentifier, edit.title);
        case "format":
            return setBucketItemFormatInBuckets(buckets, edit.localIdentifier, edit.format);
        case "showAllValues":
            return setBucketItemShowAllValuesInBuckets(buckets, edit.localIdentifier, edit.showAllValues);
        case "relatedFlag":
            return setRelatedBucketItemsPropertyInBuckets(
                buckets,
                edit.property,
                edit.localIdentifier,
                edit.value,
            );
        case "aggregation":
            return setBucketItemAggregationInBuckets(buckets, edit.item, edit.value);
        case "chartType":
            return changeMeasureChartTypeInBuckets(buckets, edit.bucketLocalIdentifier, edit.chartType);
        case "showInPercent":
            return editShowInPercent(buckets, edit.localIdentifier, edit.value, deps.catalogItemType);
        case "granularity": {
            const bucketItem = findBucketItemInBuckets(buckets, edit.localIdentifier);
            return bucketItem
                ? editGranularity(buckets, bucketItem, edit.value, deps.dateDatasetByRef)
                : undefined;
        }
        case "displayForm": {
            const bucketItem = findBucketItemInBuckets(buckets, edit.localIdentifier);
            return bucketItem ? editDisplayForm(buckets, bucketItem, edit.displayForm, deps) : undefined;
        }
    }
}

/**
 * DUAL AXIS — the one edit that decides TWO domains, so it is its own operation with its own event.
 *
 * `BUCKET_TOGGLE_DUAL_AXIS` sets the `dualAxis` visualization-properties control AND flips
 * `showOnSecondaryAxis` on every item of the named bucket. Both halves land in ONE dispatch: leaving
 * the properties half on the trigger while the buckets half moved to a semantic event would expose a
 * half-applied state — the control on, the items not yet flagged.
 *
 * The properties RULE stays in the properties domain (`setDualAxisControl`); this operation composes
 * it, which is what a fact belonging to another domain should look like.
 */
export interface IDualAxisToggleInput extends IBucketItemEditInput {
    visualizationProperties: IVisualizationProperties;
}

export interface IDualAxisToggleParams {
    bucketLocalIdentifier: string;
    value: boolean;
}

export interface IDualAxisToggleResult extends IBucketItemEditResult {
    visualizationProperties: IVisualizationProperties;
}

export function toggleBucketsDualAxis(
    { buckets, referencePoint, visualizationProperties }: IDualAxisToggleInput,
    { bucketLocalIdentifier, value }: IDualAxisToggleParams,
    deps: IReferencePointSyncValues,
): IDualAxisToggleResult {
    const nextBuckets = toggleDualAxisInBuckets(buckets, bucketLocalIdentifier, value);

    return {
        buckets: nextBuckets,
        visualizationProperties: setDualAxisControl(visualizationProperties, value),
        referencePoint: syncReferencePoint(referencePoint, nextBuckets, deps.refPointFilters, deps.sortItems),
        isVisualizationMdObjectValid: false,
    };
}

/**
 * ONE bucket item's own properties changed. Commits the buckets, the re-synced reference point and
 * `isVisualizationMdObjectValid: false` — the flag is false because every one of these edits needs a
 * pluggable-visualization round trip before the metadata object is valid again.
 */
export function editBucketItem(
    { buckets, referencePoint }: IBucketItemEditInput,
    edit: BucketItemEdit,
    deps: IBucketItemEditDeps,
): IBucketItemEditResult | undefined {
    const editedBuckets = editBucketsForItem(buckets, edit, deps);
    if (editedBuckets === undefined) {
        return undefined;
    }

    return {
        buckets: editedBuckets,
        referencePoint: syncReferencePoint(
            referencePoint,
            editedBuckets,
            deps.refPointFilters,
            deps.sortItems,
        ),
        isVisualizationMdObjectValid: false,
    };
}

// --- the three date-dataset triggers ---------------------------------------------------------------

/**
 * WHICH date items get re-pointed. The three `SET_*_DATE_DATASET` triggers differ only in how they
 * address them, which is why {@link setBucketItemsDateDataset} takes the target as ONE object:
 *
 * - `SET_ALL_BUCKETS_DATE_DATASET` names neither, so every date item in every bucket follows;
 * - `SET_BUCKET_ITEM_DATE_DATASET` names the ITEM;
 * - `SET_BUCKET_DATE_DATASET` names the item AND the bucket whose date items synchronize with it.
 */
export interface IBucketsDateDatasetChangeParams {
    dateDatasetRef: ObjRef;
    bucketItemLocalIdentifier?: string;
    bucketLocalIdentifier?: string;
}

export interface IBucketsDateDatasetChangeDeps extends IReferencePointSyncValues {
    dateDatasetByRef: DateDatasetByRefResolver;
}

/** Same three values as an edit — the difference is entirely in the flag, see below. */
export type IBucketsDateDatasetChangeResult = IBucketItemEditResult;

/**
 * Re-points date bucket items at another date dataset.
 *
 * `isVisualizationMdObjectValid` is **true**, and this is the whole reason the operation is not just
 * another {@link BucketItemEdit}: a dataset change needs no passthrough react-component round trip, so
 * the metadata object is valid immediately.
 */
export function changeBucketsDateDataset(
    { buckets, referencePoint }: IBucketItemEditInput,
    { dateDatasetRef, bucketItemLocalIdentifier, bucketLocalIdentifier }: IBucketsDateDatasetChangeParams,
    deps: IBucketsDateDatasetChangeDeps,
): IBucketsDateDatasetChangeResult {
    const nextBuckets = setBucketItemsDateDataset(
        buckets,
        dateDatasetRef,
        { bucketItemLocalIdentifier, bucketLocalIdentifier },
        deps.dateDatasetByRef,
    );

    return {
        buckets: nextBuckets,
        referencePoint: syncReferencePoint(referencePoint, nextBuckets, deps.refPointFilters, deps.sortItems),
        isVisualizationMdObjectValid: true,
    };
}

// --- picking another visualization type ------------------------------------------------------------

/**
 * The narrowest operation of the family: it reads NOTHING. The payload is the class, the extended
 * reference point is CLEARED so the next plug-viz answer is authoritative, and the metadata object is
 * invalid until that answer arrives.
 *
 * `extendedReferencePoint: undefined` is a WRITE of undefined, not a deleted key. The two shapes are
 * indistinguishable to every reader: `getExtendedReferencePoint` answers `undefined` either way, and
 * the only `Object.keys` reader tests emptiness.
 */
export interface IVisualizationTypeSelectionResult {
    visualizationClass: IVisualizationClass;
    extendedReferencePoint: undefined;
    isVisualizationMdObjectValid: boolean;
}

export function selectVisualizationType(
    visualizationClass: IVisualizationClass,
): IVisualizationTypeSelectionResult {
    return {
        visualizationClass,
        extendedReferencePoint: undefined,
        isVisualizationMdObjectValid: false,
    };
}

// --- the buckets-meta expansion markers -----------------------------------------------------------

/**
 * `BUCKETS_TOGGLE_BUCKET_ITEM_EXPANDED` is NOT a cascade: it writes `bucketsMeta` and nothing else, so
 * it is a plain slice case with no saga, no event and no reference-point sync. The value rule lives
 * here because the slice case is its only caller.
 *
 * Toggling means: expanding a different item collapses the previous one, and expanding the one that is
 * already expanded collapses it — the marker becomes `undefined` and the key stays PRESENT.
 * `time_travel.ts` deletes it outright on a restore, because the readers there distinguish absent from
 * present-undefined.
 */
export function toggleBucketItemExpandedInMeta(
    bucketsMeta: IBucketsMetaState,
    item: IRawBucketItem,
): IBucketsMetaState {
    const marker = isDate(item) || isAttribute(item) ? "attributeExpanded" : "measureExpanded";
    const localIdentifier: string | undefined = item?.localIdentifier;
    const nextExpanded = bucketsMeta[marker] === localIdentifier ? undefined : localIdentifier;

    // The `in` clause is what MAKES the key present: an absent marker toggled to `undefined` must
    // still be written, because the restore path distinguishes absent from present-undefined.
    if (bucketsMeta[marker] === nextExpanded && marker in bucketsMeta) {
        return bucketsMeta;
    }
    return { ...bucketsMeta, [marker]: nextExpanded };
}
