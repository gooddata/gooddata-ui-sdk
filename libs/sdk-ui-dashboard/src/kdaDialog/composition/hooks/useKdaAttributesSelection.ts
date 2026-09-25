// (C) 2025-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type ICatalogAttribute, serializeObjRef } from "@gooddata/sdk-model";

/**
 * Keys the item by its typed ref, so that a label and a computed attribute with the same id are two rows.
 * objRefToString would drop the `type` and collapse the two into one.
 */
export const getAttributeKey = (item: ICatalogAttribute) => serializeObjRef(item.attribute.ref);
export const getAttributeTitle = (item: ICatalogAttribute) => item.attribute.title;

export function useKdaAttributesSelection(
    validAttributes: ICatalogAttribute[],
    initialAttributes: ICatalogAttribute[],
) {
    const [searchString, setSearchString] = useState("");
    const [selection, setSelection] = useState(initialAttributes);
    const [isInverted, setIsInverted] = useState(false);

    const resetSelection = useCallback(() => {
        setSelection(initialAttributes);
        setIsInverted(false);
        setSearchString("");
    }, [initialAttributes]);

    const filteredOptions = useMemo(() => {
        if (!searchString) {
            return validAttributes;
        }
        const lowerSearch = searchString.toLowerCase();
        return validAttributes.filter((option) =>
            getAttributeTitle(option).toLowerCase().includes(lowerSearch),
        );
    }, [validAttributes, searchString]);

    const resolvedSelection = useMemo(() => {
        if (!isInverted) {
            return selection;
        }
        const selectedIds = new Set(selection.map(getAttributeKey));
        return validAttributes.filter((a) => !selectedIds.has(getAttributeKey(a)));
    }, [isInverted, selection, validAttributes]);

    const isApplyDisabled = useMemo(() => {
        if (resolvedSelection.length === 0) {
            return true;
        }
        const currentIds = new Set(resolvedSelection.map(getAttributeKey));
        const committedIds = new Set(initialAttributes.map(getAttributeKey));
        return currentIds.size === committedIds.size && [...currentIds].every((id) => committedIds.has(id));
    }, [resolvedSelection, initialAttributes]);

    const onSelect = useCallback((selectedItems: ICatalogAttribute[], inverted: boolean) => {
        setSelection(selectedItems);
        setIsInverted(inverted);
    }, []);

    return {
        searchString,
        setSearchString,
        selection,
        isInverted,
        filteredOptions,
        resolvedSelection,
        isApplyDisabled,
        onSelect,
        resetSelection,
    };
}
