// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { ISeparators } from "@gooddata/numberjs";

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

export type TableRow = TableCell[];

export type TableRowForDrilling = TableCellForDrilling[];

export type Align = "left" | "right";

export type SortDir = "asc" | "desc";

export interface ISortInfo {
    sortBy: number;
    sortDir: SortDir;
}

export interface IScrollEvent {
    name: string;
    debounce: number;
}

export interface ISortObj {
    dir: SortDir;
    nextDir: SortDir;
    sortDirClass: string;
}

export interface IAlignPoint {
    align: string;
    offset: { x: number; y: number };
}

export interface ITableCellStyle {
    backgroundColor?: string;
    color?: string;
    fontWeight?: React.CSSProperties["fontWeight"];
}

export interface ITableCellStyleAndFormattedValue {
    style: ITableCellStyle;
    formattedValue: string;
}

export interface IPositions {
    absoluteTop: number;
    defaultTop: number;
    edgeTop: number;
    fixedTop: number;
}

export interface IHeaderTooltipArrowPosition {
    left: string;
}

export interface ITableColumnProperties {
    align: Align;
    index: number;
    width: number;
}

export interface ITableDimensions {
    height: number;
    top?: number;
    bottom?: number;
}

export interface ITotalTypeWithTitle {
    type?: AFM.TotalType;
    title: string;
    role?: string;
}

export interface ITotalsDataSource {
    rowsCount: number;
    getObjectAt: (index: number) => ITotalTypeWithTitle;
}

export type OnSortChangeWithDir = (dir: SortDir, e: any) => void;

export type OnSortChangeWithItem = (sortItem: AFM.SortItem) => void;

export interface ITableTransformationConfig {
    rowsPerPage?: number;
    onMore?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    onLess?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    sortInTooltip?: boolean;
    stickyHeaderOffset?: number;
    separators?: ISeparators;
}

export function isAttributeCell(cell: TableCell): cell is IAttributeCell {
    return cell && (cell as IAttributeCell).uri !== undefined;
}
