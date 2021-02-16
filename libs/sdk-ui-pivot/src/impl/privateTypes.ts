// (C) 2007-2021 GoodData Corporation
import { ITotal, TotalType } from "@gooddata/sdk-model";
import { ColumnWidthItem } from "../columnWidths";
import { ISeparators } from "@gooddata/numberjs";
import { ColumnResizedCallback } from "../publicTypes";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { IScrollPosition } from "./stickyRowHandler";
import { GridOptions } from "@ag-grid-community/all-modules";

/*
 * The types defined in this file are used internally thorough different components. They are never intended
 * for public exports.
 */

export interface IMenuAggregationClickConfig {
    type: TotalType;
    measureIdentifiers: string[];
    attributeIdentifier: string;
    include: boolean;
}

export type DataSourceConfig = {
    getGroupRows: () => boolean;
    getColumnTotals: () => ITotal[];
    onPageLoaded: (dv: DataViewFacade, newResult: boolean) => void;
};
export type ColumnResizingConfig = {
    defaultWidth: number;
    growToFit: boolean;
    columnAutoresizeEnabled: boolean;
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
