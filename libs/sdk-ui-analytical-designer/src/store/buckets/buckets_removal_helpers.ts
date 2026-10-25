// (C) 2007-2026 GoodData Corporation

import { uniq } from "lodash-es";

import { type ObjRef } from "@gooddata/sdk-model";

import { isArithmeticMeasure, isDerived, isMeasure } from "../../models/bucket_item.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { bucketNotificationsWithRemovedItems } from "../bucket_notifications/bucket_notifications_helpers.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import {
    findMeasureValueFilterForMeasure,
    findMeasureValueFilters,
    findRankingFilter,
    removeFilters,
    storeFilter,
} from "../filter_bar/filter_bar_helpers.js";
import { type IFilterBarState } from "../filter_bar/filter_bar_state.js";
import { FilterBar, type IMeasureValueFilter, type IRankingFilter } from "../filter_bar/filter_bar_types.js";
import { validateVisualizationProperties } from "../reference_point/extended_reference_point_helpers.js";
import { type IExtendedReferencePointState } from "../reference_point/extended_reference_point_state.js";

import { isUnmodifiedAndAutoCreated, removeAutoCreatedMarker } from "./buckets_meta_helpers.js";
import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    findAllInvalidArithmeticMeasuresInBuckets,
    findAllReferencingArithmeticMeasuresInBuckets,
    getBucketByBucketItemLocalIdentifierInBuckets,
    getMeasuresInBuckets,
    getMeasuresWithoutArithmeticInBuckets,
    getSlicingBucketItemLocalIdentifiersInBuckets,
} from "./buckets_read_helpers.js";
import { sanitizeTotals } from "./buckets_totals_helpers.js";
import {
    findBucketItemInBuckets,
    findDerivedBucketItemsInBuckets,
    removeSingleBucketItemInBuckets,
} from "./buckets_write_helpers.js";
import { isCategoriesOrStacks } from "./helpers/bucket_item_predicates.js";
import {
    type BucketItemRefResolver,
    convertRemovedDimensionalityRefs,
    findFiltersRelyingOnSlicedInsight,
    isReferencedByRankingFilter,
} from "./helpers/filter_dependencies.js";

/**
 * REMOVING BUCKET ITEMS — the widest pure cross-domain calculation of the buckets cluster.
 *
 * It is genuinely cross-domain: removing one bucket item can take derived measures, arithmetic
 * measures, filters, filter dimensionality, auto-created markers, sort items and totals with it.
 * Hence the EXPLICIT named input and result, resolvers for the foreign lookups and named booleans for
 * the feature flags.
 *
 * **What it deliberately does NOT do:** re-sync the reference point or set
 * `isVisualizationMdObjectValid`. That tail belongs to the OPERATION, because the flag is an output of
 * the mutating gesture rather than reference-point state. {@link IRemoveBucketItemsResult} is
 * therefore the five domains this calculation decides, and nothing more.
 *
 * ORDER IS THE CONTRACT. Four facts are load-bearing and none of them is visible from the signatures:
 *
 * 1. the four filter sanitizers run BEFORE the "which filters must go" question. They convert filters
 *    that reference a disappearing bucket measure/attribute into catalog-`ObjRef` filters, and it is
 *    precisely that conversion which then makes them NOT count as having a missing dependency. Ask
 *    first and sanitize second and every such filter is silently deleted;
 * 2. the notification counts are taken from the SANITIZED filter bar but the ORIGINAL buckets — the
 *    measures are still there to be counted at that point, and the filters have already been rescued;
 * 3. the notification is computed BEFORE the filters are removed, for the same reason;
 * 4. `sanitizeTotals` compares the ORIGINAL buckets with the reduced ones, and it runs AFTER the
 *    sort-item validation, not before.
 *
 * IDENTITY, precisely: a removal that removes nothing answers FOUR of the five inputs by reference —
 * each sanitizer answers the filter bar it was given, `removeAutoCreatedMarker` answers the same
 * `bucketsMeta` for an item with no marker, `removeSingleBucketItemInBuckets` answers the same buckets
 * for an identifier that is not there. The FILTER BAR is the exception: the chain ends with an
 * unconditional `removeFilters`, and `setFilterItems` under it always builds `{...filterBar, items}`
 * with no identity guard, so it comes back deep-equal but rebuilt. Pinned in
 * `test/buckets_operations.test.ts`; adding the guard would be a behavior change (one fewer store
 * notification per no-op removal).
 */

/** Resolves a catalog metric's cache identifier to its `ObjRef`, or null. Backed by the item cache. */
export type CatalogMetricRefResolver = (metricIdentifier: string) => ObjRef | null;

export interface IRemoveBucketItemsInput {
    buckets: IRawBuckets;
    /** carries the `autoCreated` markers the removal drops, and the ones `getUneditedFilters` asks about */
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    /** absent until a pluggable visualization has answered — the sort-item validation tolerates that */
    extendedReferencePoint: IExtendedReferencePointState | undefined;
}

export interface IRemoveBucketItemsParams {
    localIdentifiers: ReadonlyArray<string>;
    /**
     * Report only the items removed AS DEPENDENCIES, not the ones asked for. Set by the replace-item
     * gestures, where the user knows perfectly well what they just replaced.
     */
    notifyOnlyAboutRemovedDependencies: boolean;
}

export interface IRemoveBucketItemsDeps {
    catalogMetricRef: CatalogMetricRefResolver;
    bucketItemRef: BucketItemRefResolver;
    /** `enableImprovedRankingFilter` */
    improvedRankingFilter: boolean;
    /** `enableNewPivotTable`, for the totals re-pointing */
    reorderByMeasures: boolean;
}

export interface IRemoveBucketItemsResult {
    buckets: IRawBuckets;
    bucketsMeta: IBucketsMetaState;
    filterBar: IFilterBarState;
    bucketNotifications: IBucketNotificationsState;
    extendedReferencePoint: IExtendedReferencePointState;
}

// --- what else has to go ---------------------------------------------------------------------------

/**
 * Everything that depends on `localIdentifier` — derived measures and arithmetic measures referencing
 * it, transitively. Recursive because a derived measure can itself be an arithmetic operand.
 */
export function getAllDependantBucketItems(buckets: IRawBuckets, localIdentifier: string): string[] {
    const bucketItem = findBucketItemInBuckets(buckets, localIdentifier);
    if (!bucketItem) {
        return [];
    }
    const derivedBucketItems = findDerivedBucketItemsInBuckets(buckets, bucketItem) as IRawBucketItem[];
    const referencingArithmeticMeasures = findAllReferencingArithmeticMeasuresInBuckets(
        buckets,
        bucketItem,
    ) as IRawBucketItem[];

    return uniq(
        [...derivedBucketItems, ...referencingArithmeticMeasures].flatMap((dependant: IRawBucketItem) => [
            dependant.localIdentifier,
            ...getAllDependantBucketItems(buckets, dependant.localIdentifier),
        ]),
    );
}

/**
 * An arithmetic measure needs two operands. Removing a measure can leave one with fewer, and those go
 * too — but only when the removal actually drops the measure count to the point where they cannot be
 * satisfied, which is what the `> 2` test approximates.
 *
 * `findDerivedBucketItemsInBuckets(buckets, undefined)` is deliberately unguarded for a local
 * identifier that is not in the buckets: `isDerivedFrom(item, undefined)` is TRUE for every
 * non-derived item, so the count is meaningless there — and irrelevant, because `isMeasure(undefined)`
 * is false and the function returns `[]` before the count is used.
 */
export function findInvalidArithmeticMeasuresForRemoval(
    buckets: IRawBuckets,
    removedBucketItemLocalIdentifier: string,
): string[] {
    const removedBucketItem = findBucketItemInBuckets(buckets, removedBucketItemLocalIdentifier);
    const derivedBucketItems = findDerivedBucketItemsInBuckets(buckets, removedBucketItem)?.length ?? 0;
    const measuresWithoutArithmeticCount = getMeasuresWithoutArithmeticInBuckets(buckets)?.length ?? 0;
    // the removed item may itself have derived bucket items, which are going away with it
    const remainingMeasuresAfterRemoval =
        derivedBucketItems === 0
            ? measuresWithoutArithmeticCount
            : measuresWithoutArithmeticCount - derivedBucketItems;

    if (remainingMeasuresAfterRemoval > 2 || !isMeasure(removedBucketItem)) {
        return [];
    }

    return (findAllInvalidArithmeticMeasuresInBuckets(buckets) as IRawBucketItem[]).map(
        (invalidArithmeticMeasure: IRawBucketItem) => invalidArithmeticMeasure.localIdentifier,
    );
}

// --- rescuing the filters that can survive ---------------------------------------------------------

/**
 * "Simple measure" in AD terms: a catalog metric sitting in a bucket with no aggregation, neither
 * arithmetic nor derived. Only those have a catalog `ObjRef` a filter can be re-pointed at.
 */
function isSimpleMetricBucketItem(bucketItem: IRawBucketItem): boolean {
    return (
        isMeasure(bucketItem) &&
        !isArithmeticMeasure(bucketItem) &&
        !isDerived(bucketItem) &&
        bucketItem?.aggregation == null
    );
}

/** The catalog `ObjRef` a filter can be re-pointed at, or null when there is none to point at. */
function resolveCatalogMetricRef(
    bucketItem: IRawBucketItem,
    catalogMetricRef: CatalogMetricRefResolver,
): ObjRef | null {
    const metricIdentifier = bucketItem?.attribute;
    return metricIdentifier ? catalogMetricRef(metricIdentifier) : null;
}

/**
 * Keeps the measure value filters of removed SIMPLE metrics alive by converting them from
 * `measureLocalIdentifier`- to `measureRef`-based, so they stay valid once the metric leaves the
 * buckets.
 */
function sanitizeMeasureValueFilterMeasures(
    filterBar: IFilterBarState,
    buckets: IRawBuckets,
    bucketItemsToRemove: string[],
    catalogMetricRef: CatalogMetricRefResolver,
): IFilterBarState {
    if (findMeasureValueFilters(filterBar).length === 0) {
        return filterBar;
    }

    let updatedFilterBar = filterBar;

    for (const localIdentifier of bucketItemsToRemove) {
        const bucketItem = findBucketItemInBuckets(buckets, localIdentifier);
        if (!bucketItem || !isSimpleMetricBucketItem(bucketItem)) {
            continue;
        }

        // the filter bar is re-read each round: an earlier iteration may already have stored one
        const dependantMeasureValueFilter = findMeasureValueFilterForMeasure(
            updatedFilterBar,
            localIdentifier,
        );
        if (!dependantMeasureValueFilter) {
            continue;
        }

        const measureRef = resolveCatalogMetricRef(bucketItem, catalogMetricRef);
        if (!measureRef) {
            continue;
        }

        const updatedFilter: IMeasureValueFilter = {
            ...dependantMeasureValueFilter,
            measureLocalIdentifier: undefined,
            measureRef,
        };

        updatedFilterBar = storeFilter(updatedFilterBar, updatedFilter);
    }

    return updatedFilterBar;
}

/** The ranking filter's mirror of {@link sanitizeMeasureValueFilterMeasures}. */
function sanitizeRankingFilterMeasures(
    filterBar: IFilterBarState,
    buckets: IRawBuckets,
    bucketItemsToRemove: string[],
    catalogMetricRef: CatalogMetricRefResolver,
): IFilterBarState {
    const rankingFilter = findRankingFilter(filterBar);
    if (!rankingFilter || !FilterBar.isBucketRankingFilter(rankingFilter)) {
        return filterBar;
    }
    if (!bucketItemsToRemove.includes(rankingFilter.measureLocalIdentifier)) {
        return filterBar;
    }

    const bucketItem = findBucketItemInBuckets(buckets, rankingFilter.measureLocalIdentifier);
    if (!bucketItem || !isSimpleMetricBucketItem(bucketItem)) {
        return filterBar;
    }

    const measureRef = resolveCatalogMetricRef(bucketItem, catalogMetricRef);
    if (!measureRef) {
        return filterBar;
    }

    const updatedFilter: IRankingFilter = {
        ...rankingFilter,
        measureLocalIdentifier: undefined,
        measureRef,
    };

    return storeFilter(filterBar, updatedFilter);
}

/**
 * Rewrites the measure value filters' DIMENSIONALITY: a removed attribute/date bucket item is promoted
 * to its catalog `ObjRef` so the filter keeps its granularity instead of being dropped as a dependant.
 */
function sanitizeMeasureValueFilterDimensionality(
    filterBar: IFilterBarState,
    bucketItemsToRemove: string[],
    bucketItemRef: BucketItemRefResolver,
): IFilterBarState {
    const measureValueFilters = findMeasureValueFilters(filterBar);
    if (measureValueFilters.length === 0) {
        return filterBar;
    }

    let updatedFilterBar = filterBar;

    for (const filter of measureValueFilters) {
        const { dimensionality } = filter;
        if (!dimensionality || dimensionality.length === 0) {
            continue;
        }

        // unresolvable entries stay as their local identifier — existing filter validation handles them
        const { items, changed } = convertRemovedDimensionalityRefs(
            dimensionality,
            bucketItemsToRemove,
            bucketItemRef,
        );

        if (changed) {
            const updatedFilter: IMeasureValueFilter = {
                ...filter,
                dimensionality: items,
            };
            updatedFilterBar = storeFilter(updatedFilterBar, updatedFilter);
        }
    }

    return updatedFilterBar;
}

/**
 * The improved ranking filter's "out of" attributes, treated exactly like the measure value filter's
 * dimensionality. Never silently dropped: re-pointing the ranking at the REMAINING attributes would be
 * a wrong result rather than an error.
 */
function sanitizeRankingFilterAttributes(
    filterBar: IFilterBarState,
    bucketItemsToRemove: string[],
    bucketItemRef: BucketItemRefResolver,
    improvedRankingFilter: boolean,
): IFilterBarState {
    if (!improvedRankingFilter) {
        return filterBar;
    }
    const rankingFilter = findRankingFilter(filterBar);
    if (!rankingFilter?.attributes?.length) {
        return filterBar;
    }

    const { items, changed } = convertRemovedDimensionalityRefs(
        rankingFilter.attributes,
        bucketItemsToRemove,
        bucketItemRef,
    );
    if (!changed) {
        return filterBar;
    }

    const updatedFilter: IRankingFilter = {
        ...rankingFilter,
        attributes: items,
    };
    return storeFilter(filterBar, updatedFilter);
}

// --- which filters cannot survive ------------------------------------------------------------------

/**
 * The attribute/date filters the app created for `cacheItemIdentifier` and the user never touched — the
 * only ones it may remove on their behalf. Measure value and ranking filters are excluded: they are
 * never auto-created.
 */
export function getUneditedFilters(
    filterBar: IFilterBarState,
    bucketsMeta: IBucketsMetaState,
    cacheItemIdentifier: string,
): string[] {
    return filterBar.items
        .filter(
            (filter) =>
                !FilterBar.isMeasureValueFilter(filter) &&
                !FilterBar.isRankingFilter(filter) &&
                filter.cacheItemIdentifier === cacheItemIdentifier &&
                isUnmodifiedAndAutoCreated(cacheItemIdentifier, bucketsMeta),
        )
        .map((filter) => filter.localIdentifier);
}

function getAllDependantFilters(
    filterBar: IFilterBarState,
    buckets: IRawBuckets,
    bucketsMeta: IBucketsMetaState,
    localIdentifier: string,
    improvedRankingFilter: boolean,
): string[] {
    const bucketItem = findBucketItemInBuckets(buckets, localIdentifier);
    if (!bucketItem) {
        return [];
    }
    const bucket = getBucketByBucketItemLocalIdentifierInBuckets(buckets, localIdentifier);

    const dependantFilters: string[] = [];

    if (isCategoriesOrStacks(bucket?.localIdentifier)) {
        dependantFilters.push(...getUneditedFilters(filterBar, bucketsMeta, bucketItem?.attribute));
    }

    const dependantMeasureValueFilter = findMeasureValueFilterForMeasure(filterBar, localIdentifier);
    if (dependantMeasureValueFilter) {
        dependantFilters.push(dependantMeasureValueFilter.localIdentifier);
    }

    const rankingFilter = findRankingFilter(filterBar);
    if (isReferencedByRankingFilter(rankingFilter, localIdentifier, improvedRankingFilter)) {
        dependantFilters.push(rankingFilter.localIdentifier);
    }

    return dependantFilters;
}

function findFiltersToRemove(
    filterBar: IFilterBarState,
    buckets: IRawBuckets,
    bucketsMeta: IBucketsMetaState,
    bucketItemsToRemove: string[],
    improvedRankingFilter: boolean,
): string[] {
    const remainingSlicingBucketItems = getSlicingBucketItemLocalIdentifiersInBuckets(buckets).filter(
        (localIdentifier) => !bucketItemsToRemove.includes(localIdentifier),
    );

    const invalidFiltersFromNoLongerSlicedInsight =
        remainingSlicingBucketItems.length === 0
            ? findFiltersRelyingOnSlicedInsight(
                  findRankingFilter(filterBar),
                  findMeasureValueFilters(filterBar),
                  improvedRankingFilter,
              )
            : [];

    const invalidFiltersWithMissingDependency = bucketItemsToRemove.flatMap((localIdentifier) =>
        getAllDependantFilters(filterBar, buckets, bucketsMeta, localIdentifier, improvedRankingFilter),
    );

    return uniq([...invalidFiltersWithMissingDependency, ...invalidFiltersFromNoLongerSlicedInsight]);
}

// --- telling the user what disappeared -------------------------------------------------------------

/**
 * The "we removed these for you" banner's counts. Identity when nothing worth reporting happened —
 * a removal of plain attributes reports nothing, and must not rebuild the notifications subtree.
 */
function bucketNotificationsAfterRemoval(
    bucketNotifications: IBucketNotificationsState,
    buckets: IRawBuckets,
    filterBar: IFilterBarState,
    bucketItemsToRemove: string[],
    filtersToRemove: string[],
): IBucketNotificationsState {
    const numberOfMeasuresToRemove = (getMeasuresInBuckets(buckets) as IRawBucketItem[]).filter(
        (measure: IRawBucketItem) => bucketItemsToRemove.includes(measure.localIdentifier),
    ).length;

    const numberOfMeasureValueFiltersToRemove = findMeasureValueFilters(filterBar).filter(
        (filter: IMeasureValueFilter) => filtersToRemove.includes(filter.localIdentifier),
    ).length;

    const rankingFilter = findRankingFilter(filterBar);
    const wasRankingFilterRemoved =
        rankingFilter !== null && filtersToRemove.includes(rankingFilter.localIdentifier);

    if (
        numberOfMeasuresToRemove === 0 &&
        numberOfMeasureValueFiltersToRemove === 0 &&
        !wasRankingFilterRemoved
    ) {
        return bucketNotifications;
    }

    return bucketNotificationsWithRemovedItems(bucketNotifications, {
        measures: numberOfMeasuresToRemove,
        measureValueFilters: numberOfMeasureValueFiltersToRemove,
        rankingFilter: wasRankingFilterRemoved,
    });
}

// --- the operation ---------------------------------------------------------------------------------

export function removeBucketItemsWithDependencies(
    { buckets, bucketsMeta, filterBar, bucketNotifications, extendedReferencePoint }: IRemoveBucketItemsInput,
    { localIdentifiers, notifyOnlyAboutRemovedDependencies }: IRemoveBucketItemsParams,
    { catalogMetricRef, bucketItemRef, improvedRankingFilter, reorderByMeasures }: IRemoveBucketItemsDeps,
): IRemoveBucketItemsResult {
    const dependantBucketItemsToRemove = localIdentifiers.flatMap((localIdentifier) =>
        getAllDependantBucketItems(buckets, localIdentifier),
    );
    const invalidArithmeticMeasuresToRemove = localIdentifiers.flatMap((localIdentifier) =>
        findInvalidArithmeticMeasuresForRemoval(buckets, localIdentifier),
    );
    const bucketItemsToRemove = uniq([
        ...localIdentifiers,
        ...dependantBucketItemsToRemove,
        ...invalidArithmeticMeasuresToRemove,
    ]);

    // rescue first, decide second (see fact 1 in the module note)
    let updatedFilterBar = sanitizeMeasureValueFilterMeasures(
        filterBar,
        buckets,
        bucketItemsToRemove,
        catalogMetricRef,
    );
    updatedFilterBar = sanitizeRankingFilterMeasures(
        updatedFilterBar,
        buckets,
        bucketItemsToRemove,
        catalogMetricRef,
    );
    updatedFilterBar = sanitizeMeasureValueFilterDimensionality(
        updatedFilterBar,
        bucketItemsToRemove,
        bucketItemRef,
    );
    updatedFilterBar = sanitizeRankingFilterAttributes(
        updatedFilterBar,
        bucketItemsToRemove,
        bucketItemRef,
        improvedRankingFilter,
    );

    const filtersToRemove = findFiltersToRemove(
        updatedFilterBar,
        buckets,
        bucketsMeta,
        bucketItemsToRemove,
        improvedRankingFilter,
    );

    const notifiedRemovedBucketItems = notifyOnlyAboutRemovedDependencies
        ? [...dependantBucketItemsToRemove, ...invalidArithmeticMeasuresToRemove]
        : bucketItemsToRemove;

    const updatedBucketNotifications = bucketNotificationsAfterRemoval(
        bucketNotifications,
        buckets,
        updatedFilterBar,
        notifiedRemovedBucketItems,
        filtersToRemove,
    );

    updatedFilterBar = removeFilters(updatedFilterBar, filtersToRemove);

    let updatedBuckets = buckets;
    let updatedBucketsMeta = bucketsMeta;
    for (const localIdentifier of bucketItemsToRemove) {
        // re-looked up against the progressively reduced buckets
        const bucketItem = findBucketItemInBuckets(updatedBuckets, localIdentifier);
        if (!bucketItem) {
            continue;
        }
        updatedBucketsMeta = removeAutoCreatedMarker(updatedBucketsMeta, bucketItem?.attribute);
        updatedBuckets = removeSingleBucketItemInBuckets(updatedBuckets, localIdentifier);
    }

    const updatedExtendedReferencePoint = validateVisualizationProperties(
        extendedReferencePoint,
        updatedBuckets,
    );
    updatedBuckets = sanitizeTotals(buckets, updatedBuckets, { reorderByMeasures });

    return {
        buckets: updatedBuckets,
        bucketsMeta: updatedBucketsMeta,
        filterBar: updatedFilterBar,
        bucketNotifications: updatedBucketNotifications,
        extendedReferencePoint: updatedExtendedReferencePoint,
    };
}
