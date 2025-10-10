// (C) 2024-2025 GoodData Corporation

import { IntlShape } from "react-intl";

import {
    ITableColumnDefinition,
    isGrandTotalColumnDefinition,
    isStandardValueColumnDefinition,
    isSubtotalColumnDefinition,
} from "@gooddata/sdk-ui";

import { columnDefinitionToHeaderNames } from "./columnDefinitionToHeaderNames.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../../constants/agGridDefaultProps.js";
import { AgGridColumnDef, AgGridColumnGroupDef } from "../../types/agGrid.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { columnDefinitionToColDefIdentifiers } from "../columns/colDefIdentifiers.js";
import { columnDefinitionToColId } from "../columns/colId.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

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
    intl: IntlShape,
): (AgGridColumnDef | AgGridColumnGroupDef)[] {
    const columnsDefinitionWithPaths = createColumnDefsWithPaths(
        columnDefinitions,
        columnHeadersPosition,
        intl,
    );

    const root: (AgGridColumnDef | AgGridColumnGroupDef)[] = [];

    // Collect all unique measure identifiers from all columns
    // for possible totals and subtotals definitions
    const allMeasureIdentifiers = new Set<string>();
    for (const def of columnDefinitions) {
        const columnDefinition = def.context.columnDefinition;
        if (isStandardValueColumnDefinition(columnDefinition)) {
            allMeasureIdentifiers.add(columnDefinition.measureDescriptor.measureHeaderItem.localIdentifier);
        }
    }

    for (const item of columnsDefinitionWithPaths) {
        let currentLevel = root;
        const pathParts: string[] = [];

        for (let i = 0; i < item.path.length; i++) {
            const part = item.path[i];

            const previousHeaderName = i > 0 ? item.headerNamePath[i - 1] : undefined;
            const headerName = shouldSkipHeaderName(
                item.columnDef.context.columnDefinition,
                item.headerNamePath[i],
                previousHeaderName,
            )
                ? undefined
                : item.headerNamePath[i];

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
                    const siblingIndex = currentLevel.length;
                    item.columnDef.context.indexWithinGroup = siblingIndex;

                    // Stamp measure index for standard value leaves (exclude totals)
                    if (isStandardValueColumnDefinition(item.columnDef.context.columnDefinition)) {
                        const siblingsMeasureCount = currentLevel.reduce((acc, node) => {
                            if ("field" in node) {
                                const def = node as AgGridColumnDef;
                                const cd = def.context?.columnDefinition;
                                if (isStandardValueColumnDefinition(cd)) {
                                    return acc + 1;
                                }
                            }
                            return acc;
                        }, 0);

                        item.columnDef.context.measureIndex = siblingsMeasureCount;
                    }

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
                    const siblingIndex = currentLevel.length;
                    const colGroupDef: AgGridColumnGroupDef = {
                        groupId,
                        headerName,
                        children: [],
                        suppressHeaderContextMenu: true,
                        headerClass: getHeaderCellClassName,
                        headerGroupComponent: "PivotGroupHeader",
                        headerGroupComponentParams: {
                            pivotGroupDepth: i,
                            measureIdentifiers: Array.from(allMeasureIdentifiers),
                        },
                        // Needed for aggregations menu items
                        context: {
                            columnDefinition: item.columnDef.context.columnDefinition,
                            indexWithinGroup: siblingIndex,
                        },
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
    intl: IntlShape,
): IColumnDefinitionWithPath {
    const path = columnDefinitionToColDefIdentifiers(
        columnDef.context.columnDefinition,
        columnHeadersPosition,
    );
    const headerNamePath = columnDefinitionToHeaderNames(
        columnDef.context.columnDefinition,
        columnHeadersPosition,
        intl,
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
    intl: IntlShape,
): IColumnDefinitionWithPath[] {
    return columnDefs.map((columnDef) => createColumnDefWithPath(columnDef, columnHeadersPosition, intl));
}

/**
 * Checks if the header name should be skipped.
 * This is needed to avoid vertically repeated header labels (e.g., consecutive "Sum" rows).
 * This affects only intermediate group headers.
 */
const shouldSkipHeaderName = (
    columnDefinition: ITableColumnDefinition,
    headerName: string | undefined,
    previousHeaderName: string | undefined,
) => {
    const isGrandTotalOrSubtotal =
        isGrandTotalColumnDefinition(columnDefinition) || isSubtotalColumnDefinition(columnDefinition);
    return isGrandTotalOrSubtotal && headerName && previousHeaderName && headerName === previousHeaderName;
};
