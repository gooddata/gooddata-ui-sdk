// (C) 2025 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IExecutionConfig } from "@gooddata/sdk-model";
import {
    AttributesMeasuresOrPlaceholders,
    AttributesOrPlaceholders,
    ExplicitDrill,
    IVisualizationCallbacks,
    IVisualizationProps,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    TotalsOrPlaceholders,
} from "@gooddata/sdk-ui";

import { PivotTableNextCellSelectionConfig } from "./cellSelection.js";
import { PivotTableNextExecutionCancellingConfig } from "./executionCancelling.js";
import { PivotTableNextFormattingConfig } from "./formatting.js";
import { PivotTableNextLayoutConfig } from "./layout.js";
import { PivotTableNextAgGridLicenseConfig } from "./license.js";
import { PivotTableNextMenuConfig } from "./menu.js";
import { ColumnResizedCallback, PivotTableNextColumnsSizingConfig } from "./resizing.js";
import { PivotTableNextTextWrappingConfig } from "./textWrapping.js";
import { PivotTableNextTranspositionConfig } from "./transposition.js";

export type PivotTableNextConfig = PivotTableNextTranspositionConfig &
    PivotTableNextTextWrappingConfig &
    PivotTableNextColumnsSizingConfig &
    PivotTableNextMenuConfig &
    PivotTableNextFormattingConfig &
    PivotTableNextExecutionCancellingConfig &
    PivotTableNextLayoutConfig &
    PivotTableNextCellSelectionConfig &
    PivotTableNextAgGridLicenseConfig;

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
    columns?: AttributesOrPlaceholders;

    /**
     * Rows to display in the pivot table.
     */
    rows?: AttributesOrPlaceholders;

    /**
     * Measures to display in the pivot table.
     */
    measures?: AttributesMeasuresOrPlaceholders;

    /**
     * Filters to apply to the pivot table.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Totals to display in the pivot table.
     */
    totals?: TotalsOrPlaceholders;

    /**
     * Sort by to apply to the pivot table.
     */
    sortBy?: SortsOrPlaceholders;

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

    /**
     * Execution configuration to apply when computing data for the table.
     */
    execConfig?: IExecutionConfig;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}
