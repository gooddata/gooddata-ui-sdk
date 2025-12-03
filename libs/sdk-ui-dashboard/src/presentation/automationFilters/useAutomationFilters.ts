// (C) 2025 GoodData Corporation

import { MutableRefObject, useCallback, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    FilterContextItem,
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
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
    IAutomationFiltersTab,
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
    selectAutomationCommonDateFilterId,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectDashboardLockedFilters,
    selectDateFilterConfigOverridesByTab,
    selectDateFilterConfigsOverrides,
    selectDateFilterConfigsOverridesByTab,
    selectEnableNewScheduledExport,
    selectPersistedDashboardFilterContextDateFilterConfig,
    useDashboardSelector,
} from "../../model/index.js";

//
// Helper functions for computing filter data
//

interface IFilterProcessingContext {
    allAttributes: ICatalogAttribute[];
    allDateDatasets: ICatalogDateDataset[];
    attributeConfigs: IDashboardAttributeFilterConfig[];
    dateConfigs: IDashboardDateFilterConfigItem[];
    isCommonDateFilterHidden: boolean;
    disableDateFilters: boolean;
}

/**
 * Computes visible filters by removing hidden filters.
 */
function computeVisibleFilters(
    selectedFilters: FilterContextItem[],
    context: IFilterProcessingContext,
): FilterContextItem[] {
    return getNonHiddenFilters(
        selectedFilters,
        context.attributeConfigs,
        context.dateConfigs,
        context.isCommonDateFilterHidden,
        context.disableDateFilters,
    );
}

/**
 * Computes catalog attributes available for the Add filter dropdown.
 */
function computeAddDropdownAttributes(
    nonSelectedFilters: FilterContextItem[],
    context: IFilterProcessingContext,
): ICatalogAttribute[] {
    return getCatalogAttributesByFilters(nonSelectedFilters, context.allAttributes, context.attributeConfigs);
}

/**
 * Computes catalog date datasets available for the Add filter dropdown.
 */
function computeAddDropdownDateDatasets(
    nonSelectedFilters: FilterContextItem[],
    context: IFilterProcessingContext,
): ICatalogDateDataset[] {
    return getCatalogDateDatasetsByFilters(nonSelectedFilters, context.allDateDatasets, context.dateConfigs);
}

//
// Processed tab data interface
//

/**
 * Processed filter data for a single tab, ready for UI rendering.
 */
export interface IProcessedAutomationFiltersTab {
    /** Tab local identifier */
    tabId: string;
    /** Tab title */
    tabTitle: string;
    /** Visible filters after applying hidden filter logic */
    visibleFilters: FilterContextItem[];
    /** Locked filters for this tab */
    lockedFilters: FilterContextItem[];
    /** Catalog attributes available for Add filter dropdown */
    attributes: ICatalogAttribute[];
    /** Catalog date datasets available for Add filter dropdown */
    dateDatasets: ICatalogDateDataset[];
    /** Non-selected filters (available but not yet selected) */
    nonSelectedFilters: FilterContextItem[];
}

/**
 * Logic for handling inner filters component logic.
 */
export const useAutomationFilters = ({
    availableFilters,
    selectedFilters,
    onFiltersChange,
    onStoreFiltersChange,
    disableDateFilters = false,
}: {
    availableFilters: FilterContextItem[];
    selectedFilters: FilterContextItem[];
    disableDateFilters?: boolean;
    onFiltersChange: (filters: FilterContextItem[], enableNewScheduledExport: boolean) => void;
    onStoreFiltersChange: (
        shouldStore: boolean,
        filters: FilterContextItem[],
        filtersByTab?: Record<string, FilterContextItem[]>,
    ) => void;
}) => {
    const intl = useIntl();
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const dateConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);
    const dateFilterConfig = useDashboardSelector(selectPersistedDashboardFilterContextDateFilterConfig);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const lockedFilters = useDashboardSelector(selectDashboardLockedFilters);
    const enableNewScheduledExport = useDashboardSelector(selectEnableNewScheduledExport);

    const [filterAnnouncement, setFilterAnnouncement] = useState<string>("");

    const addFilterButtonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

    const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

    // Create processing context for helper functions
    const processingContext: IFilterProcessingContext = useMemo(
        () => ({
            allAttributes,
            allDateDatasets,
            attributeConfigs,
            dateConfigs,
            isCommonDateFilterHidden,
            disableDateFilters,
        }),
        [
            allAttributes,
            allDateDatasets,
            attributeConfigs,
            dateConfigs,
            isCommonDateFilterHidden,
            disableDateFilters,
        ],
    );

    const visibleFilters = useMemo(
        () => computeVisibleFilters(selectedFilters, processingContext),
        [selectedFilters, processingContext],
    );

    const nonSelectedFilters = useMemo(
        () => getNonSelectedFilters(availableFilters, selectedFilters),
        [availableFilters, selectedFilters],
    );

    const attributes = useMemo(
        () => computeAddDropdownAttributes(nonSelectedFilters, processingContext),
        [nonSelectedFilters, processingContext],
    );

    const dateDatasets = useMemo(
        () => computeAddDropdownDateDatasets(nonSelectedFilters, processingContext),
        [nonSelectedFilters, processingContext],
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
            onFiltersChange(updatedFilters, enableNewScheduledExport);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onFiltersChange(updatedFilters, enableNewScheduledExport);

            focusFilterGroup();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                const updatedFilters = [...selectedFilters, filter];
                onFiltersChange(updatedFilters, enableNewScheduledExport);

                announceFiltersChanged(message);
                setTimeout(focusAddFilterButton);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            onStoreFiltersChange(value, selectedFilters, undefined);
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

/**
 * Hook for processing filters structured per tab.
 * Applies the same business logic as useAutomationFilters to each tab's filters.
 * Returns processed filters and handlers for add/change/delete operations per tab.
 */
export const useAutomationFiltersByTab = ({
    filtersByTab,
    editedFiltersByTab,
    onFiltersByTabChange,
    onStoreFiltersChange,
    disableDateFilters = false,
}: {
    filtersByTab: IAutomationFiltersTab[] | undefined;
    editedFiltersByTab?: Record<string, FilterContextItem[]>;
    onFiltersByTabChange?: (filtersByTab: Record<string, FilterContextItem[]>) => void;
    onStoreFiltersChange: (
        shouldStore: boolean,
        filters?: FilterContextItem[],
        filtersByTab?: Record<string, FilterContextItem[]>,
    ) => void;
    disableDateFilters?: boolean;
}) => {
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);

    const [filterAnnouncement] = useState<string>("");
    const addFilterButtonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

    // Get per-tab filter configs
    const attributeConfigsByTab = useDashboardSelector(selectAttributeFilterConfigsOverridesByTab);
    const dateConfigsByTab = useDashboardSelector(selectDateFilterConfigsOverridesByTab);
    const dateFilterConfigByTab = useDashboardSelector(selectDateFilterConfigOverridesByTab);

    const processedFiltersByTab = useMemo(() => {
        if (!filtersByTab || filtersByTab.length === 0) {
            return undefined;
        }

        return filtersByTab.map((tab): IProcessedAutomationFiltersTab => {
            const tabId = tab.tabId;

            // Get configs specific to this tab
            const attributeConfigs = attributeConfigsByTab[tabId] ?? [];
            const dateConfigs = dateConfigsByTab[tabId] ?? [];
            const dateFilterConfig = dateFilterConfigByTab[tabId];
            const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

            // Create processing context for this specific tab
            const processingContext: IFilterProcessingContext = {
                allAttributes,
                allDateDatasets,
                attributeConfigs,
                dateConfigs,
                isCommonDateFilterHidden,
                disableDateFilters,
            };

            // Use edited filters if available, otherwise default selected filters
            const selectedFilters = editedFiltersByTab?.[tabId] ?? tab.defaultSelectedFilters;
            const availableFilters = tab.availableFilters;

            // Apply visible filter logic (removes hidden filters based on config)
            const visibleFilters = computeVisibleFilters(selectedFilters, processingContext);

            // Compute non-selected filters for Add dropdown
            const nonSelectedFilters = getNonSelectedFilters(availableFilters, selectedFilters);

            // Compute catalog items for Add dropdown
            const attributes = computeAddDropdownAttributes(nonSelectedFilters, processingContext);
            const dateDatasets = computeAddDropdownDateDatasets(nonSelectedFilters, processingContext);

            return {
                tabId: tab.tabId,
                tabTitle: tab.tabTitle,
                visibleFilters,
                lockedFilters: tab.lockedFilters,
                attributes,
                dateDatasets,
                nonSelectedFilters,
            };
        });
    }, [
        filtersByTab,
        editedFiltersByTab,
        allAttributes,
        allDateDatasets,
        attributeConfigsByTab,
        dateConfigsByTab,
        dateFilterConfigByTab,
        disableDateFilters,
    ]);

    // Handlers for per-tab filter operations (similar to original hook)
    const handleTabFilterChange = useCallback(
        (tabId: string, updatedFilter: FilterContextItem | undefined) => {
            if (!editedFiltersByTab || !onFiltersByTabChange) {
                return;
            }

            const currentTabFilters = editedFiltersByTab[tabId] ?? [];

            if (!updatedFilter) {
                return;
            }

            const filterLocalId = isDashboardAttributeFilter(updatedFilter)
                ? updatedFilter.attributeFilter.localIdentifier
                : updatedFilter.dateFilter.localIdentifier;

            const updatedTabFilters = currentTabFilters.map((f) => {
                const currentFilterLocalId = isDashboardAttributeFilter(f)
                    ? f.attributeFilter.localIdentifier
                    : f.dateFilter.localIdentifier;
                return currentFilterLocalId === filterLocalId ? updatedFilter : f;
            });

            onFiltersByTabChange({
                ...editedFiltersByTab,
                [tabId]: updatedTabFilters,
            });
        },
        [editedFiltersByTab, onFiltersByTabChange],
    );

    const handleTabFilterDelete = useCallback(
        (tabId: string, filterToDelete: FilterContextItem) => {
            if (!editedFiltersByTab || !onFiltersByTabChange) {
                return;
            }

            const currentTabFilters = editedFiltersByTab[tabId] ?? [];
            const filterLocalId = isDashboardAttributeFilter(filterToDelete)
                ? filterToDelete.attributeFilter.localIdentifier
                : filterToDelete.dateFilter.localIdentifier;

            const updatedTabFilters = currentTabFilters.filter((f) => {
                const currentFilterLocalId = isDashboardAttributeFilter(f)
                    ? f.attributeFilter.localIdentifier
                    : f.dateFilter.localIdentifier;
                return currentFilterLocalId !== filterLocalId;
            });

            onFiltersByTabChange({
                ...editedFiltersByTab,
                [tabId]: updatedTabFilters,
            });
        },
        [editedFiltersByTab, onFiltersByTabChange],
    );

    const handleTabFilterAdd = useCallback(
        (
            tabId: string,
            displayForm: ObjRef,
            _attributes: ICatalogAttribute[],
            dateDatasets: ICatalogDateDataset[],
        ) => {
            if (!editedFiltersByTab || !onFiltersByTabChange || !filtersByTab) {
                return;
            }

            const currentTabFilters = editedFiltersByTab[tabId] ?? [];
            const tabData = filtersByTab.find((t) => t.tabId === tabId);
            if (!tabData) {
                return;
            }

            const availableFilter = tabData.availableFilters.find((f) => {
                if (isDashboardAttributeFilter(f)) {
                    return areObjRefsEqual(f.attributeFilter.displayForm, displayForm);
                } else if (isDashboardDateFilter(f)) {
                    const matchingDateDataset = dateDatasets.find((ds) =>
                        areObjRefsEqual(ds.dataSet.ref, displayForm),
                    );
                    return matchingDateDataset && areObjRefsEqual(f.dateFilter.dataSet, displayForm);
                }
                return false;
            });

            if (availableFilter) {
                onFiltersByTabChange({
                    ...editedFiltersByTab,
                    [tabId]: [...currentTabFilters, availableFilter],
                });
            }
        },
        [editedFiltersByTab, onFiltersByTabChange, filtersByTab],
    );

    const handleStoreFiltersChange = useCallback(
        (value: boolean) => {
            onStoreFiltersChange(value, undefined, editedFiltersByTab);
        },
        [editedFiltersByTab, onStoreFiltersChange],
    );

    const makeFilterGroupUnfocusable = useCallback(() => {
        requestAnimationFrame(() => {
            if (filterGroupRef.current) {
                filterGroupRef.current.removeAttribute("tabindex");
            }
        });
    }, []);

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

    // Get common configs from first tab
    const firstTab = filtersByTab?.[0];
    const activeTabId = firstTab?.tabId;
    const attributeConfigs = attributeConfigsByTab[activeTabId ?? ""] ?? [];
    const dateConfigs = dateConfigsByTab[activeTabId ?? ""] ?? [];

    // Compute all locked filters across all tabs
    const lockedFilters = useMemo(() => {
        if (!processedFiltersByTab) {
            return [];
        }
        return processedFiltersByTab.flatMap((tab) => tab.lockedFilters);
    }, [processedFiltersByTab]);

    return {
        commonDateFilterId,
        lockedFilters,
        processedFiltersByTab,
        attributeConfigs,
        dateConfigs,
        filterAnnouncement,
        filterGroupRef,
        handleTabFilterChange,
        handleTabFilterDelete,
        handleTabFilterAdd,
        handleStoreFiltersChange,
        makeFilterGroupUnfocusable,
        setAddFilterButtonRefs,
    };
};
