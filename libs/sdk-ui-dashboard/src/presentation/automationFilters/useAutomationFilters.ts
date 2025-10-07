// (C) 2025 GoodData Corporation

import { MutableRefObject, useCallback, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

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
    getFilterTitle,
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
    const intl = useIntl();
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);
    const dateFilterConfig = useDashboardSelector(selectPersistedDashboardFilterContextDateFilterConfig);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const lockedFilters = useDashboardSelector(selectDashboardLockedFilters);

    const [filterAnnouncement, setFilterAnnouncement] = useState<string>("");

    const addFilterButtonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

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

    const focusAddFilterButton = useCallback(() => {
        //focus add button, use requestAnimationFrame to wait for rerender
        requestAnimationFrame(() => {
            addFilterButtonRef.current?.focus();
        });
    }, []);

    const focusFilterGroup = useCallback(() => {
        requestAnimationFrame(() => {
            if (filterGroupRef.current) {
                // set tabindex to 0 to make the filter group focusable and preserve the tab order
                filterGroupRef.current.tabIndex = 0;
                filterGroupRef.current.focus();
            }
        });
    }, []);

    const announceFiltersChanged = useCallback((message: string) => {
        setTimeout(() => {
            // Defer announcement to next render so screen reader doesn't skip it
            setFilterAnnouncement(message);
        });
    }, []);

    const makeFilterGroupUnfocusable = useCallback(() => {
        requestAnimationFrame(() => {
            if (filterGroupRef.current) {
                filterGroupRef.current.removeAttribute("tabindex");
            }
        });
    }, []);

    const handleChangeFilter = useCallback(
        (filter: FilterContextItem | undefined) => {
            if (!filter) {
                return;
            }

            const filterTitle = getFilterTitle(filter, allAttributes, allDateDatasets, intl);
            const message = intl.formatMessage(
                { id: "automationFilters.announcement.filterChanged" },
                { title: filterTitle },
            );
            announceFiltersChanged(message);

            const updatedFilters = selectedFilters.map((prevFilter) => {
                if (areFiltersMatchedByIdentifier(prevFilter, filter)) {
                    return filter;
                }
                return prevFilter;
            });
            onFiltersChange(updatedFilters);
        },
        [onFiltersChange, selectedFilters, allAttributes, allDateDatasets, intl],
    );

    const handleDeleteFilter = useCallback(
        (filter: FilterContextItem) => {
            const filterTitle = getFilterTitle(filter, allAttributes, allDateDatasets, intl);
            const message = intl.formatMessage(
                { id: "automationFilters.announcement.filterRemoved" },
                { title: filterTitle },
            );
            announceFiltersChanged(message);

            const updatedFilters = selectedFilters.filter(
                (prevFilter) => !areFiltersMatchedByIdentifier(prevFilter, filter),
            );
            onFiltersChange(updatedFilters);

            focusFilterGroup();
        },
        [onFiltersChange, focusFilterGroup, selectedFilters, allAttributes, allDateDatasets, intl],
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
                const filterTitle = getFilterTitle(filter, allAttributes, allDateDatasets, intl);
                const message = intl.formatMessage(
                    { id: "automationFilters.announcement.filterAdded" },
                    { title: filterTitle },
                );
                announceFiltersChanged(message);

                const updatedFilters = [...selectedFilters, filter];
                onFiltersChange(updatedFilters);

                focusAddFilterButton();
            }
        },
        [
            nonSelectedFilters,
            onFiltersChange,
            selectedFilters,
            allAttributes,
            allDateDatasets,
            intl,
            focusAddFilterButton,
        ],
    );

    const handleStoreFiltersChange = useCallback(
        (value: boolean) => {
            onStoreFiltersChange(value, selectedFilters);
        },
        [onStoreFiltersChange, selectedFilters],
    );

    // Function to set ref for AttributesDropdown and also add filter button ref for custom focus management
    const setAddFilterButtonRefs = useCallback(
        (
            element: HTMLButtonElement | HTMLDivElement | null,
            dropdownButtonRef?: MutableRefObject<HTMLElement>,
        ) => {
            addFilterButtonRef.current = element;
            if (dropdownButtonRef && element) {
                dropdownButtonRef.current = element;
            }
        },
        [],
    );

    return {
        commonDateFilterId,
        lockedFilters,
        visibleFilters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        filterAnnouncement,
        filterGroupRef,
        makeFilterGroupUnfocusable,
        handleChangeFilter,
        handleDeleteFilter,
        handleAddFilter,
        handleStoreFiltersChange,
        setAddFilterButtonRefs,
    };
};
