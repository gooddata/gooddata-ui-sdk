// (C) 2025 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IVisualizationCallbacks, ExplicitDrill, IVisualizationProps } from "@gooddata/sdk-ui";
import { IAttribute, IFilter, IMeasure, ISortItem, ITotal } from "@gooddata/sdk-model";
import { ColumnResizedCallback, PivotTableNextColumnsSizingConfig } from "./resizing.js";
import { PivotTableNextTranspositionConfig } from "./transposition.js";
import { PivotTableNextTextWrappingConfig } from "./textWrapping.js";
import { PivotTableNextMenuConfig } from "./menu.js";

/**
 * Configuration for the pivot table.
 *
 * @alpha
 */
export type PivotTableNextConfig = PivotTableNextTranspositionConfig &
    PivotTableNextTextWrappingConfig &
    PivotTableNextColumnsSizingConfig &
    PivotTableNextMenuConfig;

/**
 * Props for the pivot table.
 *
 * @alpha
 */
export interface IPivotTableNextProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Backend to use for the pivot table.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to use for the pivot table.
     */
    workspace?: string;

    /**
     * Columns to display in the pivot table.
     */
    columns?: IAttribute[];

    /**
     * Rows to display in the pivot table.
     */
    rows?: IAttribute[];

    /**
     * Measures to display in the pivot table.
     */
    measures?: IMeasure[];

    /**
     * Filters to apply to the pivot table.
     */
    filters?: IFilter[];

    /**
     * Totals to display in the pivot table.
     */
    totals?: ITotal[];

    /**
     * Sort by to apply to the pivot table.
     */
    sortBy?: ISortItem[];

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     */
    drillableItems?: ExplicitDrill[];

    /**
     * Configuration for the pivot table.
     */
    config?: PivotTableNextConfig;

    /**
     * Customize size of page when fetching data from backend.
     *
     * @remarks
     * Default is 100.
     */
    pageSize?: number;

    /**
     * Specify function to call when user manually resizes a table column.
     *
     * @param columnWidths - new widths for columns
     */
    onColumnResized?: ColumnResizedCallback;
}
