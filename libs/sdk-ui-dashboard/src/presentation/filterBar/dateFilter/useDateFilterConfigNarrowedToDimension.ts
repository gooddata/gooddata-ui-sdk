// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type ICatalogDateDataset, type ObjRef } from "@gooddata/sdk-model";

import {
    getDateDimensionGranularities,
    narrowDateFilterOptionsToGranularities,
    narrowGranularities,
} from "./dateDimensionGranularities.js";
import { type IDashboardDateFilterConfig } from "./types.js";

/**
 * Narrows the date filter config to the granularities exposed by the date dimension the filter is bound to,
 * so the date filter component (default or custom) offers only presets and granularities the dimension has.
 *
 * The config is returned with the original granularities and options when there is no dimension (the common
 * date filter) or the dimension is not in the catalog.
 */
export function useDateFilterConfigNarrowedToDimension(
    config: IDashboardDateFilterConfig,
    dateDatasets: ICatalogDateDataset[],
    dataSetRef: ObjRef | undefined,
): IDashboardDateFilterConfig {
    const { availableGranularities, dateFilterOptions } = config;

    const dimensionGranularities = useMemo(
        () => getDateDimensionGranularities(dateDatasets, dataSetRef),
        [dateDatasets, dataSetRef],
    );

    const narrowedOptions = useMemo(
        () =>
            dimensionGranularities
                ? narrowDateFilterOptionsToGranularities(dateFilterOptions, dimensionGranularities)
                : dateFilterOptions,
        [dateFilterOptions, dimensionGranularities],
    );

    const narrowedGranularities = useMemo(
        () =>
            dimensionGranularities
                ? narrowGranularities(availableGranularities, dimensionGranularities)
                : availableGranularities,
        [availableGranularities, dimensionGranularities],
    );

    return {
        ...config,
        availableGranularities: narrowedGranularities,
        dateFilterOptions: narrowedOptions,
    };
}
