// (C) 2019-2025 GoodData Corporation
import { IMeasureDescriptor, IAttributeDescriptor, TotalType } from "@gooddata/sdk-model";
import { ITableDataHeaderScope } from "./scope.js";

/**
 * Union of all possible row types in the table data structure.
 *
 * Think of the final table as a stack of these row types:
 * 1. **Value rows** – normal data rows (one per combination of row attributes)
 * 2. **Subtotal rows** – subtotal rows (only when subtotals are configured)
 * 3. **Grand-total rows** – grand-total rows (only when grand totals are configured)
 *
 * The exact mix depends on your configuration (pivoting, transposition, totals settings).
 *
 * **Example layout (no transposition, subtotals + grand totals enabled):**
 * ```
 * | Country     | City     | Q1 Sales | Q2 Sales |
 * |-------------|----------|----------|----------|
 * | USA         | NYC      |      100 |      150 |   <- value row
 * | USA         | LA       |      200 |      250 |   <- value row
 * | USA         | SUBTOTAL |      300 |      400 |   <- subtotal row
 * | CAN         | TOR      |       80 |       90 |   <- value row
 * | CAN         | SUBTOTAL |       80 |       90 |   <- subtotal row
 * | GRAND TOTAL |          |      380 |      490 |   <- grand-total row
 * ```
 *
 * @alpha
 */
export type ITableRowDefinition =
    | ITableValueRowDefinition
    | ITableSubtotalRowDefinition
    | ITableGrandTotalRowDefinition;

/**
 * @alpha
 */
export interface ITableValueRowDefinition {
    type: "value";
    rowIndex: number;
    rowScope: ITableDataHeaderScope[];
}
/**
 * @alpha
 */
export interface ITableSubtotalRowDefinition {
    type: "subtotal";
    rowIndex: number;
    rowScope: ITableDataHeaderScope[];
}

/**
 * @alpha
 */
export interface ITableGrandTotalRowDefinition {
    type: "grandTotal";
    rowIndex: number;
    attributeDescriptor: IAttributeDescriptor;
    measureDescriptors: IMeasureDescriptor[];
    totalType: TotalType;
    rowGrandTotalIndex: number;
}
