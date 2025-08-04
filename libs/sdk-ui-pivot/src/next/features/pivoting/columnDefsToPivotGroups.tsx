// (C) 2024-2025 GoodData Corporation
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGridDefaultProps.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";
import { columnDefinitionToHeaderNames } from "./columnDefinitionToHeaderNames.js";
import { columnDefinitionToColDefIdentifiers } from "../columns/colDefIdentifiers.js";

/**
 * Creates nested ag-grid column groups for pivoted column definitions,
 * so that the column headers are displayed in the proper way,
 * and ag-grid knows about the pivoting groups.
 *
 * @internal
 */
export function columnDefsToPivotGroups(
    columnDefinitions: AgGridColumnDef[],
    columnHeadersPosition: ColumnHeadersPosition,
): (AgGridColumnDef | AgGridColumnGroupDef)[] {
    const columnsDefinitionWithPaths = createColumnDefsWithPaths(columnDefinitions, columnHeadersPosition);

    const root: (AgGridColumnDef | AgGridColumnGroupDef)[] = [];

    for (const item of columnsDefinitionWithPaths) {
        let currentLevel = root;
        const pathParts: string[] = [];

        for (let i = 0; i < item.path.length; i++) {
            const part = item.path[i];
            const headerName = item.headerNamePath[i];
            const isLastPart = i === item.path.length - 1;
            pathParts.push(part);

            if (isLastPart) {
                // For leaf nodes, find by field
                const field = columnDefinitionToColId(
                    item.columnDef.context.columnDefinition,
                    columnHeadersPosition,
                );
                const existingNode = currentLevel.find((node) => {
                    return "field" in node && node.field === field;
                });

                if (!existingNode) {
                    currentLevel.push(item.columnDef);
                }
            } else {
                // For intermediate nodes, find by groupId
                const groupId = pathParts.join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
                let existingNode = currentLevel.find((node) => {
                    return "groupId" in node && node.groupId === groupId;
                });

                if (!existingNode) {
                    // Create intermediate node (ColGroupDef)
                    const colGroupDef: AgGridColumnGroupDef = {
                        groupId,
                        headerName: headerName,
                        children: [],
                        headerClass: getHeaderCellClassName,
                    };
                    currentLevel.push(colGroupDef);
                    existingNode = colGroupDef;
                }

                // Move to next level (children)
                if ("children" in existingNode && existingNode.children) {
                    currentLevel = existingNode.children as (AgGridColumnDef | AgGridColumnGroupDef)[];
                }
            }
        }
    }

    return root;
}

/**
 * @internal
 */
interface IColumnDefinitionWithPath {
    path: string[];
    headerNamePath: string[];
    columnDef: AgGridColumnDef;
}

/**
 * @internal
 */
export function createColumnDefWithPath(
    columnDef: AgGridColumnDef,
    columnHeadersPosition: ColumnHeadersPosition,
): IColumnDefinitionWithPath {
    const path = columnDefinitionToColDefIdentifiers(
        columnDef.context.columnDefinition,
        columnHeadersPosition,
    );
    const headerNamePath = columnDefinitionToHeaderNames(
        columnDef.context.columnDefinition,
        columnHeadersPosition,
    );

    return {
        path,
        headerNamePath,
        columnDef,
    };
}

export function createColumnDefsWithPaths(
    columnDefs: AgGridColumnDef[],
    columnHeadersPosition: ColumnHeadersPosition,
): IColumnDefinitionWithPath[] {
    return columnDefs.map((columnDef) => createColumnDefWithPath(columnDef, columnHeadersPosition));
}
