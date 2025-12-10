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

import { PivotTableNextAccessibilityConfig } from "./accessibility.js";
import { PivotTableNextCellSelectionConfig } from "./cellSelection.js";
import { PivotTableNextExecutionCancellingConfig } from "./executionCancelling.js";
import { PivotTableNextExperimentalConfig } from "./experimental.js";
import { PivotTableNextFormattingConfig } from "./formatting.js";
import { PivotTableNextGrandTotalsPositionConfig } from "./grandTotalsPosition.js";
import { PivotTableNextLayoutConfig } from "./layout.js";
import { PivotTableNextAgGridLicenseConfig } from "./license.js";
import { PivotTableNextMenuConfig } from "./menu.js";
import { PivotTableNextPaginationConfig } from "./pagination.js";
import { ColumnResizedCallback, PivotTableNextColumnsSizingConfig } from "./resizing.js";
import { PivotTableNextTextWrappingConfig } from "./textWrapping.js";
import { PivotTableNextTranspositionConfig } from "./transposition.js";

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
