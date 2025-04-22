// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";
import {
    selectAttributeFilterConfigsOverrides,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectDateFilterConfigsOverrides,
    useDashboardSelector,
} from "../../model/index.js";
import {
    areFiltersMatchedByIdentifier,
    getCatalogAttributesByFilters,
    getCatalogDateDatasetsByFilters,
    getFilterByCatalogItemRef,
    getNonHiddenFilters,
    getNonSelectedFilters,
} from "./utils.js";
import { FilterContextItem, ObjRef } from "@gooddata/sdk-model";

/**
 * Logic for handling inner filters component logic.
 */
export const useAutomationFilters = ({
    availableFilters,
    selectedFilters,
    onFiltersChange,
}: {
    availableFilters: FilterContextItem[];
    selectedFilters: FilterContextItem[];
    onFiltersChange: (filters: FilterContextItem[]) => void;
}) => {
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);

    const visibleFilters = useMemo(() => {
        return getNonHiddenFilters(selectedFilters, attributeConfigs, dateConfigs);
    }, [attributeConfigs, dateConfigs, selectedFilters]);

    const nonSelectedFilters = useMemo(
        () => getNonSelectedFilters(availableFilters, selectedFilters),
        [availableFilters, selectedFilters],
    );

    const attributes = useMemo(
        () => getCatalogAttributesByFilters(nonSelectedFilters, allAttributes),
        [nonSelectedFilters, allAttributes],
    );

    const dateDatasets = useMemo(
        () => getCatalogDateDatasetsByFilters(nonSelectedFilters, allDateDatasets),
        [nonSelectedFilters, allDateDatasets],
    );

    const handleChangeFilter = useCallback(
        (filter: FilterContextItem | undefined) => {
            if (!filter) {
                return;
            }

            const updatedFilters = selectedFilters.map((prevFilter) => {
                if (areFiltersMatchedByIdentifier(prevFilter, filter)) {
                    return filter;
                }
                return prevFilter;
            });
            onFiltersChange(updatedFilters);
        },
        [onFiltersChange, selectedFilters],
    );

    const handleDeleteFilter = useCallback(
        (filter: FilterContextItem) => {
            const updatedFilters = selectedFilters.filter(
                (prevFilter) => !areFiltersMatchedByIdentifier(prevFilter, filter),
            );
            onFiltersChange(updatedFilters);
        },
        [onFiltersChange, selectedFilters],
    );

    const handleAddFilter = useCallback(
        (catalogItemRef: ObjRef) => {
            const filter = getFilterByCatalogItemRef(catalogItemRef, nonSelectedFilters);
            if (filter) {
                const updatedFilters = [...selectedFilters, filter];
                onFiltersChange(updatedFilters);
            }
        },
        [nonSelectedFilters, onFiltersChange, selectedFilters],
    );

    return {
        visibleFilters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        handleChangeFilter,
        handleDeleteFilter,
        handleAddFilter,
    };
};
