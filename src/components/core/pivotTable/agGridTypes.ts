// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { IMappingHeader } from "../../../interfaces/MappingHeader";
import { ColDef, CellEvent, GridOptions } from "ag-grid-community";

export interface IGridRow {
    headerItemMap: {
        [key: string]: IMappingHeader;
    };
    subtotalStyle?: string;
    [key: string]: any;
}

export interface IGridTotalsRow {
    type: string;
    colSpan: {
        count: number;
        headerKey: string;
    };
    rowTotalActiveMeasures?: string[];
    [key: string]: any;
}

export interface IGridCellEvent extends CellEvent {
    colDef: IGridHeader;
}

export interface IGridHeader extends ColDef {
    index?: number;
    measureIndex?: number;
    drillItems: IMappingHeader[];
    children?: IGridHeader[];
}

export interface IColumnDefOptions {
    [key: string]: any;
}

export interface IGridAdapterOptions {
    makeRowGroups?: boolean;
    addLoadingRenderer?: string;
    columnDefOptions?: IColumnDefOptions;
}

export interface IAgGridPage {
    columnDefs: IGridHeader[];
    rowData: IGridRow[];
    rowTotals: IGridTotalsRow[];
}

export interface ISortModelItem {
    colId: string;
    sort: AFM.SortDirection;
}

export interface ICustomGridOptions extends GridOptions {
    enableMenu?: boolean;
}

export interface ISortedByColumnIndexes {
    attributes: number[];
    all: number[];
}
