// (C) 2025 GoodData Corporation
import { useCallback } from "react";

import { useIntl } from "react-intl";

import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { agGridSetColumnDefs } from "../../features/columns/agGridColDefsApi.js";
import { agGridSetPivotResultColumns } from "../../features/pivoting/agGridPivotingApi.js";
import { columnDefsToPivotGroups } from "../../features/pivoting/columnDefsToPivotGroups.js";
import { applyTextWrappingToGroupDef } from "../../features/textWrapping/applyTextWrappingToGroupDef.js";
import { type AgGridApi, type AgGridColumnDef, type AgGridColumnGroupDef } from "../../types/agGrid.js";

/**
 * Updates column defs in ag-grid, by updated column defs (use this only if you are working with flat column defs).
 *
 * @internal
 */
export function useUpdateAgGridColumnDefs() {
    const { config } = usePivotTableProps();
    const { isPivoted } = useColumnDefs();
    const { columnHeadersPosition } = config;
    const intl = useIntl();

    return useCallback(
        (updatedColDefs: AgGridColumnDef[], gridApi: AgGridApi) => {
            if (isPivoted) {
                const groupedColumnDefs = columnDefsToPivotGroups(
                    updatedColDefs,
                    columnHeadersPosition,
                    intl,
                );

                // Apply text wrapping to group definitions recursively
                const applyTextWrappingToTree = (
                    defs: (AgGridColumnDef | AgGridColumnGroupDef)[],
                ): (AgGridColumnDef | AgGridColumnGroupDef)[] => {
                    return defs.map((def) => {
                        if ("children" in def && def.children) {
                            // This is a group definition
                            const updatedGroupDef = applyTextWrappingToGroupDef(
                                def,
                                config.textWrapping ?? {},
                            );
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

                const groupedColumnDefsWithWrapping = applyTextWrappingToTree(groupedColumnDefs);

                agGridSetPivotResultColumns(
                    {
                        colDefs: groupedColumnDefsWithWrapping,
                    },
                    gridApi,
                );
            } else {
                agGridSetColumnDefs({ colDefs: updatedColDefs }, gridApi);
            }
        },
        [isPivoted, columnHeadersPosition, intl, config.textWrapping],
    );
}
