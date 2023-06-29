// (C) 2007-2022 GoodData Corporation
import { IMappingHeader } from "@gooddata/sdk-ui";
import { ROW_TOTAL } from "../base/constants.js";

/**
 * All non-grand-total rows in the grid conform to this interface.
 *
 * CAREFUL: if you are updating this type, adding new props etc, look at stickyRowHandler code,
 * the updateStickyRowContentClassesAndData function - there may be a bad interplay that you would not expect.
 *
 * TODO: we need to refactor this type. wildly mixing a number of our custom props with the values for fields
 *  leads to unnecessary dangers.
 */
export interface IGridRow {
    /**
     * Mapping of column ID ⇒ data value
     */
    [key: string]: any;

    /**
     * Mapping of slice column ID ⇒ mapping header (detail about slice value)
     */
    headerItemMap: {
        [key: string]: IMappingHeader;
    };

    /**
     * If this is 'special' row such as total or subtotal, then the 'type' will be set to value of
     * ROW_TOTAL or ROW_SUBTOTAL constant. Otherwise the field is not present.
     */
    type?: string;

    subtotalStyle?: string;
}

/**
 * Grand total rows in the table conform to this
 */
export interface IGridTotalsRow {
    type: string;
    colSpan: {
        count: number;
        headerKey: string;
    };
    calculatedForColumns?: string[];

    [key: string]: any;
}

export interface IAgGridPage {
    rowData: IGridRow[];
    rowTotals: IGridTotalsRow[];
}

export function isGridTotalsRow(obj: unknown): obj is IGridTotalsRow {
    return (obj as IGridTotalsRow)?.type === ROW_TOTAL;
}
