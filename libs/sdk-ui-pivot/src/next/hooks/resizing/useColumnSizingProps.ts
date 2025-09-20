// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { debounce } from "lodash-es";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { useColumnSizingDefault } from "./useColumnSizingDefault.js";
import { useColumnSizingForAutoResize } from "./useColumnSizingForAutoResize.js";
import { useColumnSizingForFullHorizontalSpace } from "./useColumnSizingForFullHorizontalSpace.js";
import { useColumnSizingForFullHorizontalSpaceAndAutoResize } from "./useColumnSizingForFullHorizontalSpaceAndAutoResize.js";
import { useManualResize } from "./useManualResize.js";
import { useSyncColumnWidths } from "./useSyncColumnWidths.js";
import { AgGridOnColumnResized, AgGridProps } from "../../types/agGrid.js";

/**
 * Returns ag-grid props with column sizing applied.
 *
 * @internal
 */
export function useColumnSizingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const { initSyncColumnWidths } = useSyncColumnWidths();
    const { handleManualResize } = useManualResize();

    const columnSizingForAutoResize = useColumnSizingForAutoResize();
    const columnSizingForFullHorizontalSpace = useColumnSizingForFullHorizontalSpace();
    const columnSizingForFullHorizontalSpaceAndAutoResize =
        useColumnSizingForFullHorizontalSpaceAndAutoResize();
    const columnSizingForDefault = useColumnSizingDefault();

    const columnSizingProps =
        columnSizingForAutoResize ??
        columnSizingForFullHorizontalSpace ??
        columnSizingForFullHorizontalSpaceAndAutoResize ??
        columnSizingForDefault;

    const { autoSizeStrategy, initColumnWidths } = columnSizingProps;

    const onColumnResized = useCallback<AgGridOnColumnResized>(
        (params) => {
            initColumnWidths(params);
            initSyncColumnWidths(params);
            handleManualResize(params);
        },
        [initColumnWidths, initSyncColumnWidths, handleManualResize],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedOnColumnResized = useCallback(debounce(onColumnResized, 250), [onColumnResized]);

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if (agGridReactProps.autoSizeStrategy) {
                throw new UnexpectedSdkError("autoSizeStrategy is already set");
            }

            if (agGridReactProps.onColumnResized) {
                throw new UnexpectedSdkError("onColumnResized is already set");
            }

            return { ...agGridReactProps, autoSizeStrategy, onColumnResized: debouncedOnColumnResized };
        },
        [autoSizeStrategy, debouncedOnColumnResized],
    );
}
