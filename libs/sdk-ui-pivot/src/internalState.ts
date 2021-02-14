// (C) 2007-2021 GoodData Corporation
import { TableDescriptor } from "./impl/structure/tableDescriptor";
import { IDataView, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    createExportFunction,
    DataViewFacade,
    IAvailableDrillTargets,
    IExportFunction,
} from "@gooddata/sdk-ui";
import {
    AUTO_SIZED_MAX_WIDTH,
    autoresizeAllColumns,
    getAutoResizedColumns,
    isColumnAutoResized,
    MANUALLY_SIZED_MAX_WIDTH,
    resetColumnsWidthToDefault,
    resizeAllMeasuresColumns,
    ResizedColumnsStore,
    resizeWeakMeasureColumns,
    syncSuppressSizeToFitOnColumns,
    updateColumnDefinitionsWithWidths,
} from "./impl/resizing/agGridColumnSizing";
import { ColumnWidthItem, IResizedColumns, UIClick } from "./columnWidths";
import { AgGridDatasource, createAgGridDatasource } from "./impl/data/dataSource";
import { Column, ColumnApi, GridApi } from "@ag-grid-community/all-modules";
import { defFingerprint, ISortItem, ITotal } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { IntlShape } from "react-intl";
import { fixEmptyHeaderItems } from "@gooddata/sdk-ui-vis-commons";
import { setColumnMaxWidth, setColumnMaxWidthIf } from "./impl/base/agGridColumnWrapper";
import { agColIds, isMeasureColumn } from "./impl/base/agGridUtils";
import { agColId } from "./impl/structure/tableDescriptorTypes";
import { sleep } from "./impl/utils";
import { ISeparators } from "@gooddata/numberjs";
import { ColumnResizedCallback } from "./types";
import { DEFAULT_AUTOSIZE_PADDING, DEFAULT_ROW_HEIGHT } from "./impl/base/constants";
import { getAvailableDrillTargets } from "./impl/drilling/drillTargets";
import { IGroupingProvider } from "./impl/data/rowGroupingProvider";
import sumBy from "lodash/sumBy";
import ApiWrapper from "./impl/base/agGridApiWrapper";
import {
    initializeStickyRow,
    IScrollPosition,
    stickyRowExists,
    updateStickyRowContentClassesAndData,
    updateStickyRowPosition,
} from "./impl/stickyRowHandler";

const HEADER_CELL_BORDER = 1;
const COLUMN_RESIZE_TIMEOUT = 300;

export type DataSourceOptions = {
    getGroupRows: () => boolean;
    getColumnTotals: () => ITotal[];
    onPageLoaded: (dv: DataViewFacade, newResult: boolean) => void;
};

export type ColumnResizingContext = {
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

export type StickyRowContext = {
    scrollPosition: IScrollPosition;
    lastScrollPosition: IScrollPosition;
};

export class InternalTableState {
    public readonly tableDescriptor: TableDescriptor;
    private readonly intl: IntlShape;

    private currentResult: IExecutionResult;
    private visibleData: DataViewFacade;
    private currentFingerprint: string;
    private resizedColumnsStore: ResizedColumnsStore;
    private autoResizedColumns: IResizedColumns;
    private growToFittedColumns: IResizedColumns;
    private resizing: boolean;
    private numberOfColumnResizedCalls: number;
    private agGridDataSource: AgGridDatasource;
    private gridApi: GridApi | undefined;
    private columnApi: ColumnApi | undefined;

    private onPageLoadedCallback: ((dv: DataViewFacade, newResult: boolean) => void) | undefined;

    constructor(result: IExecutionResult, dataView: IDataView, intl: IntlShape) {
        this.intl = intl;

        this.autoResizedColumns = {};
        this.growToFittedColumns = {};
        this.resizing = false;
        this.resizedColumnsStore = new ResizedColumnsStore();

        this.currentResult = result;
        this.fixEmptyHeaders(dataView);
        this.visibleData = DataViewFacade.for(dataView);
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        /*
         * Initialize table headers from first page of data, then update the initialized
         * headers according to column sizing rules.
         *
         * NOTE: it would be better to have this all orchestrated in a single call.
         */
        this.tableDescriptor = TableDescriptor.for(this.visibleData);
    }

    public finishInitialization = (gridApi: GridApi, columnApi: ColumnApi): void => {
        invariant(this.gridApi === undefined);
        invariant(this.agGridDataSource);

        this.gridApi = gridApi;
        this.columnApi = columnApi;
        this.gridApi.setDatasource(this.agGridDataSource);
    };

    public refreshData = (): void => {
        invariant(this.gridApi);

        // make ag-grid refresh data
        // see: https://www.ag-grid.com/javascript-grid-infinite-scrolling/#changing-the-datasource
        this.gridApi.setDatasource(this.agGridDataSource);
    };

    public isFullyInitialized = (): boolean => {
        return this.gridApi !== undefined;
    };

    public clearFittedColumns = (): void => {
        this.growToFittedColumns = {};
    };

    public updateColumnWidths = (resizingCtx: ColumnResizingContext): void => {
        this.resizedColumnsStore.updateColumnWidths(this.tableDescriptor, resizingCtx.widths);

        updateColumnDefinitionsWithWidths(
            this.tableDescriptor,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            resizingCtx.defaultWidth,
            resizingCtx.growToFit,
            this.growToFittedColumns,
        );
    };

    public createDataSource = (options: DataSourceOptions): AgGridDatasource => {
        this.onPageLoadedCallback = options.onPageLoaded;

        this.agGridDataSource = createAgGridDatasource(
            {
                tableDescriptor: this.tableDescriptor,
                getGroupRows: options.getGroupRows,
                getColumnTotals: options.getColumnTotals,
                onPageLoaded: this.onPageLoaded,
                dataViewTransform: (dataView) => {
                    this.fixEmptyHeaders(dataView);
                    return dataView;
                },
            },
            this.visibleData,
            () => this.gridApi,
            this.intl,
        );

        return this.agGridDataSource;
    };

    private onPageLoaded = (dv: DataViewFacade): void => {
        const oldResult = this.currentResult;
        this.currentResult = dv.result();
        this.visibleData = dv;
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        this.onPageLoadedCallback?.(dv, !oldResult?.equals(this.currentResult));
    };

    public createExportFunction = (title: string | undefined): IExportFunction => {
        return createExportFunction(this.currentResult, title);
    };

    public getAvailableDrillTargets = (): IAvailableDrillTargets => {
        return getAvailableDrillTargets(this.visibleData);
    };

    public refreshHeader = (): void => {
        this.gridApi?.refreshHeader();
    };

    public growToFit = (resizingCtx: ColumnResizingContext): void => {
        invariant(this.gridApi);
        invariant(this.columnApi);

        const columns = this.columnApi.getAllColumns();
        this.resetColumnsWidthToDefault(resizingCtx, columns);
        this.clearFittedColumns();

        const widths = columns.map((column) => column.getActualWidth());
        const sumOfWidths = widths.reduce((a, b) => a + b, 0);

        if (sumOfWidths < resizingCtx.clientWidth) {
            const columnIds = agColIds(columns);

            setColumnMaxWidth(this.columnApi, columnIds, undefined);
            this.gridApi?.sizeColumnsToFit();
            setColumnMaxWidthIf(
                this.columnApi,
                columnIds,
                MANUALLY_SIZED_MAX_WIDTH,
                (column: Column) => column.getActualWidth() <= MANUALLY_SIZED_MAX_WIDTH,
            );
            this.setFittedColumns();
        }
    };

    private fixEmptyHeaders = (dataView: IDataView): void => {
        fixEmptyHeaderItems(dataView, `(${this.intl.formatMessage({ id: "visualization.emptyValue" })})`);
    };

    private setFittedColumns = () => {
        invariant(this.columnApi);

        const columns = this.columnApi.getAllColumns();

        columns.forEach((col) => {
            const id = agColId(col);

            this.growToFittedColumns[id] = {
                width: col.getActualWidth(),
            };
        });
    };

    public resetColumnsWidthToDefault = (resizingCtx: ColumnResizingContext, columns: Column[]): void => {
        invariant(this.columnApi);

        resetColumnsWidthToDefault(
            this.tableDescriptor,
            this.columnApi,
            columns,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            resizingCtx.defaultWidth,
        );
    };

    public applyColumnSizes = (resizingCtx: ColumnResizingContext): void => {
        invariant(this.columnApi);

        this.resizedColumnsStore.updateColumnWidths(this.tableDescriptor, resizingCtx.widths);

        syncSuppressSizeToFitOnColumns(this.tableDescriptor, this.resizedColumnsStore, this.columnApi);

        if (resizingCtx.growToFit) {
            this.growToFit(resizingCtx); // calls resetColumnsWidthToDefault internally too
        } else {
            const columns = this.columnApi.getAllColumns();
            this.resetColumnsWidthToDefault(resizingCtx, columns);
        }
    };

    public autoresizeColumns = async (
        resizingCtx: ColumnResizingContext,
        force: boolean = false,
    ): Promise<boolean> => {
        invariant(this.gridApi);
        invariant(this.columnApi);

        if (this.resizing && !force) {
            return false;
        }

        const alreadyResized = () => this.resizing;

        if (this.isPivotTableReady() && (!alreadyResized() || (alreadyResized() && force))) {
            this.resizing = true;
            // we need to know autosize width for each column, even manually resized ones, to support removal of columnWidth def from props
            await this.autoresizeAllColumns(resizingCtx);

            // after that we need to reset manually resized columns back to its manually set width by growToFit or by helper. See UT resetColumnsWidthToDefault for width priorities
            if (resizingCtx.growToFit) {
                this.growToFit(resizingCtx);
            } else if (resizingCtx.columnAutoresizeEnabled && this.shouldPerformAutoresize()) {
                const columns = this.columnApi!.getAllColumns();
                this.resetColumnsWidthToDefault(resizingCtx, columns);
            }
            this.resizing = false;

            return true;
        }

        return false;
    };

    private autoresizeAllColumns = async (resizingCtx: ColumnResizingContext) => {
        invariant(this.gridApi);
        invariant(this.columnApi);

        if (!this.shouldPerformAutoresize() || !resizingCtx.columnAutoresizeEnabled) {
            return Promise.resolve();
        }

        await sleep(COLUMN_RESIZE_TIMEOUT);

        /*
         * Ensures correct autoResizeColumns
         */
        this.updateAutoResizedColumns(resizingCtx);
        autoresizeAllColumns(this.columnApi, this.autoResizedColumns);
    };

    private updateAutoResizedColumns = (resizingCtx: ColumnResizingContext): void => {
        invariant(this.gridApi);
        invariant(this.columnApi);
        invariant(resizingCtx.containerRef);

        this.autoResizedColumns = getAutoResizedColumns(
            this.tableDescriptor,
            this.gridApi,
            this.columnApi,
            this.currentResult,
            resizingCtx.containerRef,
            {
                measureHeaders: true,
                padding: 2 * DEFAULT_AUTOSIZE_PADDING + HEADER_CELL_BORDER,
                separators: resizingCtx.separators,
            },
        );
    };

    public isPivotTableReady = (): boolean => {
        if (!this.gridApi) {
            return false;
        }

        const api = this.gridApi;

        const noRowHeadersOrRows = () => {
            return Boolean(
                this.visibleData.rawData().isEmpty() && this.visibleData.meta().hasNoHeadersInDim(0),
            );
        };
        const dataRendered = () => {
            return noRowHeadersOrRows() || api.getRenderedNodes().length > 0;
        };
        const tablePagesLoaded = () => {
            const pages = api.getCacheBlockState();
            return (
                pages &&
                Object.keys(pages).every(
                    (pageId: string) =>
                        pages[pageId].pageStatus === "loaded" || pages[pageId].pageStatus === "failed",
                )
            );
        };

        return tablePagesLoaded() && dataRendered();
    };

    private shouldPerformAutoresize = (): boolean => {
        if (!this.gridApi) {
            /*
             * This is here because of the various timeouts involved in pivot table rendering. Before code
             * gets here, the table may be in a re-init stage
             */
            return false;
        }

        const horizontalPixelRange = this.gridApi.getHorizontalPixelRange();
        const verticalPixelRange = this.gridApi.getVerticalPixelRange();

        return horizontalPixelRange.left === 0 && verticalPixelRange.top === 0;
    };

    private isColumnAutoResized = (resizedColumnId: string) => {
        return isColumnAutoResized(this.autoResizedColumns, resizedColumnId);
    };

    public resetResizedColumn = async (column: Column): Promise<void> => {
        if (!this.tableDescriptor) {
            return;
        }

        const id = agColId(column);

        if (this.resizedColumnsStore.isColumnManuallyResized(this.tableDescriptor, column)) {
            this.resizedColumnsStore.removeFromManuallyResizedColumn(this.tableDescriptor, column);
        }

        column.getColDef().suppressSizeToFit = false;

        if (this.isColumnAutoResized(id)) {
            this.columnApi?.setColumnWidth(column, this.autoResizedColumns[id].width);
            return;
        }

        this.autoresizeColumnsByColumnId(this.columnApi!, agColIds([column]));
        this.resizedColumnsStore.addToManuallyResizedColumn(column, true);
    };

    private autoresizeColumnsByColumnId = (columnApi: ColumnApi, columnIds: string[]) => {
        setColumnMaxWidth(columnApi, columnIds, AUTO_SIZED_MAX_WIDTH);

        columnApi.autoSizeColumns(columnIds);

        setColumnMaxWidth(columnApi, columnIds, MANUALLY_SIZED_MAX_WIDTH);
    };

    public onColumnsManualReset = async (
        resizingCtx: ColumnResizingContext,
        columns: Column[],
    ): Promise<void> => {
        invariant(this.gridApi);
        invariant(this.columnApi);

        let columnsToReset = columns;

        /*
         * Ensures that all columns have the correct width to use during column reset
         * resetResizedColumn uses updateAutoResizedColumns to properly reset columns
         */
        if (!Object.keys(this.autoResizedColumns).length) {
            this.updateAutoResizedColumns(resizingCtx);
        }

        if (this.isAllMeasureResizeOperation(resizingCtx, columns)) {
            this.resizedColumnsStore.removeAllMeasureColumns();
            columnsToReset = this.getAllMeasureColumns();
        }

        if (this.isWeakMeasureResizeOperation(resizingCtx, columns)) {
            columnsToReset = this.resizedColumnsStore.getMatchingColumnsByMeasure(
                this.tableDescriptor,
                columns[0],
                this.getAllMeasureColumns(),
            );
            this.resizedColumnsStore.removeWeakMeasureColumn(this.tableDescriptor, columns[0]);
        }

        for (const column of columnsToReset) {
            await this.resetResizedColumn(column);
        }

        this.afterOnResizeColumns(resizingCtx);
    };

    private getAllMeasureColumns = () => {
        invariant(this.columnApi);
        return this.columnApi.getAllColumns().filter((col) => isMeasureColumn(col));
    };

    private isAllMeasureResizeOperation(resizingCtx: ColumnResizingContext, columns: Column[]): boolean {
        return resizingCtx.isMetaOrCtrlKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    private isWeakMeasureResizeOperation(resizingCtx: ColumnResizingContext, columns: Column[]): boolean {
        return resizingCtx.isAltKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    public onColumnsManualResized = (resizingCtx: ColumnResizingContext, columns: Column[]): void => {
        if (this.isAllMeasureResizeOperation(resizingCtx, columns)) {
            resizeAllMeasuresColumns(this.columnApi!, this.resizedColumnsStore, columns[0]);
        } else if (this.isWeakMeasureResizeOperation(resizingCtx, columns)) {
            resizeWeakMeasureColumns(
                this.tableDescriptor!,
                this.columnApi!,
                this.resizedColumnsStore,
                columns[0],
            );
        } else {
            columns.forEach((column) => {
                this.resizedColumnsStore.addToManuallyResizedColumn(column);
            });
        }

        this.afterOnResizeColumns(resizingCtx);
    };

    public onManualColumnResize = async (
        resizingCtx: ColumnResizingContext,
        columns: Column[],
    ): Promise<void> => {
        this.numberOfColumnResizedCalls++;
        await sleep(COLUMN_RESIZE_TIMEOUT);

        if (this.numberOfColumnResizedCalls === UIClick.DOUBLE_CLICK) {
            this.numberOfColumnResizedCalls = 0;
            await this.onColumnsManualReset(resizingCtx, columns);
        } else if (this.numberOfColumnResizedCalls === UIClick.CLICK) {
            this.numberOfColumnResizedCalls = 0;
            this.onColumnsManualResized(resizingCtx, columns);
        }
    };

    private afterOnResizeColumns = (resizingCtx: ColumnResizingContext) => {
        this.growToFit(resizingCtx);
        const columnWidths = this.resizedColumnsStore.getColumnWidthsFromMap(this.tableDescriptor!);

        resizingCtx.onColumnResized?.(columnWidths);
    };

    public getGroupingProvider = (): IGroupingProvider => {
        invariant(this.agGridDataSource);

        return this.agGridDataSource.getGroupingProvider();
    };

    public createSortItems = (columns: Column[]): ISortItem[] => {
        return this.tableDescriptor.createSortItems(columns, this.currentResult.definition.sortBy);
    };

    public isMatchingExecution(other: IPreparedExecution): boolean {
        return this.currentFingerprint === other.fingerprint();
    }

    public getTotalBodyHeight = (): number => {
        const dv = this.visibleData;
        const aggregationCount = sumBy(dv.rawData().totals(), (total) => total.length);
        const rowCount = dv.rawData().firstDimSize();

        const headerHeight = ApiWrapper.getHeaderHeight(this.gridApi!);

        // add small room for error to avoid scrollbars that scroll one, two pixels
        // increased in order to resolve issue BB-1509
        const leeway = 2;

        const bodyHeight = rowCount * DEFAULT_ROW_HEIGHT + leeway;
        const footerHeight = aggregationCount * DEFAULT_ROW_HEIGHT;

        return headerHeight + bodyHeight + footerHeight;
    };

    public updateStickyRowContent = (stickyCtx: StickyRowContext): void => {
        invariant(this.gridApi);

        updateStickyRowContentClassesAndData(
            stickyCtx.scrollPosition,
            stickyCtx.lastScrollPosition,
            DEFAULT_ROW_HEIGHT,
            this.gridApi,
            this.getGroupingProvider(),
            ApiWrapper,
        );
    };

    public updateStickyRowPosition = (): void => {
        invariant(this.gridApi);

        updateStickyRowPosition(this.gridApi);
    };

    public initializeStickyRow = (): void => {
        invariant(this.gridApi);

        initializeStickyRow(this.gridApi);
    };

    public stickyRowExists = (): boolean => {
        if (!this.gridApi) {
            return false;
        }

        return stickyRowExists(this.gridApi);
    };

    public getRowCount = (): number => {
        return this.visibleData.rawData().firstDimSize();
    };

    public getDrillDataContext = (): DataViewFacade => {
        return this.visibleData;
    };

    public isResizing = (): boolean => {
        return this.resizing;
    };
}
