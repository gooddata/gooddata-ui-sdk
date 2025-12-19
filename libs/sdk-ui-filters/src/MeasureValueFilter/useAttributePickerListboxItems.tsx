// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { type IntlShape } from "react-intl";

import { type IUiListboxInteractiveItem, type IUiListboxItem, LoadingSpinner } from "@gooddata/sdk-ui-kit";

import { DateDatasetPickerItem } from "./DateDatasetPickerItem.js";
import { type IDateDatasetOption, type IDimensionalityItem } from "./typings.js";

/**
 * Data attached to each interactive listbox item.
 */
export interface IAttributePickerItemData {
    dimensionalityItem: IDimensionalityItem;
}

interface IUseAttributePickerListboxItemsParams {
    filteredInsightItems: IDimensionalityItem[];
    filteredCatalogItems: IDimensionalityItem[];
    catalogItemsByDataset: Map<string, { title: string; items: IDimensionalityItem[] }>;
    getItemId: (item: IDimensionalityItem) => string;
    intl: IntlShape;
    effectiveTypeFilter: "attribute" | "date";
    shouldShowDateDatasetSelector: boolean;
    dateDatasetOptions: IDateDatasetOption[];
    effectiveSelectedDateDatasetKey: string | undefined;
    isDateDatasetDropdownOpen: boolean;
    setSelectedDateDatasetKey: (key: string | undefined) => void;
    setIsDateDatasetDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    listboxId: string;
    isLoadingCatalogDimensionality?: boolean;
}

type ListboxItem =
    | IUiListboxInteractiveItem<IAttributePickerItemData>
    | IUiListboxItem<IAttributePickerItemData>;

/**
 * @internal
 * Hook that builds listbox items with sections for the AttributePicker.
 */
export function useAttributePickerListboxItems({
    filteredInsightItems,
    filteredCatalogItems,
    catalogItemsByDataset,
    getItemId,
    intl,
    effectiveTypeFilter,
    shouldShowDateDatasetSelector,
    dateDatasetOptions,
    effectiveSelectedDateDatasetKey,
    isDateDatasetDropdownOpen,
    setSelectedDateDatasetKey,
    setIsDateDatasetDropdownOpen,
    listboxId,
    isLoadingCatalogDimensionality,
}: IUseAttributePickerListboxItemsParams): ListboxItem[] {
    return useMemo((): ListboxItem[] => {
        const items: ListboxItem[] = [];
        const shouldShowCatalogLoadingRow =
            isLoadingCatalogDimensionality && catalogItemsByDataset.size === 0;
        const catalogLoadingRow: IUiListboxItem<IAttributePickerItemData> = {
            type: "static",
            id: "catalog-loading-row",
            data: (
                <div className="gd-ui-kit-listbox__item gd-mvf-attribute-picker-loading-row">
                    <LoadingSpinner className="small gd-mvf-attribute-picker-loading-spinner" />
                </div>
            ),
        };

        // Add "FROM VISUALIZATION" section if there are insight items
        if (filteredInsightItems.length > 0) {
            items.push({
                type: "static",
                id: "header-visualization",
                data: (
                    <div className="gd-mvf-attribute-picker-list-header">
                        {intl.formatMessage({ id: "mvf.dimensionality.section.fromVisualization" })}
                    </div>
                ),
            } as IUiListboxItem<IAttributePickerItemData>);
            filteredInsightItems.forEach((item) => {
                const itemId = getItemId(item);
                items.push({
                    type: "interactive",
                    id: itemId,
                    stringTitle: item.title,
                    data: {
                        dimensionalityItem: item,
                    },
                });
            });
        }

        const shouldRenderDividerBetweenSections =
            filteredInsightItems.length > 0 &&
            (effectiveTypeFilter === "date"
                ? filteredCatalogItems.length > 0 ||
                  shouldShowDateDatasetSelector ||
                  shouldShowCatalogLoadingRow
                : catalogItemsByDataset.size > 0 || shouldShowCatalogLoadingRow);
        if (shouldRenderDividerBetweenSections) {
            items.push({
                type: "static",
                id: "divider-visualization-catalog",
                data: <div className="gd-mvf-attribute-picker-divider" />,
            } as IUiListboxItem<IAttributePickerItemData>);
        }

        // Date tab: render dataset selector + dataset-filtered date attributes (no dataset headers)
        if (effectiveTypeFilter === "date") {
            if (shouldShowDateDatasetSelector) {
                items.push({
                    type: "static",
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
                            intl={intl}
                        />
                    ),
                } as IUiListboxItem<IAttributePickerItemData>);
            }

            filteredCatalogItems.forEach((item) => {
                const itemId = getItemId(item);
                items.push({
                    type: "interactive",
                    id: itemId,
                    stringTitle: item.title,
                    data: {
                        dimensionalityItem: item,
                    },
                });
            });

            if (shouldShowCatalogLoadingRow && filteredCatalogItems.length === 0) {
                items.push(catalogLoadingRow);
            }

            return items;
        }

        if (shouldShowCatalogLoadingRow && catalogItemsByDataset.size === 0) {
            items.push(catalogLoadingRow);
            return items;
        }

        // Attribute tab: add catalog items grouped by dataset
        catalogItemsByDataset.forEach((group, datasetKey) => {
            items.push({
                type: "static",
                id: `header-${datasetKey}`,
                data: <div className="gd-mvf-attribute-picker-list-header">{group.title.toUpperCase()}</div>,
            } as IUiListboxItem<IAttributePickerItemData>);
            group.items.forEach((item) => {
                const itemId = getItemId(item);
                items.push({
                    type: "interactive",
                    id: itemId,
                    stringTitle: item.title,
                    data: {
                        dimensionalityItem: item,
                    },
                });
            });
        });

        return items;
    }, [
        filteredInsightItems,
        filteredCatalogItems,
        catalogItemsByDataset,
        getItemId,
        intl,
        effectiveTypeFilter,
        shouldShowDateDatasetSelector,
        dateDatasetOptions,
        effectiveSelectedDateDatasetKey,
        isDateDatasetDropdownOpen,
        listboxId,
        isLoadingCatalogDimensionality,
        setSelectedDateDatasetKey,
        setIsDateDatasetDropdownOpen,
    ]);
}
