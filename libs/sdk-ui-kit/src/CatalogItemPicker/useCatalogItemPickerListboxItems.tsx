// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { DateDatasetPickerItem } from "./DateDatasetPickerItem.js";
import {
    type CatalogItemListboxItem,
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

export interface IUseCatalogItemPickerListboxItemsParams<TPayload = unknown> {
    effectiveType: CatalogItemPickerType;
    metricInsightItems: ICatalogItemPickerItem<TPayload>[];
    groupedMetricCatalogItems: Array<{ title: string; items: ICatalogItemPickerItem<TPayload>[] }>;
    filteredInsightItems: ICatalogItemPickerItem<TPayload>[];
    filteredCatalogItems: ICatalogItemPickerItem<TPayload>[];
    catalogItemsByDataset: Map<string, { title: string; items: ICatalogItemPickerItem<TPayload>[] }>;
    ungroupedCatalogItems: ICatalogItemPickerItem<TPayload>[];
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

export function useCatalogItemPickerListboxItems<TPayload>(
    params: IUseCatalogItemPickerListboxItemsParams<TPayload>,
): CatalogItemListboxItem<TPayload>[] {
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
        const makeInteractiveItem = (
            item: ICatalogItemPickerItem<TPayload>,
        ): CatalogItemListboxItem<TPayload> => ({
            type: "interactive" as const,
            id: item.id,
            stringTitle: item.title,
            data: {
                item,
                isSelected: selectedIds.has(item.id),
            },
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
