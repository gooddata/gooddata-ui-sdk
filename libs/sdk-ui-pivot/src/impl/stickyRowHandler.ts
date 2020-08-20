// (C) 2007-2020 GoodData Corporation
import { GridApi, RowNode } from "@ag-grid-community/all-modules";
import { IGroupingProvider } from "./GroupingProvider";
import { colIdIsSimpleAttribute, getGridIndex } from "./agGridUtils";
import ApiWrapper from "./agGridApiWrapper";
import { getScrollbarWidth } from "./utils";

export interface IScrollPosition {
    readonly top: number;
    readonly left: number;
}

export const initializeStickyRow = (gridApi: GridApi): void => {
    gridApi.setPinnedTopRowData([{}]);
};

export const updateStickyRowPosition = (gridApi: GridApi | null, apiWrapper: any = ApiWrapper): void => {
    if (!gridApi) {
        return;
    }

    const headerHeight = apiWrapper.getHeaderHeight(gridApi);
    apiWrapper.setPinnedTopRowStyle(gridApi, "top", `${headerHeight}px`);
    apiWrapper.setPinnedTopRowStyle(gridApi, "padding-right", `${getScrollbarWidth()}px`);
};

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

export const updateStickyRowContentClasses = (
    currentScrollPosition: IScrollPosition,
    lastScrollPosition: IScrollPosition,
    rowHeight: number,
    gridApi: GridApi | null,
    groupingProvider: IGroupingProvider,
    apiWrapper: typeof ApiWrapper,
): void => {
    if (!gridApi || !shouldUpdate(currentScrollPosition, lastScrollPosition, rowHeight)) {
        return;
    }

    const firstVisibleRowIndex = getGridIndex(currentScrollPosition.top, rowHeight);
    const firstVisibleRow: RowNode = gridApi.getDisplayedRowAtIndex(firstVisibleRowIndex);
    const firstVisibleNodeData = firstVisibleRow && firstVisibleRow.data ? firstVisibleRow.data : null;

    if (firstVisibleNodeData === null) {
        apiWrapper.removePinnedTopRowClass(gridApi, "gd-visible-sticky-row");
        return;
    }
    apiWrapper.addPinnedTopRowClass(gridApi, "gd-visible-sticky-row");

    const lastRowIndex = getGridIndex(lastScrollPosition.top, rowHeight);
    const attributeKeys = Object.keys(firstVisibleNodeData).filter(colIdIsSimpleAttribute);

    attributeKeys.forEach((columnId: string) => {
        apiWrapper.removeCellClass(gridApi, columnId, lastRowIndex, "gd-cell-show-hidden");

        // the following value is the same as the current one
        if (groupingProvider.isRepeatedValue(columnId, firstVisibleRowIndex + 1)) {
            // set the sticky header text
            apiWrapper.setPinnedTopRowCellText(gridApi, columnId, firstVisibleNodeData[columnId]);
            // show the sticky header
            apiWrapper.removePinnedTopRowCellClass(gridApi, columnId, "gd-hidden-sticky-column");
        } else {
            // hide the sticky header
            apiWrapper.addPinnedTopRowCellClass(gridApi, columnId, "gd-hidden-sticky-column");
            // if the column has some groups
            if (groupingProvider.isColumnWithGrouping(columnId)) {
                // show the last cell of the group temporarily so it scrolls out of the viewport nicely
                const currentRowIndex = getGridIndex(currentScrollPosition.top, rowHeight);
                apiWrapper.addCellClass(gridApi, columnId, currentRowIndex, "gd-cell-show-hidden");
            }
        }
    });
};
