// (C) 2019-2026 GoodData Corporation

import invariant from "invariant";
import { isEqual, omitBy, union } from "lodash-es";

import { type IAttributeFilterConfigs, type ObjRef, areObjRefsEqual, idRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType } from "@gooddata/sdk-ui";
import {
    type IFilters,
    type IFiltersBucketItem,
    type IAttributeFilter as IVisAttributeFilter,
    type IDateFilter as IVisDateFilter,
    type IMeasureValueFilter as IVisMeasureValueFilter,
    type IRankingFilter as IVisRankingFilter,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
} from "@gooddata/sdk-ui-ext/internal";

import { generateBucketItemIdentifier } from "../../models/bucket_item_identifier.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type Granularity } from "../../models/granularity.js";
import { type IRawBucketItems } from "../../typings/buckets.js";
import {
    type IDateDatasetRefWithGranularities,
    type IGranularityOptionWithRefs,
} from "../../typings/datasets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import {
    type IRefPointFilterItem,
    type IRefPointFiltersBucket,
} from "../reference_point/reference_point_state.js";

import { type IFilterBarState } from "./filter_bar_state.js";
import {
    type EmptyDateValuesFilterMode,
    FilterBar,
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeFilterConfig,
    type IDateFilter,
    type IDateFilterConfig,
    type IFilter,
    type IMeasureValueFilter,
    type IRankingFilter,
    type TextModeFilterData,
    normalizeMeasureValueFilterConditions,
} from "./filter_bar_types.js";
import { type IParameterFilter } from "./parameter_filter_types.js";

/**
 * THE FILTER BAR'S NARROW PURE HELPERS.
 *
 * Every operation over `data.filterBar` takes the DOMAIN VALUE plus explicit arguments and answers a
 * new `IFilterBarState` — never the root state, never a path, never a selector.
 *
 * Foreign lookups arrive as ARGUMENTS: the additional-date-filter operations take the date-dataset
 * attributes (their `dfRef` is the whole dependency) instead of reaching for the date-datasets
 * domain, which is what makes them unit-testable without a store.
 *
 * The value-level FINDERS below are also what `filter_bar_selector.ts` delegates to — one
 * implementation, two entry points — so a saga operation and a component read the same semantics.
 *
 * IDENTITY: `updateDateFilter` short-circuits on deep equality and answers the SAME reference.
 * Everything else rebuilds, because every write goes through {@link normalizeFilterBar}, which
 * always rebuilds `items`. Both directions are pinned in the specs.
 */

/** `IBucketFilter` is not on the internal barrel — derived from the bucket item that carries it. */
type SdkBucketFilter = NonNullable<IFiltersBucketItem["filters"]>[number];

/**
 * All a date-dataset attribute has to expose for the additional-date-filter matching: the display
 * form it is filtered by. Both producers satisfy it — the date-datasets META items
 * (`getAdditionalDateAttributeFilters`) and the granularity options (`resetAdditionalDateFilters`).
 * Exported: the date-filter operation's deps carry the flattened list under this type.
 */
export interface IDateAttributeWithDisplayForm {
    dfRef?: ObjRef;
}

/**
 * Finds the best matching bucket measure for a catalog metric.
 * Prefers master measures over derived ones. When multiple masters match, returns the first one.
 * @param measureRef - The ObjRef of the catalog measure to match
 * @param bucketMeasures - List of bucket measures to search through
 * @returns The localIdentifier of the matching bucket measure, or undefined if no match
 */
export const findMatchingBucketMeasureLocalIdentifier = (
    measureRef: ObjRef,
    bucketMeasures: IRawBucketItems | undefined,
): string | undefined => {
    if (!bucketMeasures || bucketMeasures.length === 0) {
        return undefined;
    }

    // Find all measures that match the ref, fallback to reconstructed ref (decorated bucket items have
    // attribute value as an objRef identifier)
    const matchingMeasures = bucketMeasures.filter(
        (m) => areObjRefsEqual(m.ref, measureRef) || areObjRefsEqual(idRef(m.attribute), measureRef),
    );
    if (matchingMeasures.length === 0) {
        return undefined;
    }

    // Prefer master measures (no masterLocalIdentifier) over derived ones
    const masterMeasure = matchingMeasures.find((m) => !m.masterLocalIdentifier);
    if (masterMeasure) {
        return masterMeasure.localIdentifier;
    }
    // Fall back to first match if no master found
    return matchingMeasures[0].localIdentifier;
};

// --- the filter factories ---------------------------------------------------------------------

export const createFilter = (
    // the loose catalog currency: the drop/add paths hand over ICatalogEntry, not a strict cache item
    cacheItem: ICatalogEntry,
    dateDatasetRef?: ObjRef,
    prioritizePrimaryDf = false,
    bucketMeasures?: IRawBucketItems,
    dimensionality?: string[],
): IFilter => {
    if (cacheItem.type === "date") {
        invariant(dateDatasetRef, "DateDataset ref not provided for date filter.");
        return createDateFilter(dateDatasetRef);
    }

    if (cacheItem.type === "metric") {
        // Check if there's a matching bucket measure to use its localIdentifier
        const matchingLocalIdentifier = findMatchingBucketMeasureLocalIdentifier(
            cacheItem.ref,
            bucketMeasures,
        );

        if (matchingLocalIdentifier) {
            return createMeasureValueFilter(matchingLocalIdentifier, dimensionality);
        }

        // Fall back to objRef-based filter when the measure is not in buckets
        return createMeasureValueFilter(cacheItem.ref, dimensionality);
    }

    const primaryDf = cacheItem.displayForms?.find((df) => !!df.isPrimary);

    return createAttributeFilter(
        cacheItem.identifier,
        cacheItem.dfRef,
        undefined,
        prioritizePrimaryDf ? primaryDf?.ref : undefined,
    );
};

export const createDateFilter = (dateDatasetRef: ObjRef): IDateFilter => {
    return {
        type: "date",
        localIdentifier: generateBucketItemIdentifier(),
        cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
        overTimeComparisonType: "nothing",
        dateDatasetRef,
    };
};

export const createAttributeFilter = (
    cacheIdentifier: string,
    dfRef: ObjRef,
    filterConfig?: IAttributeFilterConfig,
    primaryDfRef?: ObjRef,
): IAttributeFilter => {
    return {
        type: "attribute",
        localIdentifier: generateBucketItemIdentifier(),
        cacheItemIdentifier: cacheIdentifier,
        displayFormRef: primaryDfRef ?? dfRef,

        filterConfig: filterConfig ?? {
            isInverted: true,
            selectedElements: [],
            totalElementsCount: 0,
        },
    };
};

export const createMeasureValueFilter = (
    measureIdentifier: string | ObjRef,
    dimensionality?: string[],
): IMeasureValueFilter => {
    const measureProp =
        typeof measureIdentifier === "string"
            ? { measureLocalIdentifier: measureIdentifier }
            : { measureRef: measureIdentifier };
    const dimensionalityProp = dimensionality === undefined ? {} : { dimensionality };
    return {
        type: "measure",
        localIdentifier: generateBucketItemIdentifier(),
        ...measureProp,
        ...dimensionalityProp,
    };
};

export const createDefaultRankingFilter = (
    measureIdentifier: string | ObjRef,
    dimensionality?: string[],
): IRankingFilter => {
    // A bucket measure is referenced by its localIdentifier (string); a catalog measure picked from
    // outside the buckets is referenced by ObjRef.
    const measureProp =
        typeof measureIdentifier === "string"
            ? { measureLocalIdentifier: measureIdentifier }
            : { measureRef: measureIdentifier };
    // Seed the "out of" attributes with the insight's bucket attributes/dates (by local identifier), so a
    // new ranking filter ranks out of the existing attributes rather than the whole result. Mirrors how a
    // new measure value filter seeds its dimensionality.
    const attributesProp = dimensionality?.length ? { attributes: dimensionality } : {};
    return {
        type: "ranking",
        localIdentifier: generateBucketItemIdentifier(),
        ...measureProp,
        ...attributesProp,
        operator: "TOP",
        value: 10,
        // A new filter omits strictLimitOfRows, so it defaults to the softer "with ties" condition —
        // the same behavior as before the strict-limit feature was introduced.
    };
};

// --- value-level finders: the selectors delegate here (one implementation, two entry points) ------

export const findFirstDateFilter = (filterBar: IFilterBarState): IDateFilter =>
    filterBar.items.find(FilterBar.isDateFilter);

export const findDateFilter = (filterBar: IFilterBarState, localIdentifier: string): IDateFilter =>
    filterBar.items
        .filter(FilterBar.isDateFilter)
        .find((filter) => filter.localIdentifier === localIdentifier);

/** The filter's position AMONG THE DATE FILTERS — 0 is "the" date filter, the rest are additional. */
export const findDateFilterIndex = (filterBar: IFilterBarState, localIdentifier: string): number =>
    filterBar.items
        .filter(FilterBar.isDateFilter)
        .findIndex((filter) => filter.localIdentifier === localIdentifier);

export const findAttributeFilter = (filterBar: IFilterBarState, localIdentifier: string): IAttributeFilter =>
    filterBar.items
        .filter(FilterBar.isAttributeFilter)
        .find((filter) => filter.localIdentifier === localIdentifier);

export const findMeasureValueFilters = (filterBar: IFilterBarState): ReadonlyArray<IMeasureValueFilter> =>
    filterBar.items.filter(FilterBar.isMeasureValueFilter);

export const findMeasureValueFilter = (
    filterBar: IFilterBarState,
    localIdentifier: string,
): IMeasureValueFilter =>
    findMeasureValueFilters(filterBar).find((filter) => filter.localIdentifier === localIdentifier) || null;

/**
 * The measure value filter that filters BY a given bucket measure, i.e. the one a removal of that
 * measure has to deal with. Matched on `measureLocalIdentifier` only: a filter carrying `measureRef`
 * points at a catalog measure and does not depend on the buckets at all.
 */
export const findMeasureValueFilterForMeasure = (
    filterBar: IFilterBarState,
    measureLocalIdentifier: string,
): IMeasureValueFilter =>
    findMeasureValueFilters(filterBar).find(
        (filter) => filter.measureLocalIdentifier === measureLocalIdentifier,
    ) || null;

export const findRankingFilter = (filterBar: IFilterBarState): IRankingFilter =>
    filterBar.items.find(FilterBar.isRankingFilter) || null;

export const dateFilterExistsIn = (filterBar: IFilterBarState): boolean => !!findFirstDateFilter(filterBar);

/**
 * Flattens the granularity attributes of a date-dataset collection. Both the META items and the
 * granularity options are accepted — the callers differ in which one their domain holds.
 */
export const flattenDateDatasetAttributes = <T>(
    dateDatasets: ReadonlyArray<{ attributes: ReadonlyArray<T> }>,
): T[] => dateDatasets.flatMap((dateDataset) => [...dateDataset.attributes]);

/**
 * The ADDITIONAL date filters: attribute filters filtered by one of the date datasets' own
 * attributes (the date dimension's day/month/quarter display forms), as opposed to a regular
 * attribute filter.
 */
export const pickAdditionalDateAttributeFilters = (
    items: ReadonlyArray<IFilter>,
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): IAttributeFilter[] =>
    items
        .filter(FilterBar.isAttributeFilter)
        .filter((item) =>
            dateDatasetAttributes.some((attribute) => areObjRefsEqual(attribute.dfRef, item.displayFormRef)),
        );

/** The complement of {@link pickAdditionalDateAttributeFilters} — every other filter, in order. */
export const removeAdditionalDateAttributeFilters = (
    items: ReadonlyArray<IFilter>,
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): ReadonlyArray<IFilter> => {
    const additionalDateAttributes = pickAdditionalDateAttributeFilters(items, dateDatasetAttributes);
    return items.filter((item: IFilter) => {
        if (FilterBar.isAttributeFilter(item)) {
            return !additionalDateAttributes.some((dateAttribute) =>
                areObjRefsEqual(dateAttribute.displayFormRef, item.displayFormRef),
            );
        }
        return true;
    });
};

// --- the writers: one domain value in, one domain value out --------------------------------------

/**
 * The filter bar's ONE structural invariant: ranking filters come last, whatever order a writer
 * produced. Every `items` write goes through it — which is also why it rebuilds the array
 * unconditionally (see the module note on identity).
 */
export const normalizeFilterBar = (filterBar: IFilterBarState): IFilterBarState => {
    const filters = filterBar.items;
    const filtersWithoutRanking = filters.filter((filter) => !FilterBar.isRankingFilter(filter));
    const rankingFilters = filters.filter((filter) => FilterBar.isRankingFilter(filter));

    return {
        ...filterBar,
        items: [...filtersWithoutRanking, ...rankingFilters],
    };
};

export const addFilter = (filterBar: IFilterBarState, newFilter: IFilter): IFilterBarState =>
    normalizeFilterBar({
        ...filterBar,
        items: [...filterBar.items, newFilter],
    });

export const storeFilter = (filterBar: IFilterBarState, updatedFilter: IFilter): IFilterBarState =>
    normalizeFilterBar({
        ...filterBar,
        items: filterBar.items.map((item: IFilter) =>
            item.localIdentifier === updatedFilter.localIdentifier ? updatedFilter : item,
        ),
    });

/**
 * The ONLY writer of `attributeFilterConfigs`, so it is where that field's non-optional state type is
 * made true. Its callers hand over values that are legitimately absent — an insight carries the
 * configs only when it HAS some (`convertModelInsightToADRep` spreads the key conditionally), so
 * open-report passes `undefined` for every insight without a display-as label. The field has RAW
 * readers (`storeAttributeFilterDisplayAsLabel`, the measure-filter operations), so the coercion
 * belongs here on the way IN rather than at each of them.
 */
export const storeAttributeFilterConfigs = (
    filterBar: IFilterBarState,
    updatedAttributeFilterConfigs: IAttributeFilterConfigs | undefined,
): IFilterBarState => ({
    ...filterBar,
    attributeFilterConfigs: updatedAttributeFilterConfigs ?? {},
});

/**
 * The "display as" label of ONE filter changed. This is the whole write behind both
 * display-form triggers — the filter-bar filter's and the bucket-item metric filter's — which is
 * what made them plain filter-bar cases rather than operations: the filter itself keeps its
 * `displayFormRef`, only the config that says how to RENDER it moves.
 */
export const storeAttributeFilterDisplayAsLabel = (
    filterBar: IFilterBarState,
    filterLocalIdentifier: string,
    displayAsLabel: ObjRef,
): IFilterBarState => {
    // identity on a no-op: this is a reducer CASE, so a repeated trigger with the same label must
    // not rebuild the state and notify subscribers
    if (
        areObjRefsEqual(
            filterBar.attributeFilterConfigs[filterLocalIdentifier]?.displayAsLabel,
            displayAsLabel,
        )
    ) {
        return filterBar;
    }

    return storeAttributeFilterConfigs(filterBar, {
        ...filterBar.attributeFilterConfigs,
        [filterLocalIdentifier]: {
            ...filterBar.attributeFilterConfigs[filterLocalIdentifier],
            displayAsLabel,
        },
    });
};

export const setFilterItems = (
    filterBar: IFilterBarState,
    filterItems: ReadonlyArray<IFilter>,
): IFilterBarState =>
    normalizeFilterBar({
        ...filterBar,
        items: filterItems,
    });

export const setParameterItems = (
    filterBar: IFilterBarState,
    parameterItems: ReadonlyArray<IParameterFilter>,
): IFilterBarState => ({
    ...filterBar,
    parameterItems,
});

export const setMigratedAdditionalFilters = (
    filterBar: IFilterBarState,
    filterLocalIdentifiers: string[],
): IFilterBarState =>
    normalizeFilterBar({
        ...filterBar,
        migratedAdditionalFilters: filterLocalIdentifiers,
    });

export const updateDateFilter = (
    filterBar: IFilterBarState,
    {
        localIdentifier,
        filterConfig,
        overTimeComparisonType,
        dateDatasetRef,
        emptyDateValuesFilter,
    }: {
        localIdentifier: string;
        filterConfig?: IDateFilterConfig;
        overTimeComparisonType?: OverTimeComparisonType;
        dateDatasetRef?: ObjRef;
        emptyDateValuesFilter?: EmptyDateValuesFilterMode;
    },
): IFilterBarState => {
    const currentFilterItem = findDateFilter(filterBar, localIdentifier);
    const filterConfigProp = filterConfig ? { filterConfig } : {};
    const overTimeComparisonTypeProp = overTimeComparisonType ? { overTimeComparisonType } : {};
    const dateDataset = {
        dateDatasetRef,
    };
    const dateDatasetProp = dateDatasetRef ? dateDataset : {};

    const updatedFilterItem: IDateFilter = {
        ...currentFilterItem,
        ...filterConfigProp,
        ...overTimeComparisonTypeProp,
        ...dateDatasetProp,
        // Always set emptyDateValuesFilterConfig explicitly (even when undefined) to allow removal
        emptyDateValuesFilter,
    };

    const currentFilterConfigDefinedValues = {
        ...currentFilterItem,
        filterConfig: omitBy(
            currentFilterItem?.filterConfig,
            (value) => value === null || value === undefined,
        ),
    };

    if (isEqual(currentFilterConfigDefinedValues, updatedFilterItem)) {
        return filterBar;
    }

    return storeFilter(filterBar, updatedFilterItem);
};

export const updateAttributeFilter = (
    filterBar: IFilterBarState,
    filterLocalIdentifier: string,
    selectedElements: ReadonlyArray<IAttributeElement>,
    totalElementsCount: number,
    isInverted: boolean,
    displayFormRef?: ObjRef,
    textModeFilter?: TextModeFilterData,
): IFilterBarState => {
    const currentFilterItem = findAttributeFilter(filterBar, filterLocalIdentifier);

    invariant(currentFilterItem, `Item ${filterLocalIdentifier} was not found in filters`);

    // When switching to text-mode, preserve the existing filterConfig as-is.
    // When switching to element-mode (or staying in element-mode), update filterConfig fields
    // and clear textModeFilter.
    const filterConfigUpdate =
        textModeFilter && selectedElements === undefined
            ? {}
            : {
                  filterConfig: {
                      ...currentFilterItem.filterConfig,
                      selectedElements,
                      totalElementsCount,
                      isInverted,
                  },
              };

    const updatedFilterItem: IAttributeFilter = {
        ...currentFilterItem,
        ...(displayFormRef ? { displayFormRef } : {}),
        textModeFilter,
        ...filterConfigUpdate,
    };

    return storeFilter(filterBar, updatedFilterItem);
};

/**
 * Answers the UPDATED FILTER (not a filter bar): the caller decides whether to store it, which is
 * what `bucket_filters_sagas` does with the measure value filter it just recomputed.
 *
 * The parameter was declared `IMeasureValueFilter | null` and never could be: the body destructures
 * it on the first line, so a null would have thrown before any of this ran, and the only producer
 * (`UI_UPDATE_MEASURE_VALUE_FILTER`) types its payload non-null. The `| null` and the
 * `filter?.conditions` chain that came with it are gone: a type that overstates absence invites a
 * caller to rely on it.
 */
export const updateMeasureValueFilter = (
    filterBar: IFilterBarState,
    filter: IMeasureValueFilter,
): IMeasureValueFilter => {
    const { localIdentifier, dimensionality, applyOnResult } = filter;
    const currentFilterItem = findMeasureValueFilter(filterBar, localIdentifier);
    invariant(currentFilterItem, `Filter '${localIdentifier}' does not exist in the app state!`);
    // Explicitly set dimensionality to clear old values when empty array is passed
    const { dimensionality: _dimensionality, applyOnResult: _applyOnResult, ...rest } = currentFilterItem;
    const dimensionalityProp = dimensionality?.length ? { dimensionality } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    return {
        ...rest,
        conditions: filter.conditions?.length ? filter.conditions : undefined,
        ...dimensionalityProp,
        ...applyOnResultProp,
    };
};

/** Answers the UPDATED FILTER, like {@link updateMeasureValueFilter}. */
export const updateRankingFilter = (filterBar: IFilterBarState, filter: IRankingFilter): IRankingFilter => {
    const currentFilterItem = findRankingFilter(filterBar);
    invariant(currentFilterItem, `Ranking filter does not exist in the app state!`);
    const {
        type,
        localIdentifier,
        measureLocalIdentifier,
        measureRef,
        attributes,
        operator,
        value,
        strictLimitOfRows,
        applyOnResult,
    } = filter;
    const attributesProp = attributes ? { attributes } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    // Catalog measures are referenced by measureRef, bucket measures by measureLocalIdentifier.
    // Both must be carried through so a catalog ranking filter does not lose its measure on update.
    const measureProp = measureRef ? { measureRef } : { measureLocalIdentifier };

    return {
        type,
        localIdentifier,
        ...measureProp,
        ...attributesProp,
        operator,
        value,
        ...strictLimitOfRowsProp,
        ...applyOnResultProp,
    };
};

/**
 * Re-points the ranking filter at a measure that replaced the one it ranked by — the derived-measure
 * swap of the over-time-comparison change.
 *
 * Identity when there is no ranking filter or it ranks by something else. Only
 * `measureLocalIdentifier` is compared on purpose: a ranking filter referencing a CATALOG measure
 * carries `measureRef` instead and is unaffected by a bucket measure being rebuilt.
 */
export const replaceRankingFilterMeasure = (
    filterBar: IFilterBarState,
    previousMeasureLocalIdentifier: string,
    newMeasureLocalIdentifier: string,
): IFilterBarState => {
    const rankingFilter = findRankingFilter(filterBar);
    // two guards rather than `rankingFilter?.measureLocalIdentifier !== previous`: the optional-chain
    // form would MATCH when there is no ranking filter and `previous` is undefined, and then spread a
    // null into the stored filter
    if (!rankingFilter) {
        return filterBar;
    }
    if (rankingFilter.measureLocalIdentifier !== previousMeasureLocalIdentifier) {
        return filterBar;
    }
    return storeFilter(filterBar, {
        ...rankingFilter,
        measureLocalIdentifier: newMeasureLocalIdentifier,
    });
};

export const createDateFilterIfDoesntExist = (
    filterBar: IFilterBarState,
    dateDatasetRef: ObjRef,
): IFilterBarState =>
    dateFilterExistsIn(filterBar) ? filterBar : addFilter(filterBar, createDateFilter(dateDatasetRef));

export const removeFilters = (
    filterBar: IFilterBarState,
    localIdentifiers: ReadonlyArray<string>,
): IFilterBarState =>
    setFilterItems(
        filterBar,
        filterBar.items.filter((filter) => !localIdentifiers.includes(filter.localIdentifier)),
    );

export const removeMeasureValueFilters = (filterBar: IFilterBarState): IFilterBarState =>
    removeFilters(
        filterBar,
        findMeasureValueFilters(filterBar).map((filter) => filter.localIdentifier),
    );

/**
 * Replaces the whole additional-date-filter set with `updatedAdditionalDateFilters`, keeping every
 * other filter. `dateDatasetAttributes` is what decides which existing filters are additional ones.
 */
export const updateFilters = (
    filterBar: IFilterBarState,
    updatedAdditionalDateFilters: IFilter[],
    dateDatasetAttributes: ReadonlyArray<IDateAttributeWithDisplayForm>,
): IFilterBarState =>
    setFilterItems(filterBar, [
        ...removeAdditionalDateAttributeFilters(filterBar.items, dateDatasetAttributes),
        ...updatedAdditionalDateFilters,
    ]);

// --- the additional-date-filter migration --------------------------------------------------------

/**
 * The attribute of `newDateDatasetRef` with the granularity `filter` is filtered by, or undefined when the
 * new dataset has no such granularity.
 */
const findMigrationTarget = (
    filter: IAttributeFilter,
    newDateDatasetRef: ObjRef,
    dateDataSets: IDateDatasetRefWithGranularities[],
): IGranularityOptionWithRefs | undefined => {
    const currentAttribute = flattenDateDatasetAttributes(dateDataSets).find((attribute) =>
        areObjRefsEqual(attribute.dfRef, filter.displayFormRef),
    );
    return dateDataSets
        .find((dateDataset) => areObjRefsEqual(dateDataset.ref, newDateDatasetRef))
        ?.attributes.find((attribute) => attribute.dateType === currentAttribute?.dateType);
};

/**
 * Re-points each additional date filter at the SAME granularity of the new date dataset, dropping
 * the ones the new dataset has no attribute for.
 *
 * The selection is KEPT: an element of a generic date attribute is identified by its calendar index
 * ("1".."7" for a day of week) and an element of an absolute one by its canonical value ("2024-05"),
 * both the same in every date dataset, so nothing about the selection depends on the dataset.
 */
export const migrateAdditionalDateFilters = (
    newDateDatasetRef: ObjRef,
    filters: IAttributeFilter[],
    dateDataSets: IDateDatasetRefWithGranularities[],
): IAttributeFilter[] =>
    filters.flatMap((filter): IAttributeFilter[] => {
        const target = findMigrationTarget(filter, newDateDatasetRef, dateDataSets);
        return target
            ? [{ ...filter, cacheItemIdentifier: target.cacheIdentifier, displayFormRef: target.dfRef }]
            : [];
    });

/**
 * The local identifiers of the additional date filters that {@link migrateAdditionalDateFilters} DROPS
 * together with a real selection — the ones worth warning about. A filter the new dataset lacks the
 * granularity for but that selected All loses nothing, and a migrated filter keeps its selection.
 */
export const pickAdditionalDateFiltersRemovedByMigration = (
    newDateDatasetRef: ObjRef,
    filters: IAttributeFilter[],
    dateDataSets: IDateDatasetRefWithGranularities[],
): string[] =>
    filters
        .filter(
            (filter) =>
                !findMigrationTarget(filter, newDateDatasetRef, dateDataSets) &&
                !FilterBar.isAttributeFilterSelectAll(filter.filterConfig),
        )
        .map((filter) => filter.localIdentifier);

/**
 * The date dataset behind the first date filter changed: every additional date filter migrates to
 * the matching granularity of the new dataset, keeping its selection, or is removed when the new
 * dataset lacks the granularity — and the removed ones that carried a real selection are reported
 * so the UI can warn about them.
 *
 * `dateDatasetsWithGranularities` is the resolved date-dataset/granularity list, passed in as an
 * ARGUMENT so this helper never reaches into the date-datasets domain.
 */
export const resetAdditionalDateFilters = (
    filterBar: IFilterBarState,
    newDateDatasetRef: ObjRef,
    dateDatasetsWithGranularities: IDateDatasetRefWithGranularities[],
): IFilterBarState => {
    const filters = pickAdditionalDateAttributeFilters(
        filterBar.items,
        flattenDateDatasetAttributes(dateDatasetsWithGranularities),
    );
    const migratedFilters = migrateAdditionalDateFilters(
        newDateDatasetRef,
        filters,
        dateDatasetsWithGranularities,
    );
    const updatedFilterBar = filters.reduce((filterBar: IFilterBarState, filter: IAttributeFilter) => {
        const migratedFilter = migratedFilters.find((f) => f.localIdentifier === filter.localIdentifier);
        return migratedFilter
            ? storeFilter(filterBar, migratedFilter)
            : removeFilters(filterBar, [filter.localIdentifier]);
    }, filterBar);
    const removedFilters = pickAdditionalDateFiltersRemovedByMigration(
        newDateDatasetRef,
        filters,
        dateDatasetsWithGranularities,
    );
    // Added to the marks still standing from an earlier change, which removed filters this one cannot see.
    return setMigratedAdditionalFilters(
        updatedFilterBar,
        union(filterBar.migratedAdditionalFilters, removedFilters),
    );
};

// --- the extended-reference-point filter converters ----------------------------------------------

const convertToDateFilter = (
    filter: IVisDateFilter,
    localIdentifier: string,
    dateDatasetRef: ObjRef,
): IDateFilter => ({
    localIdentifier,
    type: "date",
    cacheItemIdentifier: filter.attribute,
    filterConfig: filter.interval
        ? {
              interval: filter.interval.interval,
              name: filter.interval.name,
              granularity: filter.interval.granularity as Granularity,
              type: filter.interval.type,
              ...(filter.interval.boundedFilter ? { boundedFilter: filter.interval.boundedFilter } : {}),
          }
        : undefined,
    overTimeComparisonType: filter.overTimeComparisonType,
    emptyDateValuesFilter: filter.emptyDateValuesFilter,
    dateDatasetRef,
});

const convertToAttributeFilter = (
    filter: IVisAttributeFilter,
    localIdentifier: string,
): IAttributeFilter => ({
    localIdentifier,
    type: "attribute",
    cacheItemIdentifier: filter.attribute,
    displayFormRef: filter.displayFormRef,
    filterConfig: filter
        ? {
              selectedElements: filter.selectedElements,
              totalElementsCount: filter.totalElementsCount,
              isInverted: filter.isInverted,
          }
        : undefined,
    ...(filter.textModeFilter ? { textModeFilter: filter.textModeFilter } : {}),
});

const convertToMeasureValueFilter = (
    filter: IVisMeasureValueFilter,
    localIdentifier: string,
    applyOnResult?: boolean,
): IMeasureValueFilter => {
    // Normalize legacy single-condition filters to the new `conditions[]` shape.
    const conditions = normalizeMeasureValueFilterConditions(filter);
    const conditionsProps = conditions?.length ? { conditions } : {};
    const { measureLocalIdentifier, measureRef, dimensionality } = filter;
    const measureProps = measureRef ? { measureRef } : { measureLocalIdentifier };
    const dimensionalityProps = dimensionality?.length ? { dimensionality } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };

    return {
        type: "measure",
        localIdentifier,
        ...measureProps,
        ...conditionsProps,
        ...dimensionalityProps,
        ...applyOnResultProp,
    };
};

/**
 * Detects a ranking filter in the extended reference point shape. Unlike the shared
 * isRankingFilter from sdk-ui-ext (which requires the measure to be a string local identifier),
 * this also recognizes ranking filters that reference a catalog measure by ObjRef (measureRef).
 * The reliable discriminator is the presence of a top-level operator + value, which measure value
 * filters never have.
 */
const isRankingRefPointFilter = (filter: IVisRankingFilter & { measureRef?: ObjRef }): boolean => {
    return typeof filter?.operator === "string" && typeof filter?.value === "number";
};

const convertToRankingFilter = (
    filter: IVisRankingFilter & { measureRef?: ObjRef },
    localIdentifier: string,
    applyOnResult?: boolean,
    strictLimitOfRows?: boolean,
): IRankingFilter => {
    const { measure, measureRef, attributes, operator, value } = filter;
    const attributesProp = attributes ? { attributes: attributes } : {};
    const applyOnResultProp = applyOnResult === undefined ? {} : { applyOnResult };
    const strictLimitOfRowsProp = strictLimitOfRows === undefined ? {} : { strictLimitOfRows };
    // Catalog measures are referenced by ObjRef, bucket measures by their localIdentifier.
    const measureProps = measureRef ? { measureRef } : { measureLocalIdentifier: measure };

    return {
        type: "ranking",
        localIdentifier,
        ...measureProps,
        ...attributesProp,
        operator,
        value,
        ...applyOnResultProp,
        ...strictLimitOfRowsProp,
    };
};

/**
 * Converts a FILTERS BUCKET into the filter bar's own filters. Two producers hand it the same
 * shape from different families: the extended reference point's `filters` (the SDK's `IFilters`,
 * as the plug viz answered it) and the reference point's own rebuilt bucket
 * (`IRefPointFiltersBucket`). They differ only in how strictly the SDK types their detail objects,
 * so the detail is narrowed ONCE here rather than at each caller.
 */
export const convertFromExtendedRefPointFilters = (
    extendedRefPointFilters: IFilters | IRefPointFiltersBucket,
): ReadonlyArray<IFilter> => {
    const items: ReadonlyArray<IFiltersBucketItem | IRefPointFilterItem> = extendedRefPointFilters.items;
    return items.map((item) => {
        const filter = item.filters[0] as SdkBucketFilter;
        const { applyOnResult, strictLimitOfRows } = item;
        if (isDateFilter(filter)) {
            return convertToDateFilter(filter, item.localIdentifier, item.dateDatasetRef);
        }
        // Ranking must be checked before the measure value filter: a ranking filter referencing a
        // catalog measure carries measureRef, which the shared isMeasureValueFilter predicate would
        // otherwise misclassify as a measure value filter.
        if (isRankingRefPointFilter(filter as IVisRankingFilter & { measureRef?: ObjRef })) {
            return convertToRankingFilter(
                filter as IVisRankingFilter & { measureRef?: ObjRef },
                item.localIdentifier,
                applyOnResult,
                strictLimitOfRows,
            );
        }
        if (isMeasureValueFilter(filter)) {
            return convertToMeasureValueFilter(filter, item.localIdentifier, applyOnResult);
        }
        if (isAttributeFilter(filter)) {
            return convertToAttributeFilter(filter, item.localIdentifier);
        }
        throw new Error("Unsupported extended reference point filter type");
    });
};
