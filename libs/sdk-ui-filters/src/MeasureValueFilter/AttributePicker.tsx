// (C) 2025-2026 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { objRefToString } from "@gooddata/sdk-model";
import {
    CatalogItemPicker,
    type CatalogItemPickerType,
    type ICatalogItemPickerItem,
    type ICatalogItemPickerItems,
    Overlay,
} from "@gooddata/sdk-ui-kit";

import { type IDimensionalityItem } from "./typings.js";
const isDateDimensionalityItem = (item: IDimensionalityItem) =>
    item.type === "chronologicalDate" || item.type === "genericDate";

interface IAttributePickerProps {
    /**
     * Available items from the current visualization (bucket-based dimensionality).
     * These are already filtered to only include items that can be added.
     */
    availableInsightItems: IDimensionalityItem[];
    /**
     * Available items from catalog (validated via computeValidObjects).
     * These are already filtered to only include items that can be added.
     */
    availableCatalogItems: IDimensionalityItem[];
    /**
     * Whether catalog dimensionality is currently being loaded.
     */
    isLoadingCatalogDimensionality?: boolean;
    /**
     * Callback when items are added.
     */
    onAdd: (items: IDimensionalityItem[]) => void;
    /**
     * Callback when the picker is closed without adding.
     */
    onCancel: () => void;
    /**
     * The element to anchor the overlay to.
     */
    anchorElement: HTMLElement;
}

/**
 * @internal
 * AttributePicker dialog for selecting dimensionality items to add to the filter.
 */
export const AttributePicker = memo(function AttributePicker({
    availableInsightItems,
    availableCatalogItems,
    isLoadingCatalogDimensionality,
    onAdd,
    onCancel,
    anchorElement,
}: IAttributePickerProps) {
    const getItemId = useCallback((item: IDimensionalityItem): string => {
        return objRefToString(item.identifier);
    }, []);

    const availableItems = useMemo(() => {
        return [...availableInsightItems, ...availableCatalogItems];
    }, [availableInsightItems, availableCatalogItems]);

    const isCatalogLoading =
        isLoadingCatalogDimensionality ||
        (isLoadingCatalogDimensionality === undefined && availableCatalogItems.length === 0);

    const itemsForTypeDetection = useMemo(() => {
        const isCatalogNotLoadedYet = (availableCatalogItems?.length ?? 0) === 0 && isCatalogLoading;
        return isCatalogNotLoadedYet ? availableInsightItems : availableItems;
    }, [availableCatalogItems, isCatalogLoading, availableInsightItems, availableItems]);

    const { hasAttributes, hasDates } = useMemo(() => {
        let hasAttributes = false;
        let hasDates = false;
        for (const item of itemsForTypeDetection) {
            const isDateItem = isDateDimensionalityItem(item);
            if (isDateItem) {
                hasDates = true;
            } else {
                hasAttributes = true;
            }
            if (hasAttributes && hasDates) break;
        }
        return { hasAttributes, hasDates };
    }, [itemsForTypeDetection]);

    const itemTypes = useMemo((): CatalogItemPickerType[] => {
        if (hasAttributes && hasDates) {
            return ["attribute", "date"];
        }
        return hasDates ? ["date"] : ["attribute"];
    }, [hasAttributes, hasDates]);

    const toPickerItem = useCallback(
        (item: IDimensionalityItem): ICatalogItemPickerItem<IDimensionalityItem> => {
            const type = isDateDimensionalityItem(item) ? "date" : "attribute";
            return {
                id: getItemId(item),
                title: item.title,
                type,
                payload: item,
                ref: item.ref,
                dataset: item.dataset,
            };
        },
        [getItemId],
    );

    const attributePickerItems = useMemo(
        (): ICatalogItemPickerItems<IDimensionalityItem> => ({
            insightItems: availableInsightItems.map(toPickerItem),
            catalogItems: availableCatalogItems.map(toPickerItem),
        }),
        [availableCatalogItems, availableInsightItems, toPickerItem],
    );

    return (
        <Overlay
            alignTo={anchorElement}
            alignPoints={[{ align: "tr tl" }, { align: "tl tr" }, { align: "br bl" }, { align: "bl br" }]}
            positionType="sameAsTarget"
            closeOnOutsideClick
            closeOnEscape
            onClose={onCancel}
        >
            <div className="gd-dropdown overlay">
                <CatalogItemPicker
                    itemTypes={itemTypes}
                    selectionMode="single"
                    attributeItems={attributePickerItems}
                    isLoading={isCatalogLoading}
                    onClose={onCancel}
                    onSelect={(item) => onAdd([item as IDimensionalityItem])}
                    variant="mvf"
                />
            </div>
        </Overlay>
    );
});
