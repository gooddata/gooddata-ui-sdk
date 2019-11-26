// (C) 2007-2019 GoodData Corporation
import { DataViewFacade, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { ITotal, SortDirection, defFingerprint, defTotals } from "@gooddata/sdk-model";
import {
    BodyScrollEvent,
    ColumnResizedEvent,
    GridApi,
    GridReadyEvent,
    IDatasource,
    SortChangedEvent,
} from "ag-grid-community";
import { CellClassParams } from "ag-grid-community/dist/lib/entities/colDef";
import { AgGridReact } from "ag-grid-react";
import * as classNames from "classnames";
import * as CustomEvent from "custom-event";
import * as React from "react";

import "../../styles/css/pivotTable.css";
import { VisualizationTypes } from "../base/constants/visualizationTypes";
import { getScrollbarWidth } from "../base/helpers/domUtils";
import { convertDrillableItemsToPredicates, isSomeHeaderPredicateMatched } from "../base/helpers/drilling";
import { IDrillEvent, IDrillEventContextTable } from "../base/interfaces/DrillEvents";
import { IHeaderPredicate } from "../base/interfaces/HeaderPredicate";
import { IMappingHeader } from "../base/interfaces/MappingHeader";
import { ErrorComponent } from "../base/simple/ErrorComponent";
import { LoadingComponent } from "../base/simple/LoadingComponent";
import { getUpdatedColumnTotals } from "./impl/aggregationsMenuHelper";
import ApiWrapper from "./impl/agGridApiWrapper";
import {
    AVAILABLE_TOTALS,
    COLS_PER_PAGE,
    COLUMN_ATTRIBUTE_COLUMN,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
    ROW_SUBTOTAL,
    ROW_TOTAL,
} from "./impl/agGridConst";
import { AgGridDatasource, createAgGridDatasource } from "./impl/agGridDataSource";
import { getDrillIntersection, getDrillRowData } from "./impl/agGridDrilling";
import { createTableHeaders } from "./impl/agGridHeaders";
import { getSortsFromModel } from "./impl/agGridSorting";
import {
    ICustomGridOptions,
    IGridCellEvent,
    IGridHeader,
    ISortModelItem,
    TableHeaders,
} from "./impl/agGridTypes";
import {
    cellRenderer,
    generateAgGridComponentKey,
    getMeasureFormat,
    getRowNodeId,
    getTreeLeaves,
    indexOfTreeNode,
} from "./impl/agGridUtils";
import ColumnGroupHeader from "./impl/ColumnGroupHeader";
import ColumnHeader from "./impl/ColumnHeader";
import { IGroupingProvider } from "./impl/GroupingProvider";
import { RowLoadingElement } from "./impl/RowLoadingElement";
import {
    initializeStickyRow,
    IScrollPosition,
    stickyRowExists,
    updateStickyRowContentClasses,
    updateStickyRowPosition,
} from "./impl/stickyRowHandler";

import { getCellClassNames, getMeasureCellFormattedValue, getMeasureCellStyle } from "./impl/tableCell";

import { ICorePivotTableProps, IMenuAggregationClickConfig } from "./types";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import sumBy = require("lodash/sumBy");

export interface ICorePivotTableState {
    tableReady: boolean;
    columnTotals: ITotal[];
    agGridRerenderNumber: number;
    desiredHeight: number | undefined;
}

const DEFAULT_ROW_HEIGHT = 28;
const AG_NUMERIC_CELL_CLASSNAME = "ag-numeric-cell";
const AG_NUMERIC_HEADER_CLASSNAME = "ag-numeric-header";

export const WATCHING_TABLE_RENDERED_INTERVAL = 500;
export const WATCHING_TABLE_RENDERED_MAX_TIME = 15000;

/**
 * Pivot Table react component
 *
 * @internal
 */
export class CorePivotTable extends React.Component<ICorePivotTableProps, ICorePivotTableState> {
    public static defaultProps: Partial<ICorePivotTableProps> = {
        locale: "en-US",
        drillableItems: [],
        afterRender: noop,
        pushData: noop,
        onExportReady: noop,
        onLoadingChanged: noop,
        onDrill: () => true,
        ErrorComponent,
        LoadingComponent,
        pageSize: 100,
        config: {},
        groupRows: true,
    };

    private containerRef: HTMLDivElement;

    private unmounted: boolean = false;

    private gridApi: GridApi = null;
    private gridOptions: ICustomGridOptions = null;
    private tableHeaders: TableHeaders = null;
    private agGridDataSource: AgGridDatasource = null;

    private currentResult: IExecutionResult = null;
    private visibleData: DataViewFacade = null;
    private currentFingerprint: string = null;

    private lastScrollPosition: IScrollPosition = {
        top: 0,
        left: 0,
    };

    private watchingIntervalId: number | null;
    private watchingTimeoutId: number | null;

    constructor(props: ICorePivotTableProps) {
        super(props);

        const { execution, config } = props;

        this.state = {
            tableReady: false,
            columnTotals: cloneDeep(defTotals(execution.definition, 0)),
            agGridRerenderNumber: 1,
            desiredHeight: config.maxHeight,
        };
    }

    private reinitialize = (execution: IPreparedExecution): void => {
        this.setState(
            {
                tableReady: false,
            },
            () => {
                this.gridApi = null;
                this.gridOptions = null;
                this.tableHeaders = null;
                this.agGridDataSource = null;
                this.currentResult = null;
                this.visibleData = null;
                this.currentFingerprint = null;

                this.initialize(execution);
            },
        );
    };

    private initialize(execution: IPreparedExecution): void {
        execution.execute().then(result => {
            result.readWindow([0, 0], [this.props.pageSize, COLS_PER_PAGE]).then(dataView => {
                if (this.unmounted) {
                    /*
                     * Stop right now if the component gets unmounted while it is still being
                     * initialized.
                     */
                    return;
                }

                this.tableHeaders = createTableHeaders(dataView);
                this.currentResult = result;
                this.visibleData = new DataViewFacade(dataView);
                this.currentFingerprint = defFingerprint(this.currentResult.definition);

                this.agGridDataSource = createAgGridDatasource(
                    {
                        headers: this.tableHeaders,
                        getGroupRows: () => this.props.groupRows,
                        getColumnTotals: this.getColumnTotals,
                        onPageLoaded: this.onPageLoaded,
                    },
                    this.visibleData,
                    this.getGridApi,
                    this.props.intl,
                );

                this.setGridDataSource(this.agGridDataSource);

                this.props.onExportReady(this.currentResult.export.bind(this.currentResult));
                this.setState({ tableReady: true });
            });
        });
    }

    public componentDidMount() {
        if (this.containerRef) {
            this.containerRef.addEventListener("mousedown", this.preventHeaderResizerEvents);
        }

        this.initialize(this.props.execution);
    }

    public componentWillUnmount() {
        if (this.containerRef) {
            this.containerRef.removeEventListener("mousedown", this.preventHeaderResizerEvents);
        }

        this.unmounted = true;
    }

    public componentDidUpdate(prevProps: ICorePivotTableProps) {
        if (this.isReinitNeeded(prevProps)) {
            this.reinitialize(this.props.execution);
        }

        if (this.isAgGridRerenderNeeded(this.props, prevProps)) {
            this.forceRerender();
        }
    }

    public render() {
        const { LoadingComponent, execution } = this.props;
        const { desiredHeight } = this.state;

        if (this.isTableHidden()) {
            return <LoadingComponent />;
        }

        const style: React.CSSProperties = {
            height: desiredHeight || "100%",
            position: "relative",
            overflow: "hidden",
        };

        if (!this.gridOptions) {
            this.gridOptions = this.createGridOptions();
        }

        return (
            <div className="gd-table-component" style={style}>
                <div
                    className="gd-table ag-theme-balham s-pivot-table"
                    style={style}
                    ref={this.setContainerRef}
                >
                    <AgGridReact
                        {...this.gridOptions}
                        // To force Ag grid rerender because AFAIK there is no way
                        // to tell Ag grid header cell to rerender
                        key={generateAgGridComponentKey(
                            execution.definition,
                            this.state.agGridRerenderNumber,
                        )}
                    />
                </div>
            </div>
        );
    }

    //
    //
    //

    private isTableHidden() {
        return !this.state.tableReady;
    }

    /**
     * Tests whether reinitialization of ag-grid is needed after the update. Currently there are two
     * conditions:
     *
     * - drilling has changed
     *
     * OR
     *
     * - prepared execution has changed AND the new prep execution definition does not match currently shown
     *   data.
     *
     * @param prevProps
     */
    private isReinitNeeded(prevProps: ICorePivotTableProps): boolean {
        const drillingIsSame = prevProps.drillableItems === this.props.drillableItems;

        if (!drillingIsSame) {
            return true;
        }

        const prepExecutionSame = this.props.execution.equals(prevProps.execution);
        const fingerprintSame = this.currentFingerprint === this.props.execution.fingerprint();

        return !prepExecutionSame && !fingerprintSame;
    }

    private forceRerender() {
        this.setState(state => ({
            agGridRerenderNumber: state.agGridRerenderNumber + 1,
        }));
    }

    //
    // getters / setters / manipulators
    //

    private setContainerRef = (container: HTMLDivElement): void => {
        this.containerRef = container;
    };

    private getColumnTotals = () => {
        return this.state.columnTotals;
    };

    private getDataView = () => {
        return this.visibleData;
    };

    private getGridApi = () => this.gridApi;

    //
    // working with data source
    //

    private isAgGridRerenderNeeded(props: ICorePivotTableProps, prevProps: ICorePivotTableProps): boolean {
        const propsRequiringAgGridRerender = [["config", "menu"]];
        return propsRequiringAgGridRerender.some(
            propKey => !isEqual(get(props, propKey), get(prevProps, propKey)),
        );
    }

    private setGridDataSource(dataSource: IDatasource) {
        if (this.gridApi) {
            this.gridApi.setDatasource(dataSource);
        }
    }

    //
    // event handlers - internal & funny stuff
    //

    private onPageLoaded = (dv: DataViewFacade): void => {
        const currentResult = dv.result();
        if (!this.currentResult.equals(currentResult)) {
            this.props.onExportReady(currentResult.export.bind(currentResult));
        }
        this.currentResult = currentResult;
        this.visibleData = dv;
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        this.updateDesiredHeight(dv);
    };

    private onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        const newColumnTotals = getUpdatedColumnTotals(this.getColumnTotals(), menuAggregationClickConfig);

        this.props.pushData({
            properties: {
                totals: newColumnTotals,
            },
        });

        this.setState({ columnTotals: newColumnTotals }, () => {
            // make ag-grid refresh data
            // see: https://www.ag-grid.com/javascript-grid-infinite-scrolling/#changing-the-datasource
            this.setGridDataSource(this.agGridDataSource);
        });
    };

    private startWatchingTableRendered = () => {
        const missingContainerRef = !this.containerRef; // table having no data will be unmounted, it causes ref null
        const isTableVisible = !this.isTableHidden(); // table has data and takes place of Loading icon
        if (missingContainerRef || isTableVisible) {
            this.stopWatchingTableRendered();
        }
    };

    private stopWatchingTableRendered = () => {
        clearInterval(this.watchingIntervalId);
        this.watchingIntervalId = null;

        clearTimeout(this.watchingTimeoutId);
        this.watchingTimeoutId = null;

        this.props.afterRender();
    };

    //
    // event handlers - ag-grid
    //

    private onGridReady = (params: GridReadyEvent) => {
        this.gridApi = params.api;
        this.setGridDataSource(this.agGridDataSource);
        this.updateDesiredHeight(this.visibleData);

        if (this.props.groupRows) {
            initializeStickyRow(this.gridApi);
        }
    };

    private onFirstDataRendered = () => {
        // Since issue here is not resolved, https://github.com/ag-grid/ag-grid/issues/3263,
        // work-around by using 'setInterval'
        this.watchingIntervalId = window.setInterval(
            this.startWatchingTableRendered,
            WATCHING_TABLE_RENDERED_INTERVAL,
        );

        // after 15s, this table might or not (due to long backend execution) be rendered
        // either way, 'afterRender' should be called to notify to KPI dashboard
        // if KPI dashboard is in export mode, its content could be exported as much as possible even without this table
        this.watchingTimeoutId = window.setTimeout(
            this.stopWatchingTableRendered,
            WATCHING_TABLE_RENDERED_MAX_TIME,
        );
    };

    private onModelUpdated = () => {
        this.updateStickyRow();
    };

    private cellClicked = (cellEvent: IGridCellEvent) => {
        const { onDrill } = this.props;
        const tableHeaders = this.tableHeaders;
        const dv = this.visibleData;
        const drillablePredicates = this.getDrillablePredicates();

        const { colDef, rowIndex } = cellEvent;

        const rowType = get(cellEvent, ["data", "type"], "");
        const isRowTotal = rowType === ROW_TOTAL;
        const isRowSubtotal = rowType === ROW_SUBTOTAL;

        if (isRowTotal || isRowSubtotal) {
            return false;
        }

        const rowDrillItem = get(cellEvent, ["data", "headerItemMap", colDef.field]);
        const drillItems: IMappingHeader[] = rowDrillItem
            ? [...colDef.drillItems, rowDrillItem]
            : colDef.drillItems;

        const drillableHeaders = drillItems.filter((drillItem: IMappingHeader) =>
            isSomeHeaderPredicateMatched(drillablePredicates, drillItem, dv),
        );

        if (drillableHeaders.length === 0) {
            return false;
        }

        const leafColumnDefs = getTreeLeaves(tableHeaders.allHeaders);
        const columnIndex = leafColumnDefs.findIndex(gridHeader => gridHeader.field === colDef.field);
        const row = getDrillRowData(leafColumnDefs, cellEvent.data);
        const intersection = getDrillIntersection(drillItems, dv);

        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: "cell",
            columnIndex,
            rowIndex,
            row,
            intersection,
        };
        const drillEvent: IDrillEvent = {
            dataView: dv.dataView,
            drillContext,
        };

        if (onDrill(drillEvent)) {
            // This is needed for /analyze/embedded/ drilling with post message
            // tslint:disable-next-line:max-line-length
            // More info: https://github.com/gooddata/gdc-analytical-designer/blob/develop/test/drillEventing/drillEventing_page.html
            const event = new CustomEvent("drill", {
                detail: drillEvent,
                bubbles: true,
            });
            cellEvent.event.target.dispatchEvent(event);
            return true;
        }
        return false;
    };

    private columnResized = (columnEvent: ColumnResizedEvent) => {
        if (!columnEvent.finished) {
            return; // only update the height once the user is done setting the column size
        }
        this.updateDesiredHeight(this.visibleData);
    };

    private sortChanged = (event: SortChangedEvent): void => {
        if (!this.currentResult) {
            // tslint:disable-next-line:no-console
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortModel: ISortModelItem[] = event.columnApi
            .getAllColumns()
            .filter(col => col.getSort() !== undefined && col.getSort() !== null)
            .map(col => ({
                colId: col.getColDef().field,
                sort: col.getSort() as SortDirection,
            }));

        const sortItems = getSortsFromModel(sortModel, this.currentResult);

        this.props.pushData({
            properties: {
                sortItems,
            },
        });
    };

    private onBodyScroll = (event: BodyScrollEvent) => {
        const scrollPosition: IScrollPosition = {
            top: Math.max(event.top, 0),
            left: event.left,
        };
        this.updateStickyRowContent(scrollPosition);
    };

    private preventHeaderResizerEvents = (event: Event) => {
        if (event.target && this.isHeaderResizer(event.target as HTMLElement)) {
            event.stopPropagation();
        }
    };

    //
    // grid options & styling;
    // TODO: refactor to move all this outside of the file
    //

    private createGridOptions = (): ICustomGridOptions => {
        const tableHeaders = this.tableHeaders;
        const { pageSize } = this.props;
        const totalRowCount = this.visibleData.firstDimSize();
        const separators = get(this.props, ["config", "separators"], undefined);
        const menu = get(this.props, ["config", "menu"]);

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
        const extraTotalsBuffer = this.props.config && this.props.config.menu ? 10 : 0;
        const effectivePageSize = Math.min(pageSize, totalRowCount + extraTotalsBuffer);

        const commonHeaderComponentParams = {
            onMenuAggregationClick: this.onMenuAggregationClick,
            getDataView: this.getDataView,
            getColumnTotals: this.getColumnTotals,
            intl: this.props.intl,
        };

        return {
            // Initial data
            columnDefs: tableHeaders.allHeaders,
            rowData: [],
            defaultColDef: {
                cellClass: this.getCellClass(null),
                headerComponentFramework: ColumnHeader as any,
                headerComponentParams: {
                    menu,
                    enableSorting: true,
                    ...commonHeaderComponentParams,
                },
                minWidth: 50,
                sortable: true,
                resizable: true,
            },
            defaultColGroupDef: {
                headerClass: this.getHeaderClass(null),
                children: [],
                headerGroupComponentFramework: ColumnGroupHeader as any,
                headerGroupComponentParams: {
                    menu,
                    ...commonHeaderComponentParams,
                },
            },
            onCellClicked: this.cellClicked,
            onSortChanged: this.sortChanged,
            onColumnResized: this.columnResized,

            // Basic options
            suppressMovableColumns: true,
            suppressCellSelection: true,
            enableFilter: false,

            // infinite scrolling model
            rowModelType: "infinite",
            paginationPageSize: effectivePageSize,
            cacheOverflowSize: effectivePageSize,
            cacheBlockSize: effectivePageSize,
            maxConcurrentDatasourceRequests: 1,
            infiniteInitialRowCount: effectivePageSize,
            maxBlocksInCache: 10,
            onGridReady: this.onGridReady,
            onFirstDataRendered: this.onFirstDataRendered,
            onModelUpdated: this.onModelUpdated,
            onBodyScroll: this.onBodyScroll,

            // this provides persistent row selection (if enabled)
            getRowNodeId,

            // Column types
            columnTypes: {
                [ROW_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass("gd-row-attribute-column"),
                    headerClass: this.getHeaderClass("gd-row-attribute-column-header"),
                    colSpan: params => {
                        if (
                            // params.data is undefined when rows are in loading state
                            params.data &&
                            params.data.colSpan &&
                            AVAILABLE_TOTALS.find(
                                (item: string) => item === params.data[params.data.colSpan.headerKey],
                            )
                        ) {
                            return params.data.colSpan.count;
                        }
                        return 1;
                    },
                    valueFormatter: params => {
                        return params.value === undefined ? null : params.value;
                    },
                    cellRenderer,
                },
                [COLUMN_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass("gd-column-attribute-column"),
                    headerClass: this.getHeaderClass("gd-column-attribute-column-header"),
                },
                [MEASURE_COLUMN]: {
                    cellClass: this.getCellClass(classNames(AG_NUMERIC_CELL_CLASSNAME, "gd-measure-column")),
                    headerClass: this.getHeaderClass(
                        classNames(AG_NUMERIC_HEADER_CLASSNAME, "gd-measure-column-header"),
                    ),
                    // wrong params type from ag-grid, we need any
                    valueFormatter: (params: any) => {
                        return params.value !== undefined
                            ? getMeasureCellFormattedValue(
                                  params.value,
                                  getMeasureFormat(params.colDef, this.currentResult),
                                  separators,
                              )
                            : null;
                    },
                    cellStyle: params => {
                        return params.value !== undefined
                            ? getMeasureCellStyle(
                                  params.value,
                                  getMeasureFormat(params.colDef, this.currentResult),
                                  separators,
                                  true,
                              )
                            : null;
                    },
                    cellRenderer,
                },
            },

            // Custom renderers
            frameworkComponents: {
                // any is needed here because of incompatible types with AgGridReact types
                loadingRenderer: RowLoadingElement as any, // loading indicator
            },

            // Custom CSS classes
            rowClass: "gd-table-row",
            rowHeight: DEFAULT_ROW_HEIGHT,
        };
    };

    /**
     * getCellClass returns class for drillable cells. (maybe format in the future as well)
     */
    private getCellClass = (classList: string) => (cellClassParams: CellClassParams): string => {
        const { rowIndex } = cellClassParams;
        const dv = this.visibleData;
        const colDef = cellClassParams.colDef as IGridHeader;
        const drillablePredicates = this.getDrillablePredicates();
        // return none if no drillableItems are specified

        let hasDrillableHeader = false;

        const rowType = get(cellClassParams, ["data", "type"], "");
        const isRowTotal = rowType === ROW_TOTAL;
        const isRowSubtotal = rowType === ROW_SUBTOTAL;

        if (drillablePredicates.length !== 0 && !isRowTotal && !isRowSubtotal) {
            const rowDrillItem = get(cellClassParams, ["data", "headerItemMap", colDef.field]);
            const headers: IMappingHeader[] = rowDrillItem
                ? [...colDef.drillItems, rowDrillItem]
                : colDef.drillItems;

            hasDrillableHeader = headers.some((drillItem: IMappingHeader) =>
                isSomeHeaderPredicateMatched(drillablePredicates, drillItem, dv),
            );
        }

        const attributeId = colDef.field;
        const isPinnedRow = cellClassParams.node.isRowPinned();
        const hiddenCell = !isPinnedRow && this.getGroupingProvider().isRepeatedValue(attributeId, rowIndex);
        const rowSeparator = !hiddenCell && this.getGroupingProvider().isGroupBoundary(rowIndex);
        const subtotalStyle = get(cellClassParams, ["data", "subtotalStyle"]);

        return classNames(
            classList,
            getCellClassNames(rowIndex, colDef.index, hasDrillableHeader),
            colDef.index !== undefined ? `gd-column-index-${colDef.index}` : null,
            colDef.measureIndex !== undefined ? `gd-column-measure-${colDef.measureIndex}` : null,
            isRowTotal ? "gd-row-total" : null,
            subtotalStyle ? `gd-table-row-subtotal gd-table-row-subtotal-${subtotalStyle}` : null,
            hiddenCell ? "gd-cell-hide s-gd-cell-hide" : null,
            rowSeparator ? "gd-table-row-separator s-gd-table-row-separator" : null,
        );
    };

    private getHeaderClass = (classList: string) => (headerClassParams: any): string => {
        const colDef: IGridHeader = headerClassParams.colDef;
        const { field, measureIndex } = colDef;
        const treeIndexes = colDef
            ? indexOfTreeNode(
                  colDef,
                  this.tableHeaders.allHeaders,
                  (nodeA, nodeB) => nodeA.field !== undefined && nodeA.field === nodeB.field,
              )
            : null;
        const colGroupIndex = treeIndexes ? treeIndexes[treeIndexes.length - 1] : null;
        const isFirstColumn = treeIndexes !== null && !treeIndexes.some(index => index !== 0);

        return classNames(
            classList,
            "gd-column-group-header",
            colGroupIndex !== null ? `gd-column-group-header-${colGroupIndex}` : null,
            colGroupIndex !== null ? `s-table-measure-column-header-group-cell-${colGroupIndex}` : null,
            measureIndex !== null ? `s-table-measure-column-header-cell-${measureIndex}` : null,
            !field ? "gd-column-group-header--empty" : null,
            isFirstColumn ? "gd-column-group-header--first" : null,
        );
    };

    //
    // misc :)
    //
    private getGroupingProvider(): IGroupingProvider {
        return this.agGridDataSource.getGroupingProvider();
    }

    private getDrillablePredicates(): IHeaderPredicate[] {
        return convertDrillableItemsToPredicates(this.props.drillableItems);
    }

    private isStickyRowAvailable(): boolean {
        const gridApi = this.getGridApi();
        return this.props.groupRows && gridApi && stickyRowExists(gridApi);
    }

    private updateStickyRow(): void {
        if (this.isStickyRowAvailable()) {
            updateStickyRowPosition(this.getGridApi());

            const scrollPosition: IScrollPosition = { ...this.lastScrollPosition };
            this.lastScrollPosition = {
                top: 0,
                left: 0,
            };

            this.updateStickyRowContent(scrollPosition);
        }
    }

    private updateStickyRowContent(scrollPosition: IScrollPosition): void {
        if (this.isStickyRowAvailable()) {
            updateStickyRowContentClasses(
                scrollPosition,
                this.lastScrollPosition,
                DEFAULT_ROW_HEIGHT,
                this.getGridApi(),
                this.getGroupingProvider(),
                ApiWrapper,
            );
        }

        this.lastScrollPosition = { ...scrollPosition };
    }

    private getTotalBodyHeight(dv: DataViewFacade): number {
        const aggregationCount = sumBy(dv.totals(), total => total.length);
        const rowCount = dv.firstDimSize();

        const headerHeight = ApiWrapper.getHeaderHeight(this.gridApi);

        // add small room for error to avoid scrollbars that scroll one, two pixels
        // increased in order to resolve issue BB-1509
        const leeway = 2;

        const bodyHeight = rowCount * DEFAULT_ROW_HEIGHT + leeway;
        const footerHeight = aggregationCount * DEFAULT_ROW_HEIGHT;

        return headerHeight + bodyHeight + footerHeight;
    }

    private getScrollBarPadding(): number {
        if (!this.gridApi) {
            return 0;
        }
        const actualWidth = this.containerRef && this.containerRef.scrollWidth;
        const preferredWidth = this.gridApi.getPreferredWidth();
        const hasHorizontalScrollBar = actualWidth < preferredWidth;
        return hasHorizontalScrollBar ? getScrollbarWidth() : 0;
    }

    private calculateDesiredHeight(dv: DataViewFacade): number {
        const { maxHeight } = this.props.config;
        if (!maxHeight) {
            return;
        }

        const totalHeight = this.getTotalBodyHeight(dv) + this.getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    }

    private updateDesiredHeight(dv: DataViewFacade): void {
        const desiredHeight = this.calculateDesiredHeight(dv);

        if (this.state.desiredHeight !== desiredHeight) {
            this.setState({ desiredHeight });
        }
    }

    private isHeaderResizer(target: HTMLElement) {
        return target.classList.contains("ag-header-cell-resize");
    }
}
