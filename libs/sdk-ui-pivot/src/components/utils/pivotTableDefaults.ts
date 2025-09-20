// (C) 2007-2025 GoodData Corporation

import { noop } from "lodash-es";

import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

import { ICorePivotTableProps } from "../../publicTypes.js";

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
    afterRender: noop,
    pushData: noop,
    onExportReady: noop,
    onLoadingChanged: noop,
    onError: noop,
    onDataView: noop,
    onDrill: () => true,
    ErrorComponent,
    LoadingComponent,
    pageSize: 100,
    config: {},
    onColumnResized: noop,
};

/**
 * Default timeout for ag-grid resize operations
 */
export const AGGRID_ON_RESIZE_TIMEOUT = 300;

/**
 * Export noop for convenience
 */
export { noop } from "lodash-es";
