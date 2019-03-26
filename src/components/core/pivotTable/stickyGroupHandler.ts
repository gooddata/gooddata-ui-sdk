// (C) 2007-2019 GoodData Corporation
import { GridApi, RowNode } from 'ag-grid';
import { IGroupingProvider } from './GroupingProvider';
import { colIdIsSimpleAttribute, getRowIndexByScrollTop } from '../../../helpers/agGrid';
import ApiWrapper from './agGridApiWrapper';

export const initStickyHeaders = (gridApi: GridApi) => {
    gridApi.setPinnedTopRowData([{}]);
};

export const updateStickyHeadersPosition = (gridApi: GridApi) => {
    const headerHeight = ApiWrapper.getHeaderHeight(gridApi);
    ApiWrapper.setPinnedTopRowStyle(gridApi, 'top', `${headerHeight}px`);
};

export const updateStickyHeaders = (
    currentScrollTop: number,
    lastScrollTop: number,
    rowHeight: number,
    gridApi: GridApi,
    groupingProvider: IGroupingProvider,
    apiWrapper: any
) => {
    const currentRowIndex = getRowIndexByScrollTop(currentScrollTop, rowHeight);
    const lastRowIndex = getRowIndexByScrollTop(lastScrollTop, rowHeight);
    if ((lastRowIndex === currentRowIndex) && currentScrollTop !== 0) {
        return;
    }

    const firstVisibleRowIndex = getRowIndexByScrollTop(currentScrollTop, rowHeight);
    const firstVisibleRow: RowNode = gridApi.getDisplayedRowAtIndex(firstVisibleRowIndex);
    const firstVisibleNodeData = firstVisibleRow && firstVisibleRow.data ? firstVisibleRow.data : null;

    if (firstVisibleNodeData === null) {
        apiWrapper.removePinnedTopRowClass(gridApi, 'gd-visible-sticky-row');
        return;
    }

    // show the pinned row for sticky column headers
    apiWrapper.addPinnedTopRowClass(gridApi, 'gd-visible-sticky-row');
    // set the sticky header text
    gridApi.setPinnedTopRowData([firstVisibleNodeData]);

    const attributeKeys = Object.keys(firstVisibleNodeData).filter(colIdIsSimpleAttribute);

    attributeKeys.forEach((columnId: string) => {
        apiWrapper.removeCellClass(gridApi, columnId, lastRowIndex, 'gd-cell-show-hidden');

        // the following value is the same as the current one
        if (groupingProvider.isRepeatedValue(columnId, firstVisibleRowIndex + 1)) {
            // show the sticky header
            apiWrapper.removePinnedTopRowCellClass(gridApi, columnId, 'gd-hidden-sticky-column');
        } else {
            // hide the sticky header
            apiWrapper.addPinnedTopRowCellClass(gridApi, columnId, 'gd-hidden-sticky-column');
            // if the column has some groups
            if (groupingProvider.isColumnWithGrouping(columnId)) {
                // show the last cell of the froup temporarily so it scrolls out of the viewport nicely
                apiWrapper.addCellClass(gridApi, columnId, currentRowIndex, 'gd-cell-show-hidden');
            }
        }
    });
};
