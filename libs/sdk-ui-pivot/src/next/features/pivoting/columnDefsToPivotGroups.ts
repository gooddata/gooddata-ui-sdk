// (C) 2024-2025 GoodData Corporation
import { ColumnHeadersPosition } from "../../types/public.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGrid.js";
import {
    columnDefinitionToColId,
    columnDefinitionToColumnPath,
} from "../columnDefs/columnDefinitionToColId.js";
import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function columnDefsToPivotGroups(
    columnDefinitions: AgGridColumnDef[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): (AgGridColumnDef | AgGridColumnGroupDef)[] {
    const columnsDefinitionWithPaths = createColumnDefsWithPaths(
        columnDefinitions,
        isTransposed,
        columnHeadersPosition,
    );

    const root: (AgGridColumnDef | AgGridColumnGroupDef)[] = [];

    for (const item of columnsDefinitionWithPaths) {
        let currentLevel = root;
        const pathParts: string[] = [];

        for (let i = 0; i < item.path.length; i++) {
            const part = item.path[i];
            const isLastPart = i === item.path.length - 1;
            pathParts.push(part);

            if (isLastPart) {
                // For leaf nodes, find by field
                const field = columnDefinitionToColId(
                    item.columnDef.context.columnDefinition,
                    isTransposed,
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
                        headerName: part,
                        children: [],
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
    columnDef: AgGridColumnDef;
}

/**
 * @internal
 */
export function createColumnDefWithPath(
    columnDef: AgGridColumnDef,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): IColumnDefinitionWithPath {
    const path = columnDefinitionToColumnPath(
        columnDef.context.columnDefinition,
        isTransposed,
        columnHeadersPosition,
    );

    return {
        path,
        columnDef,
    };
}

export function createColumnDefsWithPaths(
    columnDefs: AgGridColumnDef[],
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
): IColumnDefinitionWithPath[] {
    return columnDefs.map((columnDef) =>
        createColumnDefWithPath(columnDef, isTransposed, columnHeadersPosition),
    );
}
