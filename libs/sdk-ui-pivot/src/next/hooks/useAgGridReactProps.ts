// (C) 2025 GoodData Corporation
import { useMemo } from "react";

import flow from "lodash/flow.js";

import { useColumnSizingProps } from "./resizing/useColumnSizingProps.js";
import { useColumnDefsProps } from "./useColumnDefsProps.js";
import { useDataLoadingProps } from "./useDataLoadingProps.js";
import { useDrillingProps } from "./useDrillingProps.js";
import { useHeaderComponents } from "./useHeaderComponents.js";
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
    const enhanceWithServerSideRowModel = useDataLoadingProps();
    const enhanceWithColumnDefs = useColumnDefsProps();
    const enhanceWithPivoting = usePivotingProps();
    const enhanceWithColumnSizing = useColumnSizingProps();
    const enhanceWithSorting = useSortingProps();
    const enhanceWithDrilling = useDrillingProps();
    const enhanceWithTextWrapping = useTextWrappingProps();
    const enhanceWithTheme = useThemeProps();
    const enhanceWithHeaderComponents = useHeaderComponents();

    return useMemo<AgGridProps>(() => {
        return flow(
            enhanceWithServerSideRowModel,
            enhanceWithColumnDefs,
            enhanceWithPivoting,
            enhanceWithColumnSizing,
            enhanceWithSorting,
            enhanceWithDrilling,
            enhanceWithTextWrapping,
            enhanceWithTheme,
            enhanceWithHeaderComponents,
        )(AG_GRID_DEFAULT_PROPS);
    }, [
        enhanceWithServerSideRowModel,
        enhanceWithColumnDefs,
        enhanceWithPivoting,
        enhanceWithColumnSizing,
        enhanceWithSorting,
        enhanceWithDrilling,
        enhanceWithTextWrapping,
        enhanceWithTheme,
        enhanceWithHeaderComponents,
    ]);
}
