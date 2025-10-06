// (C) 2007-2025 GoodData Corporation

import { FocusGridInnerElementParams } from "ag-grid-community";

import {
    COLUMN_ATTRIBUTE_COLUMN,
    COLUMN_SUBTOTAL,
    COLUMN_TOTAL,
    DEFAULT_AUTOSIZE_PADDING,
    DEFAULT_ROW_HEIGHT,
    MEASURE_COLUMN,
    MIXED_HEADERS_COLUMN,
    MIXED_VALUES_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
    ROW_MEASURE_COLUMN,
} from "./base/constants.js";
import { cellClassFactory } from "./cell/cellClass.js";
import { onCellClickedFactory } from "./cell/onCellClick.js";
import { onCellKeyDownFactory } from "./cell/onCellKeyDown.js";
import {
    ICustomGridOptions,
    TableAgGridCallbacks,
    TableConfigAccessors,
    TableMenuCallbacks,
} from "./privateTypes.js";
import { MIN_WIDTH } from "./resizing/columnSizing.js";
import { headerClassFactory } from "./structure/colDefHeaderClass.js";
import {
    columnAttributeTemplate,
    measureColumnTemplate,
    mixedHeadersTemplate,
    mixedValuesColsTemplate,
    rowAttributeTemplate,
    rowMeasureTemplate,
    totalSubTotalColumnTemplate,
} from "./structure/colDefTemplates.js";
import ColumnGroupHeader from "./structure/headers/ColumnGroupHeader.js";
import ColumnHeader from "./structure/headers/ColumnHeader.js";
import { ICommonHeaderParams } from "./structure/headers/HeaderCell.js";
import { TableFacade } from "./tableFacade.js";
import { ICorePivotTableProps } from "../publicTypes.js";

class NoTooltip {
    init() {}
    getGui() {
        return document.createElement("span");
    }
}

export function createGridOptions(
    table: TableFacade,
    tableMethods: TableAgGridCallbacks & TableConfigAccessors & TableMenuCallbacks,
    props: Readonly<ICorePivotTableProps>,
): ICustomGridOptions {
    const { colDefs } = table.tableDescriptor;
    const { pageSize } = props;
    const totalRowCount = table.getRowCount();

    const allColumnDefs = colDefs.sliceColDefs.concat(colDefs.rootDataColDefs);

    /*
     * This is a half-workaround around the visual weirdness where upon load/sort ag-grid renders full
     * page of empty rows and then possibly shrinks back to the actual size of data obtained from backend.
     *
     * since the code knows total count of all data on all pages already, it is possible to set the effective
     * page size to minimum of the requested page size and the total of all data => thus eliminating this
     * effect.
     *
     * the only dumb thing about this approach is that dynamically added subtotals (via menu) kick this
     * slightly out of balance as extra rows get added and ag-grid needs to load additional pages... and so an
     * extra buffer of couple of rows in case it is possible add subtotals. while there will be some expanding
     * and shrinking, it will not be so big.
     */
    const extraTotalsBuffer = props.config?.menu ? 10 : 0;
    const effectivePageSize = Math.min(pageSize!, totalRowCount + extraTotalsBuffer);

    const commonHeaderComponentParams: ICommonHeaderParams = {
        onMenuAggregationClick: tableMethods.onMenuAggregationClick,
        getTableDescriptor: () => table.tableDescriptor,
        getExecutionDefinition: tableMethods.getExecutionDefinition,
        getColumnTotals: tableMethods.getColumnTotals,
        getRowTotals: tableMethods.getRowTotals,
        intl: props.intl,
        setLastSortedColId: tableMethods.setLastSortedColId,
    };

    // For column headers on left and metrics in rows, all headers are rendered inside regular table cells, therefore complete ag-grid headers are hidden with headerHeight: 0
    const hideEmptyHeader =
        tableMethods.getColumnHeadersPosition() === "left" && table.tableDescriptor.isTransposed();

    return {
        // Initial data
        components: {
            tooltipComponent: NoTooltip,
        },
        columnDefs: allColumnDefs,
        defaultColDef: {
            cellClass: cellClassFactory(table, props),
            headerComponent: ColumnHeader,
            tooltipComponent: NoTooltip,
            headerComponentParams: {
                menu: tableMethods.getMenuConfig,
                enableSorting: true,
                ...commonHeaderComponentParams,
            },
            minWidth: MIN_WIDTH,
            sortable: true,
            resizable: true,
            // Suppress AG Grid header menus to prevent leakage from PivotTableNext's enterprise modules
            suppressHeaderMenuButton: true,
            suppressHeaderFilterButton: true,
            suppressHeaderContextMenu: true,
        },
        defaultColGroupDef: {
            headerClass: headerClassFactory(table, props),
            children: [],
            headerGroupComponent: ColumnGroupHeader,
            headerGroupComponentParams: {
                menu: tableMethods.getMenuConfig,
                ...commonHeaderComponentParams,
            },
        },
        onCellClicked: onCellClickedFactory(table, props),
        onCellKeyDown: onCellKeyDownFactory(table, props),
        onSortChanged: tableMethods.onSortChanged,
        onColumnResized: tableMethods.onGridColumnResized,
        onGridColumnsChanged: tableMethods.onGridColumnsChanged,
        onModelUpdated: tableMethods.onModelUpdated,
        onPinnedRowDataChanged: tableMethods.onPinnedRowDataChanged,

        focusGridInnerElement: (params: FocusGridInnerElementParams) => {
            // Don't set focused header when table is transposed with headers on left (no header cells to focus)
            const isTransposedWithNoHeaders =
                tableMethods.getColumnHeadersPosition() === "left" && table.tableDescriptor.isTransposed();
            const firstColumn = params.api.getAllDisplayedColumns()[0];

            if (isTransposedWithNoHeaders) {
                params.api.setFocusedCell(0, firstColumn.getId());
            } else {
                params.api.setFocusedHeader(firstColumn.getId());
            }

            return true;
        },
        // fallback of Tab key to browser default
        tabToNextHeader: () => {
            return false;
        },
        tabToNextCell: () => {
            return false;
        },

        // Basic options
        suppressMovableColumns: true,
        suppressCellFocus: false,
        suppressHeaderFocus: false,
        suppressAutoSize: tableMethods.hasColumnWidths,
        // Suppress AG Grid menus to prevent leakage from PivotTableNext's enterprise modules
        suppressContextMenu: true,

        // infinite scrolling model
        rowModelType: "infinite",

        paginationPageSize: effectivePageSize,
        cacheOverflowSize: effectivePageSize,
        cacheBlockSize: effectivePageSize,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: effectivePageSize,
        maxBlocksInCache: 10,
        onGridReady: tableMethods.onGridReady,
        onFirstDataRendered: tableMethods.onFirstDataRendered,
        onBodyScroll: tableMethods.onBodyScroll,
        onGridSizeChanged: tableMethods.onGridSizeChanged,

        // Column types
        columnTypes: {
            [ROW_ATTRIBUTE_COLUMN]: rowAttributeTemplate(table, props),
            [COLUMN_ATTRIBUTE_COLUMN]: columnAttributeTemplate(table, props),
            [MEASURE_COLUMN]: measureColumnTemplate(table, props),
            [ROW_MEASURE_COLUMN]: rowMeasureTemplate(table, props),
            [MIXED_VALUES_COLUMN]: mixedValuesColsTemplate(table, props),
            [MIXED_HEADERS_COLUMN]: mixedHeadersTemplate(table, props),
            [COLUMN_TOTAL]: totalSubTotalColumnTemplate(table, props),
            [COLUMN_SUBTOTAL]: totalSubTotalColumnTemplate(table, props),
        },

        // Custom CSS classes
        rowClass: "gd-table-row",
        rowHeight: DEFAULT_ROW_HEIGHT,
        autoSizePadding: DEFAULT_AUTOSIZE_PADDING,

        headerHeight: hideEmptyHeader ? 0 : undefined,
    };
}
