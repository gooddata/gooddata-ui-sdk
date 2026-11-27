// (C) 2025-2026 GoodData Corporation

import { Fragment, type RefObject, createElement } from "react";

import {
    type DataViewFacade,
    type ExplicitDrill,
    isMeasureGroupHeaderColumnDefinition,
} from "@gooddata/sdk-ui";

import { DrillableCellDescription } from "../../components/Cell/DrillableCellHint.js";
import { type AgGridCellRendererParams, type AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName, getCellTypes, getTransposedCellClassName } from "../styling/cell.js";

/**
 * Applies cell rendering features (cellClass and cellRenderer) to the ag-grid col def.
 * Uses a ref for drillableItems so the closure always reads the latest value,
 * avoiding colDef recreation when drillableItems change.
 *
 * This centralizes all cell styling and rendering logic in one place, so column creators
 * don't need to know about drillableItems at all.
 *
 * @internal
 */
export const applyCellRenderingToColDef =
    (drillableItemsRef: RefObject<ExplicitDrill[]>, dv?: DataViewFacade) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        if (!dv) {
            return colDef;
        }

        const cellRendererFactory = colDef.context?.cellRendererFactory;

        return {
            ...colDef,
            cellClass: (params) => {
                // Read from ref to get latest drillableItems
                const drillableItems = drillableItemsRef.current;
                if (isMeasureGroupHeaderColumnDefinition(params.colDef.context?.columnDefinition)) {
                    return getTransposedCellClassName(params, drillableItems, dv);
                }

                return getCellClassName(params, drillableItems, dv);
            },
            // Only set cellRenderer if a factory was provided
            ...(cellRendererFactory && {
                cellRenderer: (params: AgGridCellRendererParams) => {
                    const drillableItems = drillableItemsRef.current;
                    const cellTypes = getCellTypes(params, drillableItems, dv);
                    // Drillability is otherwise conveyed only visually (cell class), so expose it
                    // to screen readers as the description of the grid cell.
                    return createElement(
                        Fragment,
                        null,
                        cellRendererFactory(params, cellTypes),
                        createElement(DrillableCellDescription, {
                            eGridCell: params.eGridCell,
                            isDrillable: !!cellTypes?.isDrillable,
                        }),
                    );
                },
            }),
        };
    };
