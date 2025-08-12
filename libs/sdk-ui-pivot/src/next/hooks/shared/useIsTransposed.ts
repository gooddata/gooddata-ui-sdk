// (C) 2025 GoodData Corporation

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";

/**
 * Returns whether the current table is transposed.
 *
 * @internal
 */
export function useIsTransposed(): boolean {
    const {
        config: { measureGroupDimension },
    } = usePivotTableProps();

    return measureGroupDimension === "rows";
}
