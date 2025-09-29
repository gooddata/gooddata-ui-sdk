// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { constructTextWrappingMenuItems } from "../../components/Header/utils/constructTextWrappingMenuItems.js";
import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { ITextWrappingMenuItem } from "../../types/menu.js";
import { useGetDefaultTextWrapping } from "../textWrapping/useGetDefaultTextWrapping.js";
import { useUpdateTextWrapping } from "../textWrapping/useUpdateTextWrapping.js";

/**
 * Hook for header cell components that handles menu items and callbacks.
 *
 * @param measureIdentifiers - Array of measure identifiers for the cell
 * @param pivotAttributeDescriptors - Array of pivot attribute descriptors
 * @param gridApi - Optional ag-grid API for checking current text wrapping state
 * @returns Menu items and callbacks
 */
export const useHeaderMenuTextWrapping = () => {
    const intl = useIntl();
    const { config } = usePivotTableProps();
    const { agGridApi } = useAgGridApi();
    const { onUpdateTextWrapping } = useUpdateTextWrapping();
    const getCurrentTextWrapping = useGetDefaultTextWrapping();

    const currentTextWrapping = getCurrentTextWrapping(agGridApi, config.textWrapping);
    const textWrappingItems = constructTextWrappingMenuItems({ textWrapping: currentTextWrapping }, intl);

    const handleTextWrappingItemClick = (item: ITextWrappingMenuItem) => {
        const effectiveItem = textWrappingItems.find((i) => i.id === item.id);

        if (!effectiveItem) {
            return;
        }

        const isHeaderItem = effectiveItem.id === "header";
        const newTextWrapping = {
            ...currentTextWrapping,
            ...(isHeaderItem
                ? { wrapHeaderText: !effectiveItem.isActive }
                : { wrapText: !effectiveItem.isActive }),
        };

        onUpdateTextWrapping(newTextWrapping, agGridApi);
    };

    return {
        textWrappingItems,
        handleTextWrappingItemClick,
    };
};
