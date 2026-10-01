// (C) 2025-2026 GoodData Corporation

import { useMemo, useRef } from "react";

import { AG_GRID_DEFAULT_PROPS } from "../constants/agGridDefaultProps.js";
import { type AgGridProps } from "../types/agGrid.js";
import { type IGridSizingState } from "../types/internal.js";

import { useColumnSizingProps } from "./resizing/useColumnSizingProps.js";
import { useResizeOnGridSizeChanged } from "./resizing/useResizeOnGridSizeChanged.js";
import { useVirtualColumnAutoResize } from "./resizing/useVirtualColumnAutoResize.js";
import { useAccessibilityModeProps } from "./useAccessibilityProps.js";
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
import { useLocaleTextProps } from "./useLocaleTextProps.js";
import { usePaginationProps } from "./usePaginationProps.js";
import { usePivotingProps } from "./usePivotingProps.js";
import { useSortingProps } from "./useSortingProps.js";
import { useTextWrappingProps } from "./useTextWrappingProps.js";
import { useThemeProps } from "./useThemeProps.js";

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
    const gridSizingStateRef = useRef<IGridSizingState>({ hasRenderedFirstData: false, isSized: false });
    const enhanceWithColumnSizing = useColumnSizingProps(gridSizingStateRef);
    const enhanceWithSorting = useSortingProps();
    const enhanceWithInteractions = useInteractionProps();
    const enhanceWithCellSelection = useCellSelectionProps();
    const enhanceWithClipboard = useClipboardProps();
    const enhanceWithTextWrapping = useTextWrappingProps();
    const enhanceWithAutoHeight = useAutoHeight();
    const enhanceWithPagination = usePaginationProps();
    const enhanceWithAccessibilityMode = useAccessibilityModeProps();
    const enhanceWithLocaleText = useLocaleTextProps();
    const enhanceWithTheme = useThemeProps();
    const enhanceWithHeaderComponents = useHeaderComponents();
    const enhanceWithAfterRender = useAfterRenderCallback();
    const autoResizedColumnsRef = useRef<Set<string>>(new Set());
    const enhanceWithVirtualColumnAutoResize = useVirtualColumnAutoResize(autoResizedColumnsRef);
    const enhanceWithResizeOnGridSizeChanged = useResizeOnGridSizeChanged(
        autoResizedColumnsRef,
        gridSizingStateRef,
    );
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
            enhanceWithPagination,
            enhanceWithAccessibilityMode,
            enhanceWithLocaleText,
            enhanceWithTheme,
            enhanceWithHeaderComponents,
            enhanceWithAfterRender,
            enhanceWithVirtualColumnAutoResize,
            enhanceWithResizeOnGridSizeChanged,
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
        enhanceWithPagination,
        enhanceWithAccessibilityMode,
        enhanceWithLocaleText,
        enhanceWithTheme,
        enhanceWithHeaderComponents,
        enhanceWithAfterRender,
        enhanceWithVirtualColumnAutoResize,
        enhanceWithResizeOnGridSizeChanged,
        enhanceWithFocusManagement,
    ]);
}
