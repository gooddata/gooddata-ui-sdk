// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type IAttributeOrMeasure,
    type IFilter,
    type IInsightDefinition,
    type ObjRef,
    type ObjRefInScope,
    idRef,
    insightFilters,
    insightSetFilters,
} from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";
import { type IBucketItemDescriptors } from "@gooddata/sdk-ui-kit";

import { type ICatalogEntries } from "../../typings/state_objects.js";
import { loadCachedDateDatasets, loadValidDimensionalityAttributes } from "../../utils/api.js";

import {
    buildDimensionalityWithTitles,
    buildInsightDimensionality,
    buildLocalIdToDisplayFormRefMap,
    loadCatalogDimensionalityItems,
} from "./measure_value_filter_item_utils.js";

/**
 * Inputs for {@link useFilterDimensionality}. The Redux-sourced parts are common to both the measure value
 * filter and the ranking filter; the two callbacks capture the only per-filter differences.
 */
export interface IUseFilterDimensionalityParams<TFilter> {
    insight: IInsightDefinition | null | undefined;
    /** Bucket attribute/date descriptors used to derive the insight default dimensionality. */
    insightDimensionalityItems: IBucketItemDescriptors;
    itemCache: ICatalogEntries;
    bucketItemNames: IBucketItemDescriptors;
    projectId: string;
    datasetId: string | undefined;
    includeObjectsWithTags: ObjRef[] | undefined;
    excludeObjectsWithTags: ObjRef[] | undefined;
    /** The filter being edited; passed through to the per-filter callbacks below. */
    filter: TFilter;
    /**
     * Builds the computeValidObjects availability items (insight measures + the filtered measure + the
     * effective dimensionality) for the concrete filter type. Pass the filter-type's builder directly
     * (e.g. {@link buildMvfAvailabilityItems} / buildRankingAvailabilityItems).
     */
    buildAvailabilityItems: (
        insight: IInsightDefinition,
        filter: TFilter,
        override: ObjRefInScope[],
    ) => IAttributeOrMeasure[];
    /**
     * Optionally rewrites a single insight filter to carry the in-progress dimensionality; used to build the
     * insight passed to date-dataset loading so date availability reflects un-applied edits. Return the filter
     * unchanged when it is not the one being edited. When omitted, the insight is used as-is.
     */
    applyOverrideToInsightFilter?: (
        insightFilter: IFilter,
        filter: TFilter,
        override: ObjRefInScope[],
    ) => IFilter;
    /**
     * Whether computed attributes may take part. Redux-sourced like the rest, so it is passed in
     * rather than read here - the hook is rendered in tests without a store Provider.
     */
    computedAttributesEnabled?: boolean;
}

/**
 * Shared catalog-dimensionality wiring for filters that let the user pick attributes/dates from the catalog
 * (measure value filter dimensionality and ranking filter "out of" attributes).
 *
 * Returns the building blocks; each filter maps them to its own props:
 * - `toTitledItems` bridges bucket local ids and catalog ObjRefs and resolves titles,
 * - `insightDimensionality` are the insight default attributes (for the "reuses insight" default + reset),
 * - `loadCatalogDimensionality` lazily loads valid catalog attributes/dates for the picker.
 */
export function useFilterDimensionality<TFilter>({
    insight,
    insightDimensionalityItems,
    itemCache,
    bucketItemNames,
    projectId,
    datasetId,
    includeObjectsWithTags,
    excludeObjectsWithTags,
    filter,
    buildAvailabilityItems,
    applyOverrideToInsightFilter,
    computedAttributesEnabled = false,
}: IUseFilterDimensionalityParams<TFilter>) {
    const intl = useIntl();

    const localIdToRef = useMemo(() => buildLocalIdToDisplayFormRefMap(insight), [insight]);

    const insightDimensionality = useMemo(
        () => buildInsightDimensionality(insightDimensionalityItems, localIdToRef),
        [insightDimensionalityItems, localIdToRef],
    );

    // Resolve titles/types for a set of dimensionality refs. Preserves undefined (vs. an empty array) so
    // callers that distinguish "no dimensionality set" from "empty dimensionality" keep that signal.
    const toTitledItems = useCallback(
        (refs: ObjRefInScope[] | undefined): IDimensionalityItem[] | undefined =>
            buildDimensionalityWithTitles(refs, bucketItemNames, itemCache, localIdToRef),
        [bucketItemNames, itemCache, localIdToRef],
    );

    const loadCatalogDimensionality = useCallback(
        async (override: ObjRefInScope[]): Promise<IDimensionalityItem[]> => {
            if (!insight) {
                return [];
            }
            const loaderInsight = applyOverrideToInsightFilter
                ? insightSetFilters(
                      insight,
                      insightFilters(insight).map((f) => applyOverrideToInsightFilter(f, filter, override)),
                  )
                : insight;
            return loadCatalogDimensionalityItems(
                {
                    projectId,
                    insight: loaderInsight,
                    availabilityItems: buildAvailabilityItems(insight, filter, override),
                    datasetId,
                    includeObjectsWithTags,
                    excludeObjectsWithTags,
                    intl,
                    enableComputedAttributes: computedAttributesEnabled,
                },
                loadValidDimensionalityAttributes,
                loadCachedDateDatasets,
                idRef,
            );
        },
        [
            insight,
            projectId,
            datasetId,
            includeObjectsWithTags,
            excludeObjectsWithTags,
            intl,
            computedAttributesEnabled,
            filter,
            buildAvailabilityItems,
            applyOverrideToInsightFilter,
        ],
    );

    return { insightDimensionality, toTitledItems, loadCatalogDimensionality };
}
