// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/gd-bear-model";
import { IMappingHeader } from "../../base/interfaces/MappingHeader";
import { CellEvent, ColDef, GridOptions } from "ag-grid-community";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";

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
    addLoadingRenderer?: string;
    // TODO: is this even used?
    makeRowGroups?: boolean;
    // TODO: is this even used?
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

export type TableHeaders = {
    rowHeaders: IGridHeader[];
    colHeaders: IGridHeader[];
    allHeaders: IGridHeader[];
    rowFields: string[];
    colFields: string[];
};

export type DatasourceCallbacks = {
    onPageLoaded: OnPageLoaded;
};

export type OnPageLoaded = (dv: DataViewFacade) => void;
