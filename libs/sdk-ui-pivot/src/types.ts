// (C) 2007-2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IAttribute, IFilter, ITotal, SortItem, TotalType } from "@gooddata/sdk-model";
import { IVisualizationCallbacks, IVisualizationProps } from "@gooddata/sdk-ui";
import { WrappedComponentProps } from "react-intl";

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IMenu {
    aggregations?: boolean;
    aggregationsSubMenu?: boolean;
}

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IPivotTableConfig {
    separators?: ISeparators;
    menu?: IMenu;
    maxHeight?: number;
}

export interface IMenuAggregationClickConfig {
    type: TotalType;
    measureIdentifiers: string[];
    attributeIdentifier: string;
    include: boolean;
}

export interface IAttributeCell {
    uri: string;
    name: string;
}

export interface IAttributeCellForDrilling {
    id: string;
    name: string;
}

export type MeasureCell = number | string | null;
export type TableCell = IAttributeCell | MeasureCell;
export type TableCellForDrilling = IAttributeCellForDrilling | MeasureCell;
export type TableRowForDrilling = TableCellForDrilling[];

export interface ITableCellStyle {
    backgroundColor?: string;
    color?: string;
    fontWeight?: React.CSSProperties["fontWeight"];
}

export interface ITableCellStyleAndFormattedValue {
    style: ITableCellStyle;
    formattedValue: string;
}

export function isAttributeCell(cell: TableCell): cell is IAttributeCell {
    return cell && (cell as IAttributeCell).uri !== undefined;
}

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IPivotTableProps extends IPivotTableBaseProps, IPivotTableBucketProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
}

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IPivotTableBucketProps {
    measures?: AttributeOrMeasure[];
    rows?: IAttribute[];
    columns?: IAttribute[];
    totals?: ITotal[];
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * @internal
 */
export interface ICorePivotTableProps extends IPivotTableBaseProps, WrappedComponentProps {
    execution: IPreparedExecution;
}

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IPivotTableBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    pageSize?: number;
    config?: IPivotTableConfig;
    groupRows?: boolean;
    exportTitle?: string;
}
