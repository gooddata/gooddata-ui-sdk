// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { useUpdateColumnWidth } from "./useUpdateColumnWidths.js";
import { AgGridOnColumnResized, AgGridProps } from "../../types/agGrid.js";

/**
 * Returns default column sizing props for ag-grid.
 *
 * @internal
 */
export function useColumnSizingDefault(): Pick<AgGridProps, "autoSizeStrategy" | "onColumnResized"> {
    const { onUpdateColumnWidth } = useUpdateColumnWidth();

    const onColumnResized = useCallback<AgGridOnColumnResized>(
        (params) => {
            onUpdateColumnWidth(params);
        },
        [onUpdateColumnWidth],
    );

    return {
        autoSizeStrategy: undefined,
        onColumnResized,
    };
}
