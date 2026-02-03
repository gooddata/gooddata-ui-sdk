// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { type CatalogItemPickerSelectionMode, type CatalogItemPickerType } from "./types.js";

interface IUseCatalogItemPickerStateParams {
    isOpen: boolean;
    selectionMode: CatalogItemPickerSelectionMode;
    itemTypes: CatalogItemPickerType[];
}

/**
 * @internal
 */
export function useCatalogItemPickerState({
    isOpen,
    selectionMode,
    itemTypes,
}: IUseCatalogItemPickerStateParams) {
    const [searchString, setSearchString] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [activeType, setActiveType] = useState<CatalogItemPickerType>(itemTypes[0]);

    useEffect(() => {
        if (!itemTypes.includes(activeType)) {
            setActiveType(itemTypes[0]);
        }
    }, [activeType, itemTypes]);

    useEffect(() => {
        if (!isOpen) {
            setSearchString("");
            setSelectedIds(new Set());
        }
    }, [isOpen]);

    const handleItemSelect = useCallback(
        (id: string) => {
            if (selectionMode === "single") {
                return;
            }
            setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        },
        [selectionMode],
    );

    const handleSearchChange = useCallback((value: string | number) => {
        setSearchString(String(value));
    }, []);

    const handleSearchEscKeyPress = useCallback(
        (e: KeyboardEvent) => {
            if (searchString.length > 0) {
                e.stopPropagation();
            }
        },
        [searchString],
    );

    const resetSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    return {
        searchString,
        selectedIds,
        activeType,
        setActiveType,
        setSelectedIds,
        handleItemSelect,
        handleSearchChange,
        handleSearchEscKeyPress,
        resetSelection,
    };
}
