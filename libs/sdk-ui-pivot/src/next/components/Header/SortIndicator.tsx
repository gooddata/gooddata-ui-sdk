// (C) 2025 GoodData Corporation

import { SortDirection } from "ag-grid-community";

/**
 * @internal
 */
interface ISortIndicatorProps {
    sortDirection: SortDirection;
    sortIndex?: number | null;
}

/**
 * @internal
 */
export function SortIndicator({ sortDirection, sortIndex }: ISortIndicatorProps) {
    return (
        <span className="gd-sort-indicator">
            <span
                className={`ag-icon ag-icon-${
                    sortDirection === "asc" ? "asc" : sortDirection === "desc" ? "desc" : "none"
                }`}
            ></span>
            {typeof sortIndex === "number" ? <span className="gd-sort-order">{sortIndex + 1}</span> : null}
        </span>
    );
}
