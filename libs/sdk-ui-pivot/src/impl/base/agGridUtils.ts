// (C) 2007-2021 GoodData Corporation
import { ColDef, Column } from "@ag-grid-community/all-modules";
import { MEASURE_COLUMN } from "./constants";

/*
 * Assorted utility functions used in our Pivot Table -> ag-grid integration.
 */

export const getGridIndex = (position: number, gridDistance: number): number => {
    return Math.floor(position / gridDistance);
};

export function isColumn(item: Column | ColDef): item is Column {
    return !!(item as Column).getColDef;
}

export const isMeasureColumn = (item: Column | ColDef): boolean => {
    if (isColumn(item)) {
        return item.getColDef().type === MEASURE_COLUMN;
    }
    return item.type === MEASURE_COLUMN;
};
