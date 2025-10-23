// (C) 2025 GoodData Corporation

import { CellTypes } from "../features/styling/cell.js";

export function getPivotHeaderTestIdProps(options?: { drillable?: boolean }) {
    const id = options?.drillable ? "pivot-header-drillable" : "pivot-header";
    return { "data-testid": id };
}

/**
 * Convenience helper: derive cell data-testid props from cell types.
 * Returns empty object if cell type information is not provided.
 * Generates space-separated tokens like "pivot-cell pivot-cell-drillable pivot-cell-total-column-subtotal"
 */
export function getPivotCellTestIdPropsFromCellTypes(cellTypes: CellTypes) {
    if (!cellTypes) {
        return {};
    }

    const { isDrillable, isOverallTotal, isColSubtotal, isColGrandTotal, isRowTotal, isRowSubtotal } =
        cellTypes;

    const tokens: string[] = ["pivot-cell"];

    if (isDrillable) {
        tokens.push("pivot-cell-drillable");
    }

    if (isOverallTotal) {
        tokens.push("pivot-cell-total-overall");
    }

    if (isRowTotal) {
        tokens.push("pivot-cell-total-row-total");
    }

    if (isRowSubtotal) {
        tokens.push("pivot-cell-total-row-subtotal");
    }

    if (isColGrandTotal) {
        tokens.push("pivot-cell-total-column-grand-total");
    }

    if (isColSubtotal) {
        tokens.push("pivot-cell-total-column-subtotal");
    }

    return { "data-testid": tokens.join(" ") };
}

export function getPivotHeaderMenuButtonTestIdProps() {
    return { "data-testid": "pivot-header-menu-button" };
}

export function getPivotHeaderClickableAreaTestIdProps() {
    return { "data-testid": "pivot-header-clickable" };
}

export function getPivotHeaderTextTestIdProps() {
    return { "data-testid": "pivot-header-text" };
}

export function getPivotContainerTestIdProps(isReady?: boolean) {
    return isReady ? { "data-testid": "pivot-table-next" } : {};
}
