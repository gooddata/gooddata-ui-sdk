// (C) 2025 GoodData Corporation

import { ITotal, TotalType } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type PivotTableNextMenuConfig = {
    /**
     * Configuration for the aggregations menu.
     */
    menu?: IMenu;
};

/**
 * Configuration for the aggregations menu.
 *
 * @alpha
 */
export interface IMenu {
    /**
     * If true, grand totals and subtotals can be added to the table using table menu.
     *
     * @remarks
     * Default: false
     */
    aggregations?: boolean;

    /**
     * If true, subtotals can be added to the table using table menu.
     *
     * @remarks
     * Default: false
     */
    aggregationsSubMenu?: boolean;

    /**
     * Specifies which aggregation functions can be selected from the menu.
     *
     * @remarks
     * Note: this option only impacts available menu items. It will not be used to filter totals that
     * you specify on the pivot table props.
     *
     * Default: all available types.
     */
    aggregationTypes?: TotalType[];

    /**
     * If true, total and subtotals for columns (yes, for columns, although the naming is rows) can be added to the table using table menu.
     * This will be removed in the future, it's under feature flag control for development purposes.
     *
     * @remarks
     * Default: false
     */
    aggregationsSubMenuForRows?: boolean;
}

/**
 * Aggregations menu item.
 *
 * Each item represents a single aggregation function with all its
 * possible item definitions for rows and columns.
 *
 * @internal
 */
export interface IAggregationsMenuItem {
    type: TotalType;
    rows: IAggregationsSubMenuItem[];
    columns: IAggregationsSubMenuItem[];
    isDisabled?: boolean;
    disabledTooltip?: string;
}

/**
 * Aggregations submenu item. (example: "Sum of all rows")
 *
 * Each item represents a single total or subtotal with its definitions.
 * There may be multiple definitions of a single total item as pivot groups may have many measures underneath.
 *
 * @internal
 */
export interface IAggregationsSubMenuItem {
    type: "aggregation";
    id: string;
    title: string;
    isActive: boolean;
    isColumn: boolean;
    totalDefinitions: ITotal[];
}

/**
 * Text wrapping menu item. Represents a single text wrapping option entry.
 *
 * @internal
 */
export interface ITextWrappingMenuItem {
    type: "textWrapping";
    id: string;
    title: string;
    isActive: boolean;
}

/**
 * Sorting menu item. Represents a single sorting option entry.
 *
 * @internal
 */
export interface ISortingMenuItem {
    type: "sorting";
    id: string;
    title: string;
    isActive: boolean;
    direction: "asc" | "desc" | null;
}
