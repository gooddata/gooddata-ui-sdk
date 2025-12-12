// (C) 2007-2025 GoodData Corporation

import {
    type AgGridEvent,
    type BodyScrollEvent,
    type ColumnResizedEvent,
    type GridOptions,
    type GridReadyEvent,
    type PinnedRowDataChangedEvent,
    type SortChangedEvent,
} from "ag-grid-community";

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type ISeparators,
    type ITotal,
    type TotalType,
} from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type GoodDataSdkError,
    type ILoadingState,
    type IPushData,
    type OnExportReady,
} from "@gooddata/sdk-ui";

import { type IScrollPosition } from "./stickyRowHandler.js";
import { type ColumnWidthItem } from "../columnWidths.js";
import {
    type ColumnHeadersPosition,
    type ColumnResizedCallback,
    type DefaultColumnWidth,
    type IMenu,
    type MeasureGroupDimension,
} from "../publicTypes.js";

export interface IMenuAggregationClickConfig {
    type: TotalType;
    measureIdentifiers: string[];
    attributeIdentifier: string;
    include: boolean;
    isColumn?: boolean;
}

export type OnExecutionTransformed = (newExecution: IPreparedExecution) => void;
export type OnTransformedExecutionFailed = () => void;

/*
 * The types defined in this file are used internally thorough different components. They are never intended
 * for public exports.
 */

export type TableLegacyCallbacks = {
    pushData: (data: IPushData) => void;
};

/**
 * Callbacks for table / data loading.
 */
export type TableDataCallbacks = {
    onLoadingChanged: (loadingState: ILoadingState) => void;
    onError: (error: GoodDataSdkError, execution: IPreparedExecution) => void;
    onExportReady: OnExportReady;
    onPageLoaded: (dv: DataViewFacade, newResult: boolean) => void;
    onExecutionTransformed: OnExecutionTransformed;
};

/**
 * Accessors for static and dynamic table configuration.
 */
export type TableConfigAccessors = {
    hasColumnWidths: boolean;

    getExecutionDefinition: () => IExecutionDefinition;
    getMenuConfig: () => IMenu;
    getGroupRows: () => boolean;
    getColumnTotals: () => ITotal[];
    getRowTotals: () => ITotal[];
    getColumnHeadersPosition: () => ColumnHeadersPosition;
    getMeasureGroupDimension: () => MeasureGroupDimension;

    getResizingConfig: () => ColumnResizingConfig;
    setLastSortedColId: (colId: string | null) => void;
};

/**
 * Callbacks that are configured in ag-grid's grid options
 */
export type TableAgGridCallbacks = {
    onGridReady: (event: GridReadyEvent) => void;
    onFirstDataRendered: (event: AgGridEvent) => Promise<void>;
    onBodyScroll: (event: BodyScrollEvent) => void;
    onModelUpdated: (event: AgGridEvent) => void;
    onGridColumnsChanged: () => void;
    onGridColumnResized: (columnEvent: ColumnResizedEvent) => Promise<void>;
    onSortChanged: (event: SortChangedEvent) => void;
    onGridSizeChanged: (event: any) => void;
    onPinnedRowDataChanged: (event: PinnedRowDataChangedEvent) => void;
};

/**
 * Callbacks related to menu events.
 */
export type TableMenuCallbacks = {
    onMenuAggregationClick: (menuAggregationClickConfig: IMenuAggregationClickConfig) => void;
};

/**
 * This type contains all essential pivot table component methods (accessors and callbacks) which the different
 * sub-components of the CorePivotTableAgImpl may need.
 */
export type TableMethods = TableDataCallbacks &
    TableLegacyCallbacks &
    TableConfigAccessors &
    TableAgGridCallbacks &
    TableMenuCallbacks;

export type ColumnResizingConfig = {
    defaultWidth: number;
    growToFit: boolean;
    columnAutoresizeOption: DefaultColumnWidth;
    widths: ColumnWidthItem[] | undefined;

    clientWidth: number;
    containerRef: HTMLDivElement | undefined;
    separators: ISeparators | undefined;

    isMetaOrCtrlKeyPressed: boolean;
    isAltKeyPressed: boolean;

    onColumnResized: ColumnResizedCallback | undefined;
};
export type StickyRowConfig = {
    scrollPosition: IScrollPosition;
    lastScrollPosition: IScrollPosition;
};

export interface ICustomGridOptions extends GridOptions {
    enableMenu?: boolean;
}
