// (C) 2026 GoodData Corporation

import { omit } from "lodash-es";

import { type ISortItem, type ObjRef, areObjRefsEqual, isObjRef } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type IExtendedReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { findMasterMeasure, isDate } from "../../models/bucket_item.js";
import { type IRawBucket, type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { setFilterItems } from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";
import { validateVisualizationProperties } from "../reference_point/extended_reference_point_helpers.js";
import {
    type IExtendedRefPointBucket,
    type IExtendedRefPointBucketItem,
    type IExtendedRefPointBuckets,
    type IExtendedRefPointDisplayForm,
    type IExtendedReferencePointState,
} from "../reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "../reference_point/reference_point_state.js";
import {
    type IReferencePointSyncValues,
    syncReferencePoint,
} from "../reference_point/reference_point_sync.js";

import {
    type DateDatasetByRefResolver,
    syncDateBucketItemGranularityAndDfRef,
} from "./buckets_date_helpers.js";
import { mirrorTotalsToDerivedMeasures, sanitizeTotals } from "./buckets_totals_helpers.js";
import { type CatalogItemTypeResolver, sanitizeReferencePointFormats } from "./helpers/measure_format.js";
import { clearNewDerivedBucketItems, getNewDerivedBucketItems } from "./pluggable_visualization_helpers.js";
import { type IPluggableVisualizationState } from "./pluggable_visualization_state.js";

/**
 * THE TWO OPERATIONS BEHIND A PLUGGABLE-VISUALIZATION ANSWER.
 *
 * The round trip is: AD hands the plug viz a reference point, the plug viz answers an EXTENDED
 * reference point, and AD applies it — with three edits of its own, all of them here (the format
 * sanitization, the date granularity re-sync and the geo display-form normalization). The second
 * operation is the tail of the same trip: when AD had queued derived measures, the plug viz places
 * them and the queue is emptied.
 *
 * The geo block's identity discipline is load-bearing, and the reason it is written with
 * `mapCollection` rather than `Array.map`: it must return the SAME buckets when nothing normalized,
 * because rebuilding the arrays would dirty the subtree on every plug-viz answer.
 */

const GEO_DISPLAY_FORM_PREFIX = "GDC.geo.";
const TEXT_DISPLAY_FORM_TYPE = "GDC.text";

function toObjRef(value: unknown): ObjRef | undefined {
    return value && isObjRef(value) ? value : undefined;
}

function isGeoDisplayFormType(type: string | undefined): boolean {
    return Boolean(type?.startsWith(GEO_DISPLAY_FORM_PREFIX));
}

function isTextDisplayFormType(type: string | undefined): boolean {
    return !type || type === TEXT_DISPLAY_FORM_TYPE || type === "displayForm";
}

function getDisplayForms(item: IExtendedRefPointBucketItem): IExtendedRefPointDisplayForm[] {
    return item.displayForms ?? [];
}

function getDefaultDisplayFormRef(item: IExtendedRefPointBucketItem): ObjRef | undefined {
    const displayForms = getDisplayForms(item);
    if (!displayForms.length) {
        return undefined;
    }
    const defaultDisplayForm =
        displayForms.find((df) => df.isDefault) ?? displayForms.find((df) => df.isPrimary) ?? displayForms[0];
    return toObjRef(defaultDisplayForm?.ref);
}

function getDisplayFormTypeByRef(
    item: IExtendedRefPointBucketItem,
    displayFormRef: ObjRef | undefined,
): string | undefined {
    if (!displayFormRef) {
        return undefined;
    }

    const matchingDisplayForm = getDisplayForms(item).find((df) => {
        const ref = toObjRef(df.ref);
        return ref && areObjRefsEqual(ref, displayFormRef);
    });

    return matchingDisplayForm?.type;
}

function getPreferredTextDisplayFormRef(item: IExtendedRefPointBucketItem): ObjRef | undefined {
    const displayForms = getDisplayForms(item);
    if (!displayForms.length) {
        return undefined;
    }

    const textDisplayForms = displayForms.filter((df) => isTextDisplayFormType(df.type));
    const preferredDisplayForm = textDisplayForms.find((df) => df.isDefault) ?? textDisplayForms[0];
    return toObjRef(preferredDisplayForm?.ref);
}

function normalizeGeoDisplayForm(
    item: IExtendedRefPointBucketItem,
    geoDisplayFormRef: ObjRef | undefined,
    defaultDfRef: ObjRef | undefined,
    resetDfRef: boolean = true,
): IExtendedRefPointBucketItem {
    if (!geoDisplayFormRef) {
        return item;
    }

    let normalized = item;
    const displayFormRef = toObjRef(item.displayForm);
    if (displayFormRef && areObjRefsEqual(displayFormRef, geoDisplayFormRef)) {
        normalized = omit(normalized, "displayForm");
    }

    if (resetDfRef && defaultDfRef) {
        const dfRef = toObjRef(item.dfRef);
        if (dfRef && areObjRefsEqual(dfRef, geoDisplayFormRef)) {
            normalized = { ...normalized, dfRef: defaultDfRef };
        }
    }

    return normalized;
}

/**
 * The ERP bucket-item family and the STATE bucket-item family (`typings/buckets.ts`) are the same shapes
 * behind different declared types — `aggregation`, for one, is a boolean in the plug-viz contract and a
 * string in AD's state. The date-granularity sync reads only keys the two agree on (`type`,
 * `dateDatasetRef`, `granularity`, `dfRef`) and returns its input UNCHANGED when there is nothing to
 * sync, so the crossing is confined to this one function.
 *
 * The dataset lookup is the caller's, handed in as a lazy resolver, which is what keeps this
 * function independent of the root state.
 */
function syncErpDateItem(
    item: IExtendedRefPointBucketItem,
    dateDatasetByRef: DateDatasetByRefResolver,
): IExtendedRefPointBucketItem {
    const stateShapedItem = item as unknown as IRawBucketItem;
    if (!isDate(stateShapedItem)) {
        return item;
    }

    const dateDatasetRef: ObjRef | undefined = stateShapedItem?.dateDatasetRef;

    return syncDateBucketItemGranularityAndDfRef(
        stateShapedItem,
        dateDatasetRef ? dateDatasetByRef(dateDatasetRef) : undefined,
    ) as unknown as IExtendedRefPointBucketItem;
}

/**
 * Points a geo bucket's item back at its geo-capable display form, and returns the item UNCHANGED when it
 * already points there — so `mapCollection` can keep the items array.
 */
function restoreGeoDisplayForm(
    item: IExtendedRefPointBucketItem,
    geoDisplayFormRef: ObjRef,
): IExtendedRefPointBucketItem {
    const dfRef = toObjRef(item.dfRef);
    const alreadyRestored = Boolean(dfRef && areObjRefsEqual(dfRef, geoDisplayFormRef));
    if (alreadyRestored && item.displayForm === undefined) {
        return item;
    }
    return omit({ ...item, dfRef: geoDisplayFormRef }, "displayForm");
}

/**
 * Applies an update to every EXTENDED REFERENCE POINT bucket, keeping the collection when no bucket
 * changed. The ERP buckets are their own family (`IExtendedRefPointBucket*`), so they get their own
 * pair rather than sharing the raw-buckets operations.
 */
function updateEveryErpBucket(
    buckets: IExtendedRefPointBuckets,
    updater: (bucket: IExtendedRefPointBucket) => IExtendedRefPointBucket,
): IExtendedRefPointBuckets {
    let nextBuckets: IExtendedRefPointBucket[] | undefined;

    for (let i = 0; i < buckets.length; i += 1) {
        const bucket = buckets[i];
        const nextBucket = updater(bucket);
        if (nextBucket !== bucket) {
            nextBuckets ??= buckets.slice();
            nextBuckets[i] = nextBucket;
        }
    }

    return nextBuckets ?? buckets;
}

/** The items half of {@link updateEveryErpBucket}: identity when no item changed. */
function updateEveryErpBucketItem(
    items: IExtendedRefPointBucketItem[],
    updater: (item: IExtendedRefPointBucketItem) => IExtendedRefPointBucketItem,
): IExtendedRefPointBucketItem[] {
    let nextItems: IExtendedRefPointBucketItem[] | undefined;

    for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const nextItem = updater(item);
        if (nextItem !== item) {
            nextItems ??= items.slice();
            nextItems[i] = nextItem;
        }
    }

    return nextItems ?? items;
}

export function normalizeGeoDisplayFormsInBuckets(
    buckets: IExtendedRefPointBuckets,
    shouldAutoSwitchGeoToText: boolean,
): IExtendedRefPointBuckets {
    return updateEveryErpBucket(buckets, (bucket: IExtendedRefPointBucket) => {
        const bucketLocalIdentifier = bucket.localIdentifier;
        const isAreaBucket = bucketLocalIdentifier === BucketNames.AREA;
        const isLocationBucket = bucketLocalIdentifier === BucketNames.LOCATION;

        const items = updateEveryErpBucketItem(bucket.items ?? [], (item: IExtendedRefPointBucketItem) => {
            const defaultDfRef = getDefaultDisplayFormRef(item);
            const areaDisplayFormRef = toObjRef(item.areaDisplayFormRef);
            const locationDisplayFormRef = toObjRef(item.locationDisplayFormRef);
            const selectedDfRef = toObjRef(item.dfRef);
            const selectedDfType = getDisplayFormTypeByRef(item, selectedDfRef);
            const isSelectedGeoRef =
                Boolean(
                    selectedDfRef && areaDisplayFormRef && areObjRefsEqual(selectedDfRef, areaDisplayFormRef),
                ) ||
                Boolean(
                    selectedDfRef &&
                    locationDisplayFormRef &&
                    areObjRefsEqual(selectedDfRef, locationDisplayFormRef),
                );

            let normalized = item;
            if (!isAreaBucket) {
                normalized = normalizeGeoDisplayForm(normalized, areaDisplayFormRef, defaultDfRef, false);
            }
            if (!isLocationBucket) {
                // Clear auto-resolved location display form; non-geo bucket behavior
                // (auto-switching geo labels to text) is handled explicitly below.
                normalized = normalizeGeoDisplayForm(normalized, locationDisplayFormRef, defaultDfRef, false);
            }

            // In non-geo visualizations, auto-switch geo labels (latitude/longitude/location/area)
            // to the preferred text display form so table-like outputs stay readable by default.
            if (
                shouldAutoSwitchGeoToText &&
                !isAreaBucket &&
                !isLocationBucket &&
                (isGeoDisplayFormType(selectedDfType) || isSelectedGeoRef)
            ) {
                const preferredTextDfRef = getPreferredTextDisplayFormRef(normalized) ?? defaultDfRef;
                if (preferredTextDfRef) {
                    normalized = {
                        ...normalized,
                        dfRef: preferredTextDfRef,
                        displayForm: preferredTextDfRef,
                    };
                }
            }

            // In geo buckets, always restore geo-capable display forms.
            if (isAreaBucket && areaDisplayFormRef) {
                normalized = restoreGeoDisplayForm(normalized, areaDisplayFormRef);
            }
            if (isLocationBucket && locationDisplayFormRef) {
                normalized = restoreGeoDisplayForm(normalized, locationDisplayFormRef);
            }

            return normalized;
        });

        return items === bucket.items ? bucket : { ...bucket, items };
    });
}

// --- applying the answer ---------------------------------------------------------------------------

export interface IExtendedReferencePointAppliedInput {
    buckets: IRawBuckets;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    /** the CURRENT `data.visualizationProperties.sortItems`, the fallback when the answer carries none */
    sortItems: ISortItem[] | undefined;
}

export interface IExtendedReferencePointAppliedParams {
    /** what the pluggable visualization answered, verbatim */
    extendedReferencePoint: IExtendedReferencePoint;
}

export interface IExtendedReferencePointAppliedDeps {
    /** the filter bar's own conversion of the answer's filters bucket */
    convertFromExtendedRefPointFilters: (
        filters: IExtendedReferencePoint["filters"],
    ) => ReadonlyArray<IFilter>;
    catalogItemType: CatalogItemTypeResolver;
    dateDatasetByRef: DateDatasetByRefResolver;
    /** `enableNewPivotTable`, for the totals re-pointing */
    reorderByMeasures: boolean;
}

export interface IExtendedReferencePointAppliedResult {
    extendedReferencePoint: IExtendedReferencePointState;
    buckets: IRawBuckets;
    sortItems: ISortItem[] | undefined;
    filterBar: IFilterBarState;
    referencePoint: IReferencePointState | undefined;
    isVisualizationMdObjectValid: boolean;
}

/**
 * Applies a pluggable visualization's answer.
 *
 * FOUR FACTS THE SIGNATURES DO NOT SHOW:
 *
 * 1. `data.buckets` and `extendedReferencePoint.buckets` end up holding ONE value BY REFERENCE — the
 *    normalized buckets — and every writer of either is copy-on-write;
 * 2. `sanitizeTotals` runs LAST and rewrites `data.buckets`, but the reference point's copy (written
 *    in the `firstRender` branch above it) keeps the PRE-sanitize value: deep-equal, different
 *    reference. Moving the sync would change identity;
 * 3. the reference point's `filters` in that branch gets the answer's OWN filters bucket, NOT the
 *    filter-bar conversion the extended reference point is stored with;
 * 4. `firstRender` is a ONE-SHOT: open-report sets it, the first answer consumes it, and the key is
 *    DELETED rather than set false — the readers distinguish absent from present.
 *
 * There is no `syncReferencePoint` call here at all. That is deliberate: this operation does not sync the
 * reference point, it SEEDS it on the first answer and leaves it alone afterwards.
 */
/**
 * Seeds the reference point from the extended one, CONSUMING the one-shot `firstRender` flag: the key
 * is dropped outright rather than set to `false`, because the readers test for its presence.
 */
function seedReferencePointOnce(
    referencePoint: IReferencePointState,
    buckets: IRawBuckets,
    filters: IReferencePointState["filters"],
): IReferencePointState {
    const { firstRender: _consumed, ...seeded } = { ...referencePoint, buckets, filters };
    return seeded;
}

export function applyExtendedReferencePoint(
    input: IExtendedReferencePointAppliedInput,
    { extendedReferencePoint }: IExtendedReferencePointAppliedParams,
    deps: IExtendedReferencePointAppliedDeps,
): IExtendedReferencePointAppliedResult {
    const filtersExtended = deps.convertFromExtendedRefPointFilters(extendedReferencePoint.filters);

    const withFormats = sanitizeReferencePointFormats(
        input.referencePoint,
        extendedReferencePoint,
        deps.catalogItemType,
    );

    const sortItems = withFormats?.properties?.sortItems ?? input.sortItems;

    const erpBuckets = (withFormats.buckets ?? []) as unknown as IExtendedRefPointBuckets;
    const syncedBuckets = updateEveryErpBucket(erpBuckets, (bucket: IExtendedRefPointBucket) => {
        const items = updateEveryErpBucketItem(bucket.items ?? [], (item: IExtendedRefPointBucketItem) =>
            syncErpDateItem(item, deps.dateDatasetByRef),
        );
        return items === bucket.items ? bucket : { ...bucket, items };
    });

    const hasGeoBucket = (localIdentifier: string | undefined) =>
        localIdentifier === BucketNames.LOCATION || localIdentifier === BucketNames.AREA;
    const previousHasGeoBuckets = input.buckets.some((bucket: IRawBucket) =>
        hasGeoBucket(bucket?.localIdentifier),
    );
    const nextHasGeoBuckets = syncedBuckets.some((bucket) => hasGeoBucket(bucket.localIdentifier));

    const normalizedBuckets = normalizeGeoDisplayFormsInBuckets(
        syncedBuckets,
        previousHasGeoBuckets && !nextHasGeoBuckets,
    );

    const nextExtendedReferencePoint: IExtendedReferencePointState = {
        ...withFormats,
        filters: filtersExtended,
        buckets: normalizedBuckets,
    };

    const stateShapedBuckets = normalizedBuckets as unknown as IRawBuckets;

    // fact 3 and fact 4: the reference point is seeded from the answer, once
    const referencePoint = input.referencePoint?.firstRender
        ? seedReferencePointOnce(
              input.referencePoint,
              stateShapedBuckets,
              extendedReferencePoint.filters as IReferencePointState["filters"],
          )
        : input.referencePoint;

    return {
        extendedReferencePoint: nextExtendedReferencePoint,
        // fact 2: the sanitization lands on data.buckets only
        buckets: sanitizeTotals(input.buckets, stateShapedBuckets, {
            reorderByMeasures: deps.reorderByMeasures,
        }),
        sortItems,
        filterBar: setFilterItems(input.filterBar, filtersExtended),
        referencePoint,
        isVisualizationMdObjectValid: true,
    };
}

// --- the plug viz placed the queued derived measures -----------------------------------------------

export interface IDerivedBucketItemsPlacedInput {
    extendedReferencePoint: IExtendedReferencePointState | undefined;
    pluggableVisualization: IPluggableVisualizationState | undefined;
    referencePoint: IReferencePointState | undefined;
}

export interface IDerivedBucketItemsPlacedParams {
    /** the reference point the plug viz answered with; its buckets BECOME `data.buckets` */
    buckets: IRawBuckets;
}

export interface IDerivedBucketItemsPlacedResult {
    buckets: IRawBuckets;
    extendedReferencePoint: IExtendedReferencePointState;
    pluggableVisualization: IPluggableVisualizationState;
    referencePoint: IReferencePointState;
    isVisualizationMdObjectValid: boolean;
}

/**
 * The plug viz has placed the derived measures AD queued, so the queue is emptied and each new derived
 * measure inherits its master's totals.
 *
 * The answer's buckets REPLACE `data.buckets` wholesale — this is the one operation that does not
 * transform the buckets it was given. The mirroring then folds over the QUEUE (not over the answer), so a
 * queue the plug viz ignored mirrors nothing, and `clearNewDerivedBucketItems` is identity-guarded so an
 * already-empty queue does not rebuild the subtree.
 */
export function applyPlacedDerivedBucketItems(
    input: IDerivedBucketItemsPlacedInput,
    { buckets }: IDerivedBucketItemsPlacedParams,
    deps: IReferencePointSyncValues,
): IDerivedBucketItemsPlacedResult {
    let nextBuckets = buckets;

    for (const newDerivedBucketItem of getNewDerivedBucketItems(input.pluggableVisualization)) {
        const masterMeasure = findMasterMeasure(newDerivedBucketItem, nextBuckets);
        nextBuckets = mirrorTotalsToDerivedMeasures(nextBuckets, masterMeasure);
    }

    return {
        buckets: nextBuckets,
        extendedReferencePoint: validateVisualizationProperties(input.extendedReferencePoint, nextBuckets),
        pluggableVisualization: clearNewDerivedBucketItems(input.pluggableVisualization),
        referencePoint: syncReferencePoint(
            input.referencePoint,
            nextBuckets,
            deps.refPointFilters,
            deps.sortItems,
        ),
        isVisualizationMdObjectValid: false,
    };
}
