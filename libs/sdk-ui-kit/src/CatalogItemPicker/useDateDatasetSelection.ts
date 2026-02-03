// (C) 2026 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { type CatalogItemPickerType, type ICatalogItemPickerItem } from "./types.js";
import { getDateDatasetOptions } from "./utils.js";

interface IUseDateDatasetSelectionParams {
    allAttributeItems: ICatalogItemPickerItem[];
    effectiveType: CatalogItemPickerType;
}

interface IDateDatasetSelectionResult {
    dateDatasetOptions: Array<{ key: string; title: string }>;
    selectedDateDatasetKey: string | undefined;
    effectiveSelectedDateDatasetKey: string | undefined;
    isDateDatasetDropdownOpen: boolean;
    shouldShowDateDatasetSelector: boolean;
    setSelectedDateDatasetKey: (key: string | undefined) => void;
    setIsDateDatasetDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Hook to manage date dataset selection state.
 *
 * @internal
 */
export function useDateDatasetSelection({
    allAttributeItems,
    effectiveType,
}: IUseDateDatasetSelectionParams): IDateDatasetSelectionResult {
    const [selectedDateDatasetKey, setSelectedDateDatasetKey] = useState<string | undefined>(undefined);
    const [isDateDatasetDropdownOpen, setIsDateDatasetDropdownOpen] = useState(false);

    const dateDatasetOptions = useMemo(() => getDateDatasetOptions(allAttributeItems), [allAttributeItems]);

    // Close date dataset dropdown when type changes
    useEffect(() => {
        setIsDateDatasetDropdownOpen(false);
    }, [effectiveType]);

    const effectiveSelectedDateDatasetKey = useMemo(() => {
        if (dateDatasetOptions.length === 0) {
            return undefined;
        }
        return dateDatasetOptions.some((o) => o.key === selectedDateDatasetKey)
            ? selectedDateDatasetKey
            : dateDatasetOptions[0].key;
    }, [dateDatasetOptions, selectedDateDatasetKey]);

    const shouldShowDateDatasetSelector = effectiveType === "date" && dateDatasetOptions.length > 0;

    return {
        dateDatasetOptions,
        selectedDateDatasetKey,
        effectiveSelectedDateDatasetKey,
        isDateDatasetDropdownOpen,
        shouldShowDateDatasetSelector,
        setSelectedDateDatasetKey,
        setIsDateDatasetDropdownOpen,
    };
}
