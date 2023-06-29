// (C) 2007-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { GridApi } from "@ag-grid-community/all-modules";
import { IGroupingProvider } from "./data/rowGroupingProvider.js";
import { getGridIndex } from "./base/agUtils.js";
import ApiWrapper from "./base/agApiWrapper.js";
import { getScrollbarWidth } from "./utils.js";
import { ROW_ATTRIBUTE_COLUMN } from "./base/constants.js";
import { IGridRow } from "./data/resultTypes.js";
export interface IScrollPosition {
    readonly top: number;
    readonly left: number;
}

export function initializeStickyRow(gridApi: GridApi): void {
    gridApi.setPinnedTopRowData([{}]);
}

export function updateStickyRowPosition(gridApi: GridApi | null, apiWrapper: any = ApiWrapper): void {
    if (!gridApi) {
        return;
    }

    const headerHeight = apiWrapper.getHeaderHeight(gridApi);
    apiWrapper.setPinnedTopRowStyles(gridApi, {
        top: `${headerHeight}px`,
        "padding-right": `${getScrollbarWidth()}px`,
    });
}

export function stickyRowExists(gridApi: GridApi, apiWrapper: any = ApiWrapper): boolean {
    return !!apiWrapper.getPinnedTopRowElement(gridApi);
}

function shouldUpdate(
    currentScrollPosition: IScrollPosition,
    lastScrollPosition: IScrollPosition,
    rowHeight: number,
) {
    const initialUpdate = currentScrollPosition.top === 0;
    const currentRowIndex = getGridIndex(currentScrollPosition.top, rowHeight);
    const lastRowIndex = getGridIndex(lastScrollPosition.top, rowHeight);
    const differentRow = currentRowIndex !== lastRowIndex;
    // when scrolling horizontally update with the same cadence as rows as we don't know where the column borders are
    const horizontalBreakpointDistance = rowHeight;
    const currentHorizontalBreakpoint = getGridIndex(
        currentScrollPosition.left,
        horizontalBreakpointDistance,
    );
    const lastHorizontalBreakpoint = getGridIndex(lastScrollPosition.left, horizontalBreakpointDistance);
    const differentHorizontalBreakpoint = currentHorizontalBreakpoint !== lastHorizontalBreakpoint;

    return initialUpdate || differentRow || differentHorizontalBreakpoint;
}

function areDataDifferent(previousData: any, currentData: any): boolean {
    return (
        Object.keys(previousData).length !== Object.keys(currentData).length ||
        Object.keys(previousData).some((dataItemKey: string) => {
            return previousData[dataItemKey] !== currentData[dataItemKey];
        })
    );
}

export function updateStickyRowContentClassesAndData(
    currentScrollPosition: IScrollPosition,
    lastScrollPosition: IScrollPosition,
    rowHeight: number,
    gridApi: GridApi | null,
    groupingProvider: IGroupingProvider,
    apiWrapper: typeof ApiWrapper,
): void {
    if (!gridApi || !shouldUpdate(currentScrollPosition, lastScrollPosition, rowHeight)) {
        return;
    }

    const firstVisibleRowIndex = getGridIndex(currentScrollPosition.top, rowHeight);
    const firstVisibleRow = gridApi.getDisplayedRowAtIndex(firstVisibleRowIndex);
    const firstVisibleNodeData = firstVisibleRow?.data ?? null;

    if (firstVisibleNodeData === null) {
        apiWrapper.removePinnedTopRowClass(gridApi, "gd-visible-sticky-row");
        return;
    }
    apiWrapper.addPinnedTopRowClass(gridApi, "gd-visible-sticky-row");

    const lastRowIndex = getGridIndex(lastScrollPosition.top, rowHeight);
    // TODO: consider obtaining row-col descriptors from tableDescriptor instead
    const attributeKeys = Object.keys(firstVisibleNodeData).filter((colId: string) => {
        const colDef = gridApi.getColumnDef(colId);
        return colDef?.type === ROW_ATTRIBUTE_COLUMN;
    });

    const stickyRowData: Record<string, unknown> = {};
    const headerItemMap: Record<string, unknown> = {};

    attributeKeys.forEach((columnId: string) => {
        apiWrapper.removeCellClass(gridApi, columnId, lastRowIndex, "gd-cell-show-hidden");

        // the following value is the same as the current one
        if (groupingProvider.isRepeatedValue(columnId, firstVisibleRowIndex + 1)) {
            // set correct sticky row data
            stickyRowData[columnId] = firstVisibleNodeData[columnId];
            headerItemMap[columnId] = firstVisibleNodeData.headerItemMap[columnId];
        } else {
            // if the column has some groups
            if (groupingProvider.isColumnWithGrouping(columnId)) {
                // show the last cell of the group temporarily so it scrolls out of the viewport nicely
                const currentRowIndex = getGridIndex(currentScrollPosition.top, rowHeight);
                apiWrapper.addCellClass(gridApi, columnId, currentRowIndex, "gd-cell-show-hidden");
            }
        }
    });
    const previousRowData = gridApi.getPinnedTopRow(0)?.data as IGridRow;
    const {
        headerItemMap: _ignoredHeaders,
        type: _ignoredType,
        subtotalStyle: _ignoredStyle,
        ...previousData
    } = previousRowData;
    // set new rowData only if differen to avoid rerendering and flashing of the sticky row
    if (areDataDifferent(previousData, stickyRowData)) {
        const headerItemMapProp = isEmpty(headerItemMap) ? {} : { headerItemMap };
        gridApi.setPinnedTopRowData([
            {
                ...stickyRowData,
                ...headerItemMapProp,
            },
        ]);
    }
}
