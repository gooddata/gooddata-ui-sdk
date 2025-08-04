// (C) 2025 GoodData Corporation
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ITextWrapping } from "../../types/textWrapping.js";

/**
 * Applies text wrapping to col def.
 *
 * @internal
 */
export const applyTextWrappingToColDef =
    (textWrapping: ITextWrapping) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        const { wrapHeaderText, wrapText } = textWrapping;
        const updatedColDef = {
            ...colDef,
        };
        if (wrapHeaderText) {
            updatedColDef.wrapHeaderText = true;
        }
        if (wrapText) {
            updatedColDef.wrapText = true;
        }

        return updatedColDef;
    };
