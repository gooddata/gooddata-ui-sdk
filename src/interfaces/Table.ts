// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';

export interface IAttributeTableHeader {
    uri: string;
    identifier: string;
    localIdentifier: string;
    name: string;
    type: string;
}

export interface IMeasureTableHeader {
    uri?: string;
    identifier?: string;
    localIdentifier: string;
    name: string;
    format: string;
    type: string;
}

export type TableHeader = IAttributeTableHeader | IMeasureTableHeader;

export function isAttributeTableHeader(header: TableHeader): header is IAttributeTableHeader {
    return header.type === 'attribute';
}

export function isMeasureTableHeader(header: TableHeader): header is IMeasureTableHeader {
    return header.type === 'measure';
}

export interface IAttributeCell {
    uri: string;
    name: string;
}

export interface IAttributeCellForDrilling {
    id: string;
    name: string;
}

export type MeasureCell = string | null;

export type TableCell = IAttributeCell | MeasureCell;

export type TableCellForDrilling = IAttributeCellForDrilling | MeasureCell;

export type TableRow = TableCell[];

export type TableRowForDrilling = TableCellForDrilling[];

export type Align = 'left' | 'right';

export type SortDir = 'asc' | 'desc';

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
    offset: { x: number, y: number };
}

export interface ITableCellStyle {
    color?: string;
    fontWeight?: React.CSSProperties['fontWeight'];
}

export type TableCellLabel = string;

export interface ITableCellStyledLabel {
    style: ITableCellStyle;
    label: TableCellLabel;
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

export type OnSortChangeWithDir  = (dir: SortDir, e: any) => void;

export type OnSortChangeWithItem  = (sortItem: AFM.SortItem) => void;

export interface ITableTransformationConfig {
    rowsPerPage?: number;
    onMore?: Function;
    onLess?: Function;
    sortInTooltip?: boolean;
    stickyHeaderOffset?: number;
}

export function isAttributeCell(cell: TableCell): cell is IAttributeCell {
    return cell && (cell as IAttributeCell).uri !== undefined;
}
