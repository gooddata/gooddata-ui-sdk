// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useColumnSizingProps } from "./resizing/useColumnSizingProps.js";
import { useVirtualColumnAutoResize } from "./resizing/useVirtualColumnAutoResize.js";
import { useAfterRenderCallback } from "./useAfterRenderCallback.js";
import { useAgGridApiProps } from "./useAgGridApiProps.js";
import { useAutoHeight } from "./useAutoHeight.js";
import { useCellSelectionProps } from "./useCellSelectionProps.js";
import { useClipboardProps } from "./useClipboardProps.js";
import { useColumnDefsProps } from "./useColumnDefsProps.js";
import { useDataLoadingProps } from "./useDataLoadingProps.js";
import { useFocusManagementProps } from "./useFocusManagementProps.js";
import { useHeaderComponents } from "./useHeaderComponents.js";
import { useInteractionProps } from "./useInteractionProps.js";
import { usePivotingProps } from "./usePivotingProps.js";
import { useSortingProps } from "./useSortingProps.js";
import { useTextWrappingProps } from "./useTextWrappingProps.js";
import { useThemeProps } from "./useThemeProps.js";
import { AG_GRID_DEFAULT_PROPS } from "../constants/agGridDefaultProps.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props, applying all features to it.
 *
 * @internal
 */
export function useAgGridReactProps() {
    const enhanceWithAgGridApi = useAgGridApiProps();
    const enhanceWithServerSideRowModel = useDataLoadingProps();
    const enhanceWithColumnDefs = useColumnDefsProps();
    const enhanceWithPivoting = usePivotingProps();
    const enhanceWithColumnSizing = useColumnSizingProps();
    const enhanceWithSorting = useSortingProps();
    const enhanceWithInteractions = useInteractionProps();
    const enhanceWithCellSelection = useCellSelectionProps();
    const enhanceWithClipboard = useClipboardProps();
    const enhanceWithTextWrapping = useTextWrappingProps();
    const enhanceWithAutoHeight = useAutoHeight();
    const enhanceWithTheme = useThemeProps();
    const enhanceWithHeaderComponents = useHeaderComponents();
    const enhanceWithAfterRender = useAfterRenderCallback();
    const enhanceWithVirtualColumnAutoResize = useVirtualColumnAutoResize();
    const enhanceWithFocusManagement = useFocusManagementProps();

    return useMemo<AgGridProps>(() => {
        return [
            enhanceWithAgGridApi,
            enhanceWithServerSideRowModel,
            enhanceWithColumnDefs,
            enhanceWithPivoting,
            enhanceWithColumnSizing,
            enhanceWithSorting,
            enhanceWithInteractions,
            enhanceWithCellSelection,
            enhanceWithClipboard,
            enhanceWithTextWrapping,
            enhanceWithAutoHeight,
            enhanceWithTheme,
            enhanceWithHeaderComponents,
            enhanceWithAfterRender,
            enhanceWithVirtualColumnAutoResize,
            enhanceWithFocusManagement,
        ].reduce((acc, fn) => fn(acc), AG_GRID_DEFAULT_PROPS);
    }, [
        enhanceWithAgGridApi,
        enhanceWithServerSideRowModel,
        enhanceWithColumnDefs,
        enhanceWithPivoting,
        enhanceWithColumnSizing,
        enhanceWithSorting,
        enhanceWithInteractions,
        enhanceWithCellSelection,
        enhanceWithClipboard,
        enhanceWithTextWrapping,
        enhanceWithAutoHeight,
        enhanceWithTheme,
        enhanceWithHeaderComponents,
        enhanceWithAfterRender,
        enhanceWithVirtualColumnAutoResize,
        enhanceWithFocusManagement,
    ]);
}
