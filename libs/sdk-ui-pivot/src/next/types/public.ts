// (C) 2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig } from "@gooddata/sdk-model";
import {
    type AttributesMeasuresOrPlaceholders,
    type AttributesOrPlaceholders,
    type ExplicitDrill,
    type IVisualizationCallbacks,
    type IVisualizationProps,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    type TotalsOrPlaceholders,
} from "@gooddata/sdk-ui";

import { type PivotTableNextAccessibilityConfig } from "./accessibility.js";
import { type PivotTableNextCellSelectionConfig } from "./cellSelection.js";
import { type PivotTableNextExecutionCancellingConfig } from "./executionCancelling.js";
import { type PivotTableNextExperimentalConfig } from "./experimental.js";
import { type PivotTableNextFormattingConfig } from "./formatting.js";
import { type PivotTableNextGrandTotalsPositionConfig } from "./grandTotalsPosition.js";
import { type PivotTableNextLayoutConfig } from "./layout.js";
import { type PivotTableNextAgGridLicenseConfig } from "./license.js";
import { type PivotTableNextMenuConfig } from "./menu.js";
import { type PivotTableNextPaginationConfig } from "./pagination.js";
import { type ColumnResizedCallback, type PivotTableNextColumnsSizingConfig } from "./resizing.js";
import { type PivotTableNextTextWrappingConfig } from "./textWrapping.js";
import { type PivotTableNextTranspositionConfig } from "./transposition.js";

/**
 * Configuration for the pivot table next.
 *
 * @public
 */
export type PivotTableNextConfig = PivotTableNextTranspositionConfig &
    PivotTableNextTextWrappingConfig &
    PivotTableNextColumnsSizingConfig &
    PivotTableNextMenuConfig &
    PivotTableNextFormattingConfig &
    PivotTableNextExecutionCancellingConfig &
    PivotTableNextLayoutConfig &
    PivotTableNextGrandTotalsPositionConfig &
    PivotTableNextCellSelectionConfig &
    PivotTableNextAgGridLicenseConfig &
    PivotTableNextPaginationConfig &
    PivotTableNextAccessibilityConfig &
    PivotTableNextExperimentalConfig;

/**
 * Props for the PivotTableNext component.
 *
 * @remarks
 * PivotTableNext is the new implementation of the pivot table built on AG Grid Enterprise.
 * It replaces the legacy PivotTable component and offers improved performance, accessibility,
 * text wrapping, cell selection, and other enhanced features.
 *
 * See {@link PivotTableNext} for more information.
 *
 * @public
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
