// (C) 2024 GoodData Corporation

import { ISeparators, IAttributeOrMeasure } from "@gooddata/sdk-model";
import { ColumnApi, Column } from "@ag-grid-community/all-modules";

import { RepeaterDefaultColumnWidth, RepeaterColumnResizedCallback } from "../publicTypes.js";
import { RepeaterColumnWidthItem } from "../columnWidths.js";

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
    columnApi: ColumnApi | null;
    manuallyResizedColumns: Column[];
};
