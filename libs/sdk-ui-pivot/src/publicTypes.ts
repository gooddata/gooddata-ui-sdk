// (C) 2007-2021 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IAnalyticalBackend, IPreparedExecution, ITheme } from "@gooddata/sdk-backend-spi";
import { IAttribute, INullableFilter, ISortItem, ITotal, TotalType } from "@gooddata/sdk-model";
import {
    AnyMeasure,
    IVisualizationCallbacks,
    IVisualizationProps,
    ValuesOrPlaceholders,
} from "@gooddata/sdk-ui";
import { WrappedComponentProps } from "react-intl";
import { ColumnWidthItem } from "./columnWidths";

/**
 * @public
 */
export interface IMenu {
    /**
     * If true, grand totals can be added to the table using table menu.
     *
     * Default: false
     */
    aggregations?: boolean;

    /**
     * If true, subtotals can be added to the table using table menu.
     *
     * Default: false
     */
    aggregationsSubMenu?: boolean;

    /**
     * Optionally specifies which aggregation functions can be selected from the menu.
     *
     * Note: this option only impacts available menu items. It will not be used to filter totals that
     * you specify on the pivot table props.
     *
     * Default: all available types.
     */
    aggregationTypes?: TotalType[];
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
     * Optionally indicate that the table should grow to fit into the allocated space.
     *
     * Default: false
     */
    growToFit?: boolean;

    /**
     * Optionally specify whether columns should be resized to fill the entire viewport.
     *
     * Default: unset
     */
    defaultWidth?: DefaultColumnWidth;

    /**
     * Optionally specify custom column widths to apply.
     *
     * Default: none
     */
    columnWidths?: ColumnWidthItem[];
}

/**
 * @public
 */
export interface IPivotTableConfig {
    /**
     * Optionally customize column sizing strategy.
     *
     * Default: none
     */
    columnSizing?: IColumnSizing;

    /**
     * Optionally specify whether the table should group rows. If this is turned on and the table is sorted
     * by the first row attribute, then the grouping will take effect.
     *
     * Default: true
     */
    groupRows?: boolean;

    /**
     * Optionally customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;

    /**
     * Optionally customize whether the column-level burger menu should be visible and if so,
     * what aggregations should be allowed.
     */
    menu?: IMenu;

    /**
     * Optionally customize maximum height of the table.
     */
    maxHeight?: number;
}

/**
 * @public
 */
export interface IPivotTableProps extends IPivotTableBaseProps, IPivotTableBucketProps {
    /**
     * Optionally specify an instance of analytical backend instance to work with.
     *
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Optionally specify workspace to work with.
     *
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;
}

/**
 * @public
 */
export interface IPivotTableBucketProps {
    /**
     * Optionally specify measures to create table columns from.
     */
    measures?: ValuesOrPlaceholders<IAttribute | AnyMeasure>;

    /**
     * Optionally specify one or more attributes to create table columns from. There will be a column for each
     * combination of the specified attribute's values.
     *
     * Note: you can specify column attributes in conjunction with one or more measures. In that case the table
     * will contain column for each combination of attribute values & measures.
     */
    columns?: ValuesOrPlaceholders<IAttribute>;

    /**
     * Optionally specify attributes, whose elements will be used to populate table rows.
     */
    rows?: ValuesOrPlaceholders<IAttribute>;

    /**
     * Optionally specify what totals should be calculated and included in the table.
     *
     * Note: table can only render column subtotal and/or grand-totals. It is not possible to calculate row totals.
     * Also note: the table will only include subtotals when in grouping mode and the grouping is effective = table
     * is sorted by the first row attribute.
     */
    totals?: ValuesOrPlaceholders<ITotal>;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: ValuesOrPlaceholders<INullableFilter>;

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ValuesOrPlaceholders<ISortItem>;

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
 * TODO Is value param enough, or can decorator need whole datapoint?
 */
export type DrillableItemDecorator = (value: string | undefined) => string;

/**
 * @public
 */
export interface IPivotTableBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    /**
     * Optionally customize size of page when fetching data from backend.
     *
     * Default is 100.
     */
    pageSize?: number;

    /**
     * Optionally customize how pivot table capabilities and behavior.
     */
    config?: IPivotTableConfig;

    /**
     * Optionally specify function to call when user manually resizes a table column.
     *
     * @param columnWidths - new widths for columns
     */
    onColumnResized?: ColumnResizedCallback;

    /**
     * Define decoration of drillable cells
     * Note: Only strig operations are supported to keep autoresizing measurement working
     * Eg. Add unicode icon as prefix/suffix
     */
    drillableItemDecorator?: DrillableItemDecorator;
}
