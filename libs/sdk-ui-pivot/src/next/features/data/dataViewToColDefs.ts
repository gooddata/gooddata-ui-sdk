// (C) 2024-2026 GoodData Corporation

import { type RefObject } from "react";

import { type IntlShape } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type DataViewFacade, type ExplicitDrill } from "@gooddata/sdk-ui";

import { type AgGridColumnDef, type AgGridColumnGroupDef } from "../../types/agGrid.js";
import { type IConditionalFormatting } from "../../types/conditionalFormatting.js";
import { type ITableColumnDefinitionByColId } from "../../types/internal.js";
import { type ColumnWidthItem } from "../../types/resizing.js";
import { type ITextWrapping } from "../../types/textWrapping.js";
import { type ColumnHeadersPosition } from "../../types/transposition.js";
import { applyAllFeaturesToColDef } from "../columns/applyAllFeaturesToColDef.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { createColDef } from "../columns/createColDef.js";
import { columnDefsToPivotGroups } from "../pivoting/columnDefsToPivotGroups.js";
import { resolveConditionalFormattingTriggers } from "../styling/conditionalFormatting.js";
import { applyTextWrappingToGroupDef } from "../textWrapping/applyTextWrappingToGroupDef.js";

import { getTableData } from "./valueFormatter.js";

/**
 * Creates ag-grid col defs from the provided data view, applying all features to the col defs.
 *
 * @internal
 */
export function dataViewToColDefs({
    dataView,
    columnHeadersPosition,
    columnWidths,
    drillableItemsRef,
    textWrapping,
    intl,
    separators,
    conditionalFormatting,
}: {
    dataView: DataViewFacade;
    columnHeadersPosition: ColumnHeadersPosition;
    columnWidths: ColumnWidthItem[];
    drillableItemsRef: RefObject<ExplicitDrill[]>;
    textWrapping: ITextWrapping;
    intl: IntlShape;
    separators?: ISeparators;
    conditionalFormatting?: IConditionalFormatting;
}): {
    columnDefinitionByColId: ITableColumnDefinitionByColId;
    columnDefs: (AgGridColumnDef | AgGridColumnGroupDef)[];
    columnDefsFlat: AgGridColumnDef[];
    isPivoted: boolean;
} {
    const sortBy = dataView.definition.sortBy;
    const tableData = getTableData(dataView, separators);
    const columnDefinitionByColId: ITableColumnDefinitionByColId = {};

    tableData.columnDefinitions.forEach((columnDefinition) => {
        const colId = columnDefinitionToColId(columnDefinition, columnHeadersPosition);
        columnDefinitionByColId[colId] = columnDefinition;
    });

    // Resolve each rule's trigger column to a colId ONCE for this render pass, so the per-cell
    // cellStyle path is O(rules) lookups instead of re-matching every column on every cell.
    const conditionalFormattingTriggers = conditionalFormatting?.enabled
        ? resolveConditionalFormattingTriggers(
              conditionalFormatting,
              tableData.columnDefinitions,
              columnHeadersPosition,
          )
        : [];

    const colDefs = tableData.columnDefinitions.map((columnDefinition) => {
        const colDef = createColDef(columnDefinition, columnHeadersPosition, intl, dataView);
        return applyAllFeaturesToColDef({
            columnWidths,
            sortBy,
            textWrapping,
            drillableItemsRef,
            dataViewFacade: dataView,
            conditionalFormatting,
            conditionalFormattingTriggers,
        })(colDef);
    });

    const columnDefsWithPivotGroups = columnDefsToPivotGroups(colDefs, columnHeadersPosition, intl);

    // Apply text wrapping to group definitions recursively
    const applyTextWrappingToTree = (
        defs: (AgGridColumnDef | AgGridColumnGroupDef)[],
    ): (AgGridColumnDef | AgGridColumnGroupDef)[] => {
        return defs.map((def) => {
            if ("children" in def && def.children) {
                // This is a group definition
                const updatedGroupDef = applyTextWrappingToGroupDef(def, textWrapping);
                return {
                    ...updatedGroupDef,
                    children: applyTextWrappingToTree(
                        def.children as (AgGridColumnDef | AgGridColumnGroupDef)[],
                    ),
                };
            }
            return def;
        });
    };

    const columnDefsWithWrapping = applyTextWrappingToTree(columnDefsWithPivotGroups);

    return {
        columnDefinitionByColId,
        columnDefs: columnDefsWithWrapping,
        columnDefsFlat: colDefs,
        isPivoted: tableData.isPivoted,
    };
}
