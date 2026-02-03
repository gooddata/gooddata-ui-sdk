// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo } from "react";

import { type CatalogItemListboxItem, type ICatalogItemPickerListItemData } from "./listboxItemBuilders.js";
import {
    type CatalogItemPickerSelectionMode,
    type CatalogItemPickerType,
    type ICatalogItemPickerItem,
} from "./types.js";
import { type IUiListboxInteractiveItem } from "../@ui/UiListbox/types.js";

interface IUseCatalogItemPickerHandlersParams<TAttributePayload, TMetricPayload> {
    selectionMode: CatalogItemPickerSelectionMode;
    selectedIds: Set<string>;
    setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
    listboxItems: CatalogItemListboxItem[];
    onClose: () => void;
    onAdd?: (items: Array<TAttributePayload | TMetricPayload>) => void;
    onSelect?: (item: TAttributePayload | TMetricPayload) => void;
    handleItemSelect: (id: string) => void;
    setActiveType: (type: CatalogItemPickerType) => void;
    resetSelection: () => void;
}

interface ICatalogItemPickerHandlersResult<_TAttributePayload, _TMetricPayload> {
    itemById: Map<string, ICatalogItemPickerItem>;
    handleListboxSelect: (item: IUiListboxInteractiveItem<ICatalogItemPickerListItemData>) => void;
    handleAdd: () => void;
    handleTabChange: (type: CatalogItemPickerType) => void;
}

/**
 * Hook to manage catalog item picker event handlers.
 *
 * @internal
 */
export function useCatalogItemPickerHandlers<TAttributePayload = unknown, TMetricPayload = unknown>({
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
}: IUseCatalogItemPickerHandlersParams<TAttributePayload, TMetricPayload>): ICatalogItemPickerHandlersResult<
    TAttributePayload,
    TMetricPayload
> {
    // Item lookup map
    const itemById = useMemo(() => {
        const map = new Map<string, ICatalogItemPickerItem>();
        listboxItems.forEach((item) => {
            if (item.type === "interactive") {
                const interactiveItem = item as IUiListboxInteractiveItem<ICatalogItemPickerListItemData>;
                map.set(interactiveItem.id, interactiveItem.data.item);
            }
        });
        return map;
    }, [listboxItems]);

    // Sync selected IDs with available items
    useEffect(() => {
        setSelectedIds((prev) => {
            const next = new Set<string>();
            prev.forEach((id) => {
                if (itemById.has(id)) {
                    next.add(id);
                }
            });
            if (next.size !== prev.size) {
                return next;
            }
            for (const id of next) {
                if (!prev.has(id)) {
                    return next;
                }
            }
            return prev;
        });
    }, [itemById, setSelectedIds]);

    const handleListboxSelect = useCallback(
        (item: IUiListboxInteractiveItem<ICatalogItemPickerListItemData>) => {
            if (selectionMode === "single") {
                onSelect?.(item.data.item.payload as TAttributePayload | TMetricPayload);
                onClose();
                return;
            }
            handleItemSelect(item.id);
        },
        [handleItemSelect, onClose, onSelect, selectionMode],
    );

    const handleAdd = useCallback(() => {
        const selectedItems = Array.from(selectedIds)
            .map((id) => itemById.get(id))
            .filter((item): item is ICatalogItemPickerItem => !!item)
            .map((item) => item.payload as TAttributePayload | TMetricPayload);
        onAdd?.(selectedItems);
    }, [itemById, onAdd, selectedIds]);

    const handleTabChange = useCallback(
        (type: CatalogItemPickerType) => {
            setActiveType(type);
            resetSelection();
        },
        [resetSelection, setActiveType],
    );

    return {
        itemById,
        handleListboxSelect,
        handleAdd,
        handleTabChange,
    };
}
