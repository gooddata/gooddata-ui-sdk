// (C) 2024-2025 GoodData Corporation
import { ISortItem } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import { ITextWrapping } from "../../types/textWrapping.js";
import { ColumnWidthItem } from "../../types/resizing.js";
import { applyColumnWidthsToColDef } from "../resizing/applyColumnWidthsToColDef.js";
import { applySortByToColDef } from "../sorting/applySortByToColDef.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { applyDrillsToColDef } from "../drilling/applyDrillsToColDef.js";
import { applyTextWrappingToColDef } from "../textWrapping/applyTextWrappingToColDef.js";
import flow from "lodash/flow.js";

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
        drillableItems,
        dataViewFacade,
    }: {
        columnWidths: ColumnWidthItem[];
        sortBy: ISortItem[];
        textWrapping: ITextWrapping;
        drillableItems: ExplicitDrill[];
        dataViewFacade?: DataViewFacade;
    }) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        return flow(
            applyColumnWidthsToColDef(columnWidths),
            applySortByToColDef(sortBy),
            applyDrillsToColDef(drillableItems, dataViewFacade),
            applyTextWrappingToColDef(textWrapping),
        )(colDef);
    };
