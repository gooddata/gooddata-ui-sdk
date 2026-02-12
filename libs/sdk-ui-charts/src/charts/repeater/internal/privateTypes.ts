// (C) 2024-2026 GoodData Corporation

import { type Column, type GridApi } from "ag-grid-community";

import { type IAttributeOrMeasure, type ISeparators } from "@gooddata/sdk-model";
import { type DataViewFacade, type IHeaderPredicate, type OnFiredDrillEvent } from "@gooddata/sdk-ui";

import { type AnimationFrameHandle } from "../../_base/animationFrameScheduler.js";
import { type RepeaterColumnWidthItem } from "../columnWidths.js";
import { type RepeaterColumnResizedCallback, type RepeaterDefaultColumnWidth } from "../publicTypes.js";

export type ColumnResizingConfig = {
    defaultWidth: number;
    growToFit: boolean;
    columnAutoresizeOption: RepeaterDefaultColumnWidth;
    widths: RepeaterColumnWidthItem[] | undefined;

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
    containerElement: HTMLDivElement | null;
    growToFitFrame: AnimationFrameHandle;
    manuallyResizedColumns: Column[];
};

export type DrillingState = {
    items: IAttributeOrMeasure[];
    columnApi: GridApi | null;
    drillablePredicates: IHeaderPredicate[];
    dataView: DataViewFacade;

    onDrill: OnFiredDrillEvent | undefined;
};
