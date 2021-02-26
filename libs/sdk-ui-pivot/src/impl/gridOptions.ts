// (C) 2007-2021 GoodData Corporation
import { ICustomGridOptions, TableConfig } from "./privateTypes";
import { ICommonHeaderParams } from "./structure/headers/HeaderCell";
import { cellClassFactory } from "./cell/cellClass";
import ColumnHeader from "./structure/headers/ColumnHeader";
import { MIN_WIDTH } from "./resizing/columnSizing";
import { headerClassFactory } from "./structure/colDefHeaderClass";
import ColumnGroupHeader from "./structure/headers/ColumnGroupHeader";
import { onCellClickedFactory } from "./cell/onCellClick";
import {
    COLUMN_ATTRIBUTE_COLUMN,
    DEFAULT_AUTOSIZE_PADDING,
    DEFAULT_ROW_HEIGHT,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
} from "./base/constants";
import {
    columnAttributeTemplate,
    measureColumnTemplate,
    rowAttributeTemplate,
} from "./structure/colDefTemplates";
import { RowLoadingElement } from "./data/RowLoadingElement";
import { TableFacade } from "./tableFacade";
import { ICorePivotTableProps } from "../publicTypes";

export function createGridOptions(
    table: TableFacade,
    config: TableConfig,
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
    const extraTotalsBuffer = props.config && props.config.menu ? 10 : 0;
    const effectivePageSize = Math.min(pageSize!, totalRowCount + extraTotalsBuffer);

    const commonHeaderComponentParams: ICommonHeaderParams = {
        onMenuAggregationClick: config.onMenuAggregationClick,
        getTableDescriptor: () => table.tableDescriptor,
        getExecutionDefinition: config.getExecutionDefinition,
        getColumnTotals: config.getColumnTotals,
        intl: props.intl,
    };

    return {
        // Initial data
        columnDefs: allColumnDefs,
        rowData: [],
        defaultColDef: {
            cellClass: cellClassFactory(table, props),
            headerComponentFramework: ColumnHeader as any,
            headerComponentParams: {
                menu: config.getMenuConfig,
                enableSorting: true,
                ...commonHeaderComponentParams,
            },
            minWidth: MIN_WIDTH,
            sortable: true,
            resizable: true,
        },
        defaultColGroupDef: {
            headerClass: headerClassFactory(table, props),
            children: [],
            headerGroupComponentFramework: ColumnGroupHeader as any,
            headerGroupComponentParams: {
                menu: config.getMenuConfig,
                ...commonHeaderComponentParams,
            },
        },
        onCellClicked: onCellClickedFactory(table, props),
        onSortChanged: config.onSortChanged,
        onColumnResized: config.onGridColumnResized,
        onGridColumnsChanged: config.onGridColumnsChanged,
        onModelUpdated: config.onModelUpdated,

        // Basic options
        suppressMovableColumns: true,
        suppressCellSelection: true,
        suppressAutoSize: config.hasColumnWidths,
        enableFilter: false,

        // infinite scrolling model
        rowModelType: "infinite",
        paginationPageSize: effectivePageSize,
        cacheOverflowSize: effectivePageSize,
        cacheBlockSize: effectivePageSize,
        maxConcurrentDatasourceRequests: 1,
        infiniteInitialRowCount: effectivePageSize,
        maxBlocksInCache: 10,
        onGridReady: config.onGridReady,
        onFirstDataRendered: config.onFirstDataRendered,
        onBodyScroll: config.onBodyScroll,
        onGridSizeChanged: config.onGridSizeChanged,

        // Column types
        columnTypes: {
            [ROW_ATTRIBUTE_COLUMN]: rowAttributeTemplate(table, props),
            [COLUMN_ATTRIBUTE_COLUMN]: columnAttributeTemplate(table, props),
            [MEASURE_COLUMN]: measureColumnTemplate(table, props),
        },

        // Custom renderers
        frameworkComponents: {
            // any is needed here because of incompatible types with AgGridReact types
            loadingRenderer: RowLoadingElement as any, // loading indicator
        },

        // Custom CSS classes
        rowClass: "gd-table-row",
        rowHeight: DEFAULT_ROW_HEIGHT,
        autoSizePadding: DEFAULT_AUTOSIZE_PADDING,
    };
}
