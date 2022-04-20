// (C) 2007-2022 GoodData Corporation
import { ColDef, Column, ColumnResizedEvent } from "@ag-grid-community/all-modules";
import { MEASURE_COLUMN } from "./constants";
import { agColId } from "../structure/tableDescriptorTypes";
import { ColumnEventSourceType } from "../../columnWidths";

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

export function agColIds(columns: Column[]): string[] {
    return columns.map(agColId);
}

export function isHeaderResizer(target: HTMLElement): boolean {
    return target.classList.contains("ag-header-cell-resize");
}

export function isManualResizing(columnEvent: ColumnResizedEvent): boolean {
    return Boolean(columnEvent?.source === ColumnEventSourceType.UI_DRAGGED && columnEvent.columns);
}

export function scrollBarExists(target: HTMLDivElement): boolean {
    const { scrollWidth, clientWidth } = target.getElementsByClassName(
        "ag-body-horizontal-scroll-viewport",
    )[0];

    return scrollWidth > clientWidth;
}
