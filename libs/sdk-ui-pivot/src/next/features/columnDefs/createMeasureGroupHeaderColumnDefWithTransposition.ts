// (C) 2025 GoodData Corporation
import { ITableMeasureGroupHeaderColumnDefinition } from "@gooddata/sdk-ui";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { createMeasureGroupHeaderColumnDef } from "./createMeasureGroupHeaderColumnDef.js";

/**
 * @internal
 */
export const createMeasureGroupHeaderColumnDefWithTransposition = (
    colId: string,
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition,
): AgGridColumnDef => {
    const measureGroupColumnDef = createMeasureGroupHeaderColumnDef(columnDefinition);
    const lastAttributeDescriptor =
        columnDefinition.attributeDescriptors[columnDefinition.attributeDescriptors.length - 1];
    return {
        ...measureGroupColumnDef,
        colId,
        field: colId,
        headerName: lastAttributeDescriptor.attributeHeader.formOf.name,
        valueGetter: (params) => {
            return params.data?.[colId];
        },
    };
};
