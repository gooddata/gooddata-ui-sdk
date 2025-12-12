// (C) 2007-2025 GoodData Corporation

import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

import { type ICorePivotTableProps } from "../../publicTypes.js";

/**
 * Default values for pivot table props
 */
export const PIVOT_TABLE_DEFAULT_PROPS: Pick<
    ICorePivotTableProps,
    | "locale"
    | "drillableItems"
    | "afterRender"
    | "pushData"
    | "onExportReady"
    | "onLoadingChanged"
    | "onError"
    | "onDataView"
    | "onDrill"
    | "ErrorComponent"
    | "LoadingComponent"
    | "pageSize"
    | "config"
    | "onColumnResized"
> = {
    locale: "en-US",
    drillableItems: [],
    afterRender: () => {},
    pushData: () => {},
    onExportReady: () => {},
    onLoadingChanged: () => {},
    onError: () => {},
    onDataView: () => {},
    onDrill: () => true,
    ErrorComponent,
    LoadingComponent,
    pageSize: 100,
    config: {},
    onColumnResized: () => {},
};

/**
 * Default timeout for ag-grid resize operations
 */
export const AGGRID_ON_RESIZE_TIMEOUT = 300;
