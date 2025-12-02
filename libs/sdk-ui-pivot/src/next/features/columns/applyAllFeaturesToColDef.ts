// (C) 2024-2025 GoodData Corporation

import { RefObject } from "react";

import { ISortItem } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";

import { AgGridColumnDef } from "../../types/agGrid.js";
import { ColumnWidthItem } from "../../types/resizing.js";
import { ITextWrapping } from "../../types/textWrapping.js";
import { applyCellRenderingToColDef } from "../drilling/applyCellRenderingToColDef.js";
import { applyColumnWidthsToColDef } from "../resizing/applyColumnWidthsToColDef.js";
import { applySortByToColDef } from "../sorting/applySortByToColDef.js";
import { applyTextWrappingToColDef } from "../textWrapping/applyTextWrappingToColDef.js";

/**
 * Applies all features to ag-grid col def.
 *
 * @internal
 */
export const applyAllFeaturesToColDef =
    ({
        columnWidths,
        sortBy,
        textWrapping,
        drillableItemsRef,
        dataViewFacade,
    }: {
        columnWidths: ColumnWidthItem[];
        sortBy: ISortItem[];
        textWrapping: ITextWrapping;
        drillableItemsRef: RefObject<ExplicitDrill[]>;
        dataViewFacade?: DataViewFacade;
    }) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        return [
            applyColumnWidthsToColDef(columnWidths),
            applySortByToColDef(sortBy),
            applyCellRenderingToColDef(drillableItemsRef, dataViewFacade),
            applyTextWrappingToColDef(textWrapping),
        ].reduce((acc, fn) => fn(acc), colDef);
    };
