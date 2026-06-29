// (C) 2026 GoodData Corporation

import { useEffect, useId, useMemo, useRef } from "react";

import { type ICatalogItemPickerProps } from "./types.js";
import { useAttributeItemsData } from "./useAttributeItemsData.js";
import { useCatalogItemPickerHandlers } from "./useCatalogItemPickerHandlers.js";
import { useEnsureActiveType, useFilteredMetricItems, usePickerTabs } from "./useCatalogItemPickerHooks.js";
import { useCatalogItemPickerLabels } from "./useCatalogItemPickerLabels.js";
import { useCatalogItemPickerListboxItems } from "./useCatalogItemPickerListboxItems.js";
import { useCatalogItemPickerState } from "./useCatalogItemPickerState.js";
import { useDateDatasetSelection } from "./useDateDatasetSelection.js";
import { groupMetricCatalogItems } from "./utils.js";

/**
 * Encapsulates all state, derived data and event handlers of the catalog item picker.
 *
 * It is shared between {@link CatalogItemPicker} (which wraps the body with a header) and
 * {@link CatalogItemPickerBody} (the header-less search + grouped list, reused e.g. in the ranking
 * filter measure dropdown).
 *
 * @internal
 */
export function useCatalogItemPicker<TAttributePayload = unknown, TMetricPayload = unknown>({
    itemTypes,
    selectionMode,
    attributeItems,
    metricItems,
    groups,
    isOpen = true,
    isLoading = false,
    onClose,
    onAdd,
    onSelect,
    variant = "addFilter",
}: ICatalogItemPickerProps<TAttributePayload, TMetricPayload>) {
    const listboxId = useId();

    // Compute available items
    const allAttributeItems = useMemo(
        () => [...(attributeItems?.insightItems ?? []), ...(attributeItems?.catalogItems ?? [])],
        [attributeItems],
    );

    // Check if there are any date items
    const hasDateItems = useMemo(
        () => allAttributeItems.some((item) => item.type === "date"),
        [allAttributeItems],
    );

    const resolvedItemTypes = useMemo(() => {
        const filtered = itemTypes.filter((type) => type !== "date" || hasDateItems);
        return filtered.length > 0 ? filtered : itemTypes;
    }, [hasDateItems, itemTypes]);

    // Selection and search state
    const {
        searchString,
        selectedIds,
        activeType,
        setActiveType,
        setSelectedIds,
        handleItemSelect,
        handleSearchChange,
        handleSearchEscKeyPress,
        resetSelection,
    } = useCatalogItemPickerState({
        isOpen,
        selectionMode,
        itemTypes: resolvedItemTypes,
    });

    // Tab management
    const { showTabs, effectiveType } = usePickerTabs(resolvedItemTypes, activeType);
    const isMultiSelect = selectionMode === "multiple";

    // Labels
    const labels = useCatalogItemPickerLabels({ variant, effectiveType });

    // Reset to first tab when loading finishes
    const wasLoading = useRef(isLoading);
    useEffect(() => {
        if (wasLoading.current && !isLoading) {
            setActiveType(resolvedItemTypes[0]);
        }
        wasLoading.current = isLoading;
    }, [isLoading, resolvedItemTypes, setActiveType]);

    useEnsureActiveType(resolvedItemTypes, showTabs, setActiveType);

    // Date dataset selection
    const {
        dateDatasetOptions,
        effectiveSelectedDateDatasetKey,
        isDateDatasetDropdownOpen,
        shouldShowDateDatasetSelector,
        setSelectedDateDatasetKey,
        setIsDateDatasetDropdownOpen,
    } = useDateDatasetSelection({ allAttributeItems, effectiveType });

    // Attribute items data
    const { filteredInsightItems, filteredCatalogItems, catalogItemsByDataset, ungroupedCatalogItems } =
        useAttributeItemsData({
            availableInsightItems: attributeItems?.insightItems ?? [],
            availableCatalogItems: attributeItems?.catalogItems ?? [],
            searchString,
            activeType: effectiveType === "date" ? "date" : "attribute",
            selectedDateDatasetKey: effectiveSelectedDateDatasetKey,
        });

    // Metric items data
    const metricInsightItems = useFilteredMetricItems(
        metricItems,
        searchString,
        effectiveType,
        "insightItems",
    );
    const metricCatalogItems = useFilteredMetricItems(
        metricItems,
        searchString,
        effectiveType,
        "catalogItems",
    );

    const groupedMetricCatalogItems = useMemo(
        () => groupMetricCatalogItems(metricCatalogItems, groups, labels.ungroupedTitle),
        [labels.ungroupedTitle, metricCatalogItems, groups],
    );

    // Build listbox items
    const listboxItems = useCatalogItemPickerListboxItems({
        effectiveType,
        metricInsightItems,
        groupedMetricCatalogItems,
        filteredInsightItems,
        filteredCatalogItems,
        catalogItemsByDataset,
        ungroupedCatalogItems,
        selectedIds,
        isLoading,
        shouldShowDateDatasetSelector,
        dateDatasetOptions,
        effectiveSelectedDateDatasetKey,
        isDateDatasetDropdownOpen,
        listboxId,
        labels,
        variant,
        setSelectedDateDatasetKey,
        setIsDateDatasetDropdownOpen,
    });

    // Event handlers
    const { handleListboxSelect, handleAdd, handleTabChange } = useCatalogItemPickerHandlers({
        selectionMode,
        selectedIds,
        setSelectedIds,
        listboxItems,
        onClose,
        onAdd,
        onSelect,
        handleItemSelect,
        setActiveType,
        resetSelection,
    });

    // Computed display state
    const hasSelectableItems = useMemo(() => {
        if (effectiveType === "metric") {
            return (
                metricInsightItems.length > 0 ||
                groupedMetricCatalogItems.some((group) => group.items.length > 0)
            );
        }
        return (
            filteredInsightItems.length > 0 ||
            filteredCatalogItems.length > 0 ||
            shouldShowDateDatasetSelector
        );
    }, [
        effectiveType,
        filteredCatalogItems.length,
        filteredInsightItems.length,
        groupedMetricCatalogItems,
        metricInsightItems.length,
        shouldShowDateDatasetSelector,
    ]);

    const shouldShowEmptyStateMessage = !isLoading && !hasSelectableItems;
    const isAddDisabled = !isMultiSelect || selectedIds.size === 0;
    const emptyMessage = searchString.trim() ? labels.emptyNoResults : labels.emptyNoItems;

    return {
        listboxId,
        labels,
        searchString,
        handleSearchChange,
        handleSearchEscKeyPress,
        showTabs,
        effectiveType,
        resolvedItemTypes,
        handleTabChange,
        listboxItems,
        handleListboxSelect,
        isMultiSelect,
        isAddDisabled,
        handleAdd,
        shouldShowEmptyStateMessage,
        emptyMessage,
        isLoading,
        selectionMode,
        variant,
    };
}

/**
 * Return type of {@link useCatalogItemPicker}.
 *
 * @internal
 */
export type CatalogItemPickerController = ReturnType<typeof useCatalogItemPicker>;
