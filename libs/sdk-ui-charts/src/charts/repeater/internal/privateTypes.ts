// (C) 2024-2025 GoodData Corporation

import { Column, GridApi } from "ag-grid-community";

import { IAttributeOrMeasure, ISeparators } from "@gooddata/sdk-model";
import { DataViewFacade, IHeaderPredicate, OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { RepeaterColumnWidthItem } from "../columnWidths.js";
import { RepeaterColumnResizedCallback, RepeaterDefaultColumnWidth } from "../publicTypes.js";

export type ColumnResizingConfig = {
    defaultWidth: number;
    growToFit: boolean;
    columnAutoresizeOption: RepeaterDefaultColumnWidth;
    widths: RepeaterColumnWidthItem[] | undefined;

    clientWidth: number;
    containerRef: HTMLDivElement | undefined;
    separators: ISeparators | undefined;

    isMetaOrCtrlKeyPressed: boolean;
    isAltKeyPressed: boolean;

    onColumnResized: RepeaterColumnResizedCallback | undefined;
};

export type ResizingState = {
    items: IAttributeOrMeasure[];
    isAltKeyPressed: boolean;
    isMetaOrCtrlKeyPressed: boolean;
    clicks: number;
    columnApi: GridApi | null;
    manuallyResizedColumns: Column[];
};

export type DrillingState = {
    items: IAttributeOrMeasure[];
    columnApi: GridApi | null;
    drillablePredicates: IHeaderPredicate[];
    dataView: DataViewFacade;

    onDrill: OnFiredDrillEvent | undefined;
};
