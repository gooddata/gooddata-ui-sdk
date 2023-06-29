// (C) 2007-2022 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { ITheme, TotalType, IExecutionConfig } from "@gooddata/sdk-model";
import {
    IVisualizationCallbacks,
    IVisualizationProps,
    AttributesMeasuresOrPlaceholders,
    TotalsOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    AttributesOrPlaceholders,
} from "@gooddata/sdk-ui";
import { WrappedComponentProps } from "react-intl";
import { ColumnWidthItem } from "./columnWidths.js";

/**
 * @public
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
     * TODO: remove for SDK9
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
 * @public
 */
export type DefaultColumnWidth = "unset" | "autoresizeAll" | "viewport";

/**
 * @public
 */
export interface IColumnSizing {
    /**
     * Indicate that the table should grow to fit into the allocated space.
     *
     * @remarks
     * Default: false
     */
    growToFit?: boolean;

    /**
     * Specify whether columns should be resized to fill the entire viewport.
     *
     * @remarks
     * Default: unset
     */
    defaultWidth?: DefaultColumnWidth;

    /**
     * Specify custom column widths to apply.
     *
     * @remarks
     * Default: none
     */
    columnWidths?: ColumnWidthItem[];
}

/**
 * @public
 */
export interface IPivotTableConfig {
    /**
     * Customize column sizing strategy.
     *
     * @remarks
     * Default: none
     */
    columnSizing?: IColumnSizing;

    /**
     * Specify whether the table should group rows.
     *
     * @remarks
     * If this is turned on and the table is sorted by the first row attribute, then the grouping will take effect.
     *
     * Default: true
     */
    groupRows?: boolean;

    /**
     * Customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;

    /**
     * customize whether the column-level burger menu should be visible and if so,
     * what aggregations should be allowed.
     */
    menu?: IMenu;

    /**
     * Customize maximum height of the table.
     */
    maxHeight?: number;
}

/**
 * @public
 */
export interface IPivotTableProps extends IPivotTableBaseProps, IPivotTableBucketProps {
    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;
}

/**
 * @public
 */
export interface IPivotTableBucketProps {
    /**
     * Specify measures to create table columns from.
     */
    measures?: AttributesMeasuresOrPlaceholders;

    /**
     * Specify one or more attributes to create table columns from.
     *
     * @remarks
     * There will be a column for each combination of the specified attribute's values.
     *
     * Note: you can specify column attributes in conjunction with one or more measures. In that case the table
     * will contain column for each combination of attribute values & measures.
     */
    columns?: AttributesOrPlaceholders;

    /**
     * Specify attributes, whose elements will be used to populate table rows.
     */
    rows?: AttributesOrPlaceholders;

    /**
     * Specify what totals should be calculated and included in the table.
     *
     * @remarks
     * Note: table can only render column subtotal and/or grand-totals. It is not possible to calculate row totals.
     * Also note: the table will only include subtotals when in grouping mode and the grouping is effective = table
     * is sorted by the first row attribute.
     */
    totals?: TotalsOrPlaceholders;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @internal
 */
export interface ICorePivotTableProps extends IPivotTableBaseProps, WrappedComponentProps {
    execution: IPreparedExecution;
    theme?: ITheme;
}

/**
 * @public
 */
export type ColumnResizedCallback = (columnWidths: ColumnWidthItem[]) => void;

/**
 * @public
 */
export interface IPivotTableBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Customize size of page when fetching data from backend.
     *
     * @remarks
     * Default is 100.
     */
    pageSize?: number;

    /**
     * Customize how pivot table capabilities and behavior.
     */
    config?: IPivotTableConfig;

    /**
     * Execution configuration.
     *
     * @remarks
     * This property will provide the execution with necessary config before initiating execution.
     */
    execConfig?: IExecutionConfig;

    /**
     * Specify function to call when user manually resizes a table column.
     *
     * @param columnWidths - new widths for columns
     */
    onColumnResized?: ColumnResizedCallback;
}
