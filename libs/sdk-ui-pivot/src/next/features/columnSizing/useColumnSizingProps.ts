// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { useColumnSizingForAutoResize } from "./useColumnSizingForAutoResize.js";
import { useColumnSizingForFullHorizontalSpace } from "./useColumnSizingForFullHorizontalSpace.js";
import { useColumnSizingForFullHorizontalSpaceAndAutoResize } from "./useColumnSizingForFullHorizontalSpaceAndAutoResize.js";
import { useColumnSizingDefault } from "./useColumnSizingDefault.js";
import { AgGridProps } from "../../types/agGrid.js";

/**
 * @internal
 */
export function useColumnSizingProps(): (agGridReactProps: AgGridProps) => AgGridProps {
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

    const { autoSizeStrategy, onColumnResized } = columnSizingProps;

    return useCallback(
        (agGridReactProps: AgGridProps): AgGridProps => {
            if (agGridReactProps.autoSizeStrategy) {
                throw new UnexpectedSdkError("autoSizeStrategy is already set");
            }

            if (agGridReactProps.onColumnResized) {
                throw new UnexpectedSdkError("onColumnResized is already set");
            }

            return { ...agGridReactProps, autoSizeStrategy, onColumnResized };
        },
        [autoSizeStrategy, onColumnResized],
    );
}
