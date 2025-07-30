// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { AgGridProps, AgGridOnColumnResized } from "../../types/agGrid.js";

/**
 * @internal
 */
export function useColumnSizingDefault(): Pick<AgGridProps, "autoSizeStrategy" | "onColumnResized"> {
    const onColumnResized = useCallback<AgGridOnColumnResized>(() => {}, []);

    return {
        autoSizeStrategy: undefined,
        onColumnResized,
    };
}
