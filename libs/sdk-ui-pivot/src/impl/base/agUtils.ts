// (C) 2007-2025 GoodData Corporation
import { ColDef, Column, ColumnResizedEvent } from "ag-grid-community";
import { MEASURE_COLUMN, COLUMN_TOTAL, COLUMN_SUBTOTAL } from "./constants.js";
import { agColId } from "../structure/tableDescriptorTypes.js";
import { ColumnEventSourceType } from "../../columnWidths.js";

/*
 * Assorted utility functions used in our Pivot Table -> ag-grid integration.
 */

export function getGridIndex(position: number, gridDistance: number): number {
    return Math.floor(position / gridDistance);
}

export function isColumn(item: Column | ColDef): item is Column {
    return !!(item as Column).getColDef;
}

export function isMeasureColumn(item: Column | ColDef): boolean {
    if (isColumn(item)) {
        return item.getColDef().type === MEASURE_COLUMN;
    }
    return item.type === MEASURE_COLUMN;
}

export function isMeasureOrAnyColumnTotal(item: Column): boolean {
    const type = item.getColDef().type;

    return type === MEASURE_COLUMN || type === COLUMN_TOTAL || type === COLUMN_SUBTOTAL;
}

export function agColIds(columns: Column[]): string[] {
    return columns.map(agColId);
}

export function isHeaderResizer(target: HTMLElement): boolean {
    return target.classList.contains("ag-header-cell-resize");
}

export function isManualResizing(columnEvent: ColumnResizedEvent): boolean {
    return columnEvent?.source === ColumnEventSourceType.UI_RESIZED && !!columnEvent.columns;
}

export function scrollBarExists(target: HTMLDivElement): boolean {
    const { scrollWidth, clientWidth } = target.getElementsByClassName(
        "ag-body-horizontal-scroll-viewport",
    )[0];

    return scrollWidth > clientWidth;
}
