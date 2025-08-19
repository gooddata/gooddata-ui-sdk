// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import {
    FilterContextItem,
    ICatalogAttribute,
    ICatalogDateDataset,
    ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import {
    areFiltersMatchedByIdentifier,
    getCatalogAttributesByFilters,
    getCatalogDateDatasetsByFilters,
    getFilterByCatalogItemRef,
    getNonHiddenFilters,
    getNonSelectedFilters,
} from "./utils.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectAutomationCommonDateFilterId,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectDashboardLockedFilters,
    selectDateFilterConfigsOverrides,
    selectPersistedDashboardFilterContextDateFilterConfig,
    useDashboardSelector,
} from "../../model/index.js";

/**
 * Logic for handling inner filters component logic.
 */
export const useAutomationFilters = ({
    availableFilters,
    selectedFilters,
    onFiltersChange,
    onStoreFiltersChange,
}: {
    availableFilters: FilterContextItem[];
    selectedFilters: FilterContextItem[];
    onFiltersChange: (filters: FilterContextItem[]) => void;
    onStoreFiltersChange: (shouldStore: boolean, filters: FilterContextItem[]) => void;
}) => {
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);
    const dateFilterConfig = useDashboardSelector(selectPersistedDashboardFilterContextDateFilterConfig);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const lockedFilters = useDashboardSelector(selectDashboardLockedFilters);
    const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

    const visibleFilters = useMemo(() => {
        return getNonHiddenFilters(selectedFilters, attributeConfigs, dateConfigs, isCommonDateFilterHidden);
    }, [attributeConfigs, dateConfigs, selectedFilters, isCommonDateFilterHidden]);

    const nonSelectedFilters = useMemo(
        () => getNonSelectedFilters(availableFilters, selectedFilters),
        [availableFilters, selectedFilters],
    );

    const attributes = useMemo(
        () => getCatalogAttributesByFilters(nonSelectedFilters, allAttributes, attributeConfigs),
        [nonSelectedFilters, allAttributes, attributeConfigs],
    );

    const dateDatasets = useMemo(
        () => getCatalogDateDatasetsByFilters(nonSelectedFilters, allDateDatasets, dateConfigs),
        [nonSelectedFilters, allDateDatasets, dateConfigs],
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
        (catalogItemRef: ObjRef, attributes: ICatalogAttribute[], dateDatasets: ICatalogDateDataset[]) => {
            // We need to go through all display forms of the attribute in case
            // the filter is using different display form.
            const selectedAttributeDisplayForms =
                attributes
                    .find((attribute) =>
                        attribute.displayForms.some((df) => areObjRefsEqual(df.ref, catalogItemRef)),
                    )
                    ?.displayForms?.map((df) => df.ref) ?? [];

            const selectedDateDataSets = dateDatasets.filter((ds) =>
                areObjRefsEqual(ds.dataSet.ref, catalogItemRef),
            );

            const attributeFilter = selectedAttributeDisplayForms.reduce<FilterContextItem | undefined>(
                (acc, displayFormRef) => acc || getFilterByCatalogItemRef(displayFormRef, nonSelectedFilters),
                undefined,
            );

            const dateFilter = selectedDateDataSets.reduce<FilterContextItem | undefined>(
                (acc, dateDataSet) =>
                    acc || getFilterByCatalogItemRef(dateDataSet.dataSet.ref, nonSelectedFilters),
                undefined,
            );

            const filter = attributeFilter || dateFilter;

            if (filter) {
                const updatedFilters = [...selectedFilters, filter];
                onFiltersChange(updatedFilters);
            }
        },
        [nonSelectedFilters, onFiltersChange, selectedFilters],
    );

    const handleStoreFiltersChange = useCallback(
        (value: boolean) => {
            onStoreFiltersChange(value, selectedFilters);
        },
        [onStoreFiltersChange, selectedFilters],
    );

    return {
        commonDateFilterId,
        lockedFilters,
        visibleFilters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        handleChangeFilter,
        handleDeleteFilter,
        handleAddFilter,
        handleStoreFiltersChange,
    };
};
