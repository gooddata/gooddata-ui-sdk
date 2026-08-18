// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    type FilterContextItem,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type ICatalogMeasure,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardMeasureValueFilterConfig,
    type ObjRef,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

import {
    applyFilterChange,
    getCatalogAttributesByFilters,
    getCatalogDateDatasetsByFilters,
    getCatalogMeasuresByFilters,
    getFilterTitle,
    getNonHiddenFilters,
    getNonSelectedFilters,
    removeFilterFrom,
    resolveFilterToAdd,
    resolveTabFilterToAdd,
} from "./utils.js";

//
// Helper functions for computing filter data
//

interface IFilterProcessingContext {
    allAttributes: ICatalogAttribute[];
    allDateDatasets: ICatalogDateDataset[];
    allMeasures: ICatalogMeasure[];
    attributeConfigs: IDashboardAttributeFilterConfig[];
    dateConfigs: IDashboardDateFilterConfigItem[];
    mvfConfigs: IDashboardMeasureValueFilterConfig[];
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

/**
 * Computes catalog measures available for the Add filter dropdown.
 */
function computeAddDropdownMeasures(
    nonSelectedFilters: FilterContextItem[],
    context: IFilterProcessingContext,
): ICatalogMeasure[] {
    return getCatalogMeasuresByFilters(nonSelectedFilters, context.allMeasures, context.mvfConfigs);
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
    /** Catalog measures available for Add filter dropdown (for re-adding removed MVFs) */
    measures: ICatalogMeasure[];
    /** Non-selected filters (available but not yet selected) */
    nonSelectedFilters: FilterContextItem[];
    /** Attribute filter configs for this tab */
    attributeConfigs: IDashboardAttributeFilterConfig[];
    /** Date filter configs for this tab */
    dateConfigs: IDashboardDateFilterConfigItem[];
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
    onFiltersChange: (filters: FilterContextItem[]) => void;
    onStoreFiltersChange: (
        shouldStore: boolean,
        filters: FilterContextItem[],
        filtersByTab?: Record<string, FilterContextItem[]>,
    ) => void;
}) => {
    const intl = useIntl();
    const {
        catalogAttributes: allAttributes,
        catalogDateDatasets: allDateDatasets,
        catalogMeasures: allMeasures,
        attributeFilterConfigs: attributeConfigs,
        dateFilterConfigs: dateConfigs,
        measureValueFilterConfigs: mvfConfigs,
        dateFilterContextConfig: dateFilterConfig,
        commonDateFilterId,
        lockedFilters,
    } = useAutomationsContext();

    const [filterAnnouncement, setFilterAnnouncement] = useState<string>("");

    const addFilterButtonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

    const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

    // Create processing context for helper functions
    const processingContext: IFilterProcessingContext = useMemo(
        () => ({
            allAttributes,
            allDateDatasets,
            allMeasures,
            attributeConfigs,
            dateConfigs,
            mvfConfigs,
            isCommonDateFilterHidden,
            disableDateFilters,
        }),
        [
            allAttributes,
            allDateDatasets,
            allMeasures,
            attributeConfigs,
            dateConfigs,
            mvfConfigs,
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

    const measures = useMemo(
        () => computeAddDropdownMeasures(nonSelectedFilters, processingContext),
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

            const updatedFilters = applyFilterChange(selectedFilters, filter);
            onFiltersChange(updatedFilters);
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

            const updatedFilters = removeFilterFrom(selectedFilters, filter);
            onFiltersChange(updatedFilters);

            focusFilterGroup();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onFiltersChange, focusFilterGroup, selectedFilters, allAttributes, allDateDatasets, intl],
    );

    const handleAddFilter = useCallback(
        (catalogItemRef: ObjRef, attributes: ICatalogAttribute[], dateDatasets: ICatalogDateDataset[]) => {
            const filter = resolveFilterToAdd(catalogItemRef, nonSelectedFilters, attributes, dateDatasets);

            if (filter) {
                const filterTitle = getFilterTitle(filter, allAttributes, allDateDatasets, intl);
                const message = intl.formatMessage(
                    { id: "automationFilters.announcement.filterAdded" },
                    { title: filterTitle },
                );

                const updatedFilters = [...selectedFilters, filter];
                onFiltersChange(updatedFilters);

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
        measures,
        attributeConfigs,
        dateConfigs,
        filterAnnouncement,
        filterGroupRef,
        makeFilterGroupUnfocusable,
        focusAddFilterButton,
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
    const {
        catalogAttributes: allAttributes,
        catalogDateDatasets: allDateDatasets,
        catalogMeasures: allMeasures,
        commonDateFilterId,
        attributeFilterConfigsByTab: attributeConfigsByTab,
        dateFilterConfigsByTab: dateConfigsByTab,
        dateFilterConfigOverridesByTab: dateFilterConfigByTab,
        measureValueFilterConfigsByTab: mvfConfigsByTab,
    } = useAutomationsContext();

    const [filterAnnouncement] = useState<string>("");
    const addFilterButtonRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

    const processedFiltersByTab = useMemo(() => {
        if (!filtersByTab || filtersByTab.length === 0) {
            return undefined;
        }

        return filtersByTab.map((tab): IProcessedAutomationFiltersTab => {
            const tabId = tab.tabId;

            // Get configs specific to this tab
            const attributeConfigs = attributeConfigsByTab[tabId] ?? [];
            const dateConfigs = dateConfigsByTab[tabId] ?? [];
            const mvfConfigs = mvfConfigsByTab[tabId] ?? [];
            const dateFilterConfig = dateFilterConfigByTab[tabId];
            const isCommonDateFilterHidden = dateFilterConfig?.mode === "hidden";

            // Create processing context for this specific tab
            const processingContext: IFilterProcessingContext = {
                allAttributes,
                allDateDatasets,
                allMeasures,
                attributeConfigs,
                dateConfigs,
                mvfConfigs,
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
            const measures = computeAddDropdownMeasures(nonSelectedFilters, processingContext);

            return {
                tabId: tab.tabId,
                tabTitle: tab.tabTitle,
                visibleFilters,
                lockedFilters: tab.lockedFilters,
                attributes,
                dateDatasets,
                measures,
                nonSelectedFilters,
                attributeConfigs,
                dateConfigs,
            };
        });
    }, [
        filtersByTab,
        editedFiltersByTab,
        allAttributes,
        allDateDatasets,
        allMeasures,
        attributeConfigsByTab,
        dateConfigsByTab,
        dateFilterConfigByTab,
        mvfConfigsByTab,
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

            const updatedTabFilters = applyFilterChange(currentTabFilters, updatedFilter);

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
            const updatedTabFilters = removeFilterFrom(currentTabFilters, filterToDelete);

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
            attributes: ICatalogAttribute[],
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

            const availableFilter = resolveTabFilterToAdd(
                displayForm,
                tabData.availableFilters,
                attributes,
                dateDatasets,
            );

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
