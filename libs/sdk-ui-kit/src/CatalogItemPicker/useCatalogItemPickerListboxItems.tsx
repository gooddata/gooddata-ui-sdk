// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { DateDatasetPickerItem } from "./DateDatasetPickerItem.js";
import {
    type CatalogItemListboxItem,
    type ICatalogItemPickerListItemData,
    buildAttributeListboxItems,
    buildLoadingRow,
    buildMetricListboxItems,
} from "./listboxItemBuilders.js";
import { type CatalogItemPickerType, type ICatalogItemPickerItem } from "./types.js";

export interface ICatalogItemPickerLabels {
    title: string;
    emptyNoResults: string;
    emptyNoItems: string;
    fromVisualization: string;
    addLabel?: string;
    addTooltip?: string;
    dateAsLabel?: string;
    tabLabels?: Partial<Record<CatalogItemPickerType, string>>;
    cancelLabel: string;
    backAriaLabel: string;
    closeAriaLabel: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    ungroupedTitle: string;
}

export interface IUseCatalogItemPickerListboxItemsParams {
    effectiveType: CatalogItemPickerType;
    metricInsightItems: ICatalogItemPickerItem[];
    groupedMetricCatalogItems: Array<{ title: string; items: ICatalogItemPickerItem[] }>;
    filteredInsightItems: ICatalogItemPickerItem[];
    filteredCatalogItems: ICatalogItemPickerItem[];
    catalogItemsByDataset: Map<string, { title: string; items: ICatalogItemPickerItem[] }>;
    ungroupedCatalogItems: ICatalogItemPickerItem[];
    selectedIds: Set<string>;
    isLoading: boolean;
    shouldShowDateDatasetSelector: boolean;
    dateDatasetOptions: Array<{ key: string; title: string }>;
    effectiveSelectedDateDatasetKey: string | undefined;
    isDateDatasetDropdownOpen: boolean;
    listboxId: string;
    labels: ICatalogItemPickerLabels;
    variant: "mvf" | "addFilter";
    setSelectedDateDatasetKey: (key: string | undefined) => void;
    setIsDateDatasetDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export function useCatalogItemPickerListboxItems(
    params: IUseCatalogItemPickerListboxItemsParams,
): CatalogItemListboxItem[] {
    const {
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
    } = params;

    return useMemo(() => {
        const makeInteractiveItem = (item: ICatalogItemPickerItem): CatalogItemListboxItem => ({
            type: "interactive" as const,
            id: item.id,
            stringTitle: item.title,
            data: {
                item,
                isSelected: selectedIds.has(item.id),
            } as ICatalogItemPickerListItemData,
        });

        if (effectiveType === "metric") {
            const metricItems = buildMetricListboxItems({
                metricInsightItems,
                groupedMetricCatalogItems,
                fromVisualizationTitle: labels.fromVisualization,
                variant,
                makeInteractiveItem,
            });
            if (isLoading && metricItems.length === 0) {
                return [buildLoadingRow(variant)];
            }
            return metricItems;
        }

        const shouldShowCatalogLoadingRow = isLoading && filteredCatalogItems.length === 0;
        const hasCatalogItems =
            effectiveType === "date" ? filteredCatalogItems.length > 0 : catalogItemsByDataset.size > 0;

        const dateDatasetSelectorItem =
            shouldShowDateDatasetSelector && effectiveType === "date"
                ? {
                      type: "static" as const,
                      id: "date-dataset-selector",
                      data: (
                          <DateDatasetPickerItem
                              dateDatasetOptions={dateDatasetOptions}
                              selectedDateDatasetKey={effectiveSelectedDateDatasetKey}
                              isDropdownOpen={isDateDatasetDropdownOpen}
                              onSelect={(key) => {
                                  setSelectedDateDatasetKey(key);
                                  setIsDateDatasetDropdownOpen(false);
                              }}
                              onToggleDropdown={() => setIsDateDatasetDropdownOpen((open) => !open)}
                              listboxId={listboxId}
                              dateAsLabel={labels.dateAsLabel ?? ""}
                          />
                      ),
                  }
                : undefined;

        return buildAttributeListboxItems({
            filteredInsightItems,
            filteredCatalogItems,
            catalogItemsByDataset,
            ungroupedCatalogItems,
            shouldShowDateDatasetSelector,
            shouldShowCatalogLoadingRow,
            hasCatalogItems,
            effectiveType: effectiveType === "date" ? "date" : "attribute",
            fromVisualizationTitle: labels.fromVisualization,
            ungroupedTitle: labels.ungroupedTitle,
            variant,
            dateDatasetSelectorItem,
            makeInteractiveItem,
        });
    }, [
        catalogItemsByDataset,
        dateDatasetOptions,
        effectiveSelectedDateDatasetKey,
        effectiveType,
        filteredCatalogItems,
        filteredInsightItems,
        groupedMetricCatalogItems,
        isDateDatasetDropdownOpen,
        isLoading,
        listboxId,
        metricInsightItems,
        selectedIds,
        setIsDateDatasetDropdownOpen,
        setSelectedDateDatasetKey,
        shouldShowDateDatasetSelector,
        labels,
        ungroupedCatalogItems,
        variant,
    ]);
}
