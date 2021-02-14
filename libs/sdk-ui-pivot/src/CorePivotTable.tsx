// (C) 2007-2019 GoodData Corporation
import {
    AgGridEvent,
    AllCommunityModules,
    BodyScrollEvent,
    ColumnResizedEvent,
    GridReadyEvent,
    SortChangedEvent,
} from "@ag-grid-community/all-modules";
import {
    IDataView,
    IExecutionResult,
    IPreparedExecution,
    isNoDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { defFingerprint, defTotals, ITotal } from "@gooddata/sdk-model";
import { AgGridReact } from "@ag-grid-community/react";
import React from "react";
import { injectIntl } from "react-intl";

import "../styles/css/pivotTable.css";
import {
    convertError,
    createExportErrorFunction,
    DataViewFacade,
    ErrorCodes,
    ErrorComponent,
    GoodDataSdkError,
    IErrorDescriptors,
    ILoadingState,
    IntlWrapper,
    LoadingComponent,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { getUpdatedColumnTotals } from "./impl/structure/headers/aggregationsMenuHelper";
import {
    COLS_PER_PAGE,
    COLUMN_ATTRIBUTE_COLUMN,
    DEFAULT_AUTOSIZE_PADDING,
    DEFAULT_ROW_HEIGHT,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
} from "./impl/base/constants";
import { ICustomGridOptions } from "./impl/base/agGridTypes";
import ColumnGroupHeader from "./impl/structure/headers/ColumnGroupHeader";
import ColumnHeader from "./impl/structure/headers/ColumnHeader";
import { getScrollbarWidth } from "./impl/utils";
import { RowLoadingElement } from "./impl/data/RowLoadingElement";
import { IScrollPosition } from "./impl/stickyRowHandler";

import { DefaultColumnWidth, ICorePivotTableProps, IMenu, IMenuAggregationClickConfig } from "./types";
import { ColumnWidthItem } from "./columnWidths";
import { MIN_WIDTH } from "./impl/resizing/agGridColumnSizing";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import { invariant } from "ts-invariant";
import { ICommonHeaderParams } from "./impl/structure/headers/HeaderCell";
import { ColumnResizingConfig, TableFacade } from "./tableFacade";
import {
    getAvailableDrillTargets,
    getAvailableDrillTargetsFromExecutionResult,
} from "./impl/drilling/drillTargets";
import { headerClassFactory } from "./impl/structure/colDefHeaderClass";
import {
    columnAttributeTemplate,
    measureColumnTemplate,
    rowAttributeTemplate,
} from "./impl/structure/colDefTemplates";
import { isHeaderResizer, isManualResizing, scrollBarExists } from "./impl/base/agGridUtils";
import { cellClassFactory } from "./impl/cell/cellClass";
import { onCellClickedFactory } from "./impl/cell/onCellClick";

export const DEFAULT_COLUMN_WIDTH = 200;
export const WATCHING_TABLE_RENDERED_INTERVAL = 500;

export interface ICorePivotTableState {
    tableReady: boolean;
    columnTotals: ITotal[];
    desiredHeight: number | undefined;
    error?: string;
    resized: boolean;
}

/**
 * Pivot Table react component
 *
 * @internal
 */
export class CorePivotTablePure extends React.Component<ICorePivotTableProps, ICorePivotTableState> {
    public static defaultProps: Partial<ICorePivotTableProps> = {
        locale: "en-US",
        drillableItems: [],
        afterRender: noop,
        pushData: noop,
        onExportReady: noop,
        onLoadingChanged: noop,
        onError: noop,
        onDrill: () => true,
        ErrorComponent,
        LoadingComponent,
        pageSize: 100,
        config: {},
        onColumnResized: noop,
    };

    // these can stay here

    private readonly errorMap: IErrorDescriptors;

    /**
     * Fingerprint of the last execution definition the initialize was called with.
     */
    private lastInitRequestFingerprint: string | null = null;
    private unmounted: boolean = false;
    private firstDataRendered: boolean = false;
    private watchingIntervalId: number | null;
    private lastScrollPosition: IScrollPosition = {
        top: 0,
        left: 0,
    };
    private isMetaOrCtrlKeyPressed = false;
    private isAltKeyPressed = false;

    private containerRef: HTMLDivElement;
    private gridOptions: ICustomGridOptions | null = null;
    private table: TableFacade | null;

    constructor(props: ICorePivotTableProps) {
        super(props);

        const { execution, config } = props;

        this.state = {
            tableReady: false,
            columnTotals: cloneDeep(defTotals(execution.definition, 0)),
            desiredHeight: config!.maxHeight,
            resized: false,
        };

        this.errorMap = newErrorMapping(props.intl);
    }

    private clearTimeouts = () => {
        if (this.watchingIntervalId) {
            clearTimeout(this.watchingIntervalId);
            this.watchingIntervalId = null;
        }
    };

    private cleanupNonReactState = () => {
        this.lastInitRequestFingerprint = null;
        this.firstDataRendered = false;

        this.lastScrollPosition = {
            top: 0,
            left: 0,
        };

        this.clearTimeouts();
    };

    private reinitialize = (execution: IPreparedExecution): void => {
        this.setState(
            {
                tableReady: false,
                columnTotals: cloneDeep(defTotals(execution.definition, 0)),
                error: undefined,
                desiredHeight: this.props.config!.maxHeight,
                resized: false,
            },
            () => {
                this.cleanupNonReactState();
                this.initialize(execution);
            },
        );
    };

    private initializeNonReactState = (result: IExecutionResult, dataView: IDataView) => {
        this.table = new TableFacade(result, dataView, this.props.intl);
        this.table.updateColumnWidths(this.getResizingConfig());

        this.table.createDataSource({
            getGroupRows: this.getGroupRows,
            getColumnTotals: this.getColumnTotals,
            onPageLoaded: this.onPageLoaded,
        });
    };

    private initialize(execution: IPreparedExecution): void {
        this.onLoadingChanged({ isLoading: true });
        this.lastInitRequestFingerprint = defFingerprint(execution.definition);

        execution
            .execute()
            .then((result) => {
                result
                    .readWindow([0, 0], [this.props.pageSize!, COLS_PER_PAGE])
                    .then((dataView) => {
                        if (this.unmounted) {
                            /*
                             * Stop right now if the component gets unmounted while it is still being
                             * initialized.
                             */
                            return;
                        }

                        if (this.lastInitRequestFingerprint !== defFingerprint(dataView.definition)) {
                            /*
                             * Stop right now if the data are not relevant anymore because there was another
                             * initialize request in the meantime.
                             */
                            return;
                        }

                        // TODO: refactor to return value?
                        this.initializeNonReactState(result, dataView);
                        invariant(this.table);

                        this.onLoadingChanged({ isLoading: false });
                        this.props.onExportReady?.(this.table.createExportFunction(this.props.exportTitle));
                        this.setState({ tableReady: true });

                        const availableDrillTargets = this.table.getAvailableDrillTargets();
                        this.props.pushData!({ dataView, availableDrillTargets });
                    })
                    .catch((error) => {
                        if (this.unmounted) {
                            return;
                        }

                        /**
                         * When execution result is received successfully,
                         * but data load fails with unexpected http response,
                         * we still want to push availableDrillTargets
                         */
                        if (isUnexpectedResponseError(error)) {
                            const availableDrillTargets = getAvailableDrillTargetsFromExecutionResult(result);

                            this.props.pushData!({ availableDrillTargets });
                        }

                        /*
                         * There can be situations, where there is no data to visualize but the result / dataView contains
                         * metadata essential for setup of drilling. Look for that and if available push up.
                         */
                        if (isNoDataError(error) && error.dataView) {
                            const availableDrillTargets = getAvailableDrillTargets(
                                DataViewFacade.for(error.dataView),
                            );

                            this.props.pushData!({ availableDrillTargets });
                            this.onLoadingChanged({ isLoading: false });
                        }

                        this.onError(convertError(error));
                    });
            })
            .catch((error) => {
                if (this.unmounted) {
                    return;
                }

                this.onError(convertError(error));
            });
    }

    public componentDidMount(): void {
        this.initialize(this.props.execution);
    }

    public componentWillUnmount(): void {
        this.unmounted = true;

        if (this.containerRef) {
            this.containerRef.removeEventListener("mousedown", this.onContainerMouseDown);
        }

        this.clearTimeouts();
    }

    public componentDidUpdate(prevProps: ICorePivotTableProps): void {
        if (this.isReinitNeeded(prevProps)) {
            /*
             * This triggers when execution changes (new measures / attributes). In that case,
             * a complete re-init of the table is in order.
             *
             * Everything is thrown out of the window including all the ag-grid data sources and instances and
             * a completely new table will be initialized to the current props.
             *
             * Note: compared to v7 version of the table, this only happens if someone actually changes the
             * execution-related props of the table. This branch will not hit any other time.
             */
            this.reinitialize(this.props.execution);
        } else {
            /*
             * When in this branch, the ag-grid instance is up and running and is already showing some data and
             * it _should_ be possible to normally use the ag-grid APIs.
             *
             * The currentResult and visibleData _will_ be available at this point because the component is definitely
             * after a successful execution and initialization.
             */

            if (this.isAgGridRerenderNeeded(this.props, prevProps)) {
                this.table?.refreshHeader();
            }

            if (this.isGrowToFitEnabled() && !this.isGrowToFitEnabled(prevProps)) {
                this.growToFit();
            }

            const prevColumnWidths = this.getColumnWidths(prevProps);
            const columnWidths = this.getColumnWidths(this.props);

            if (!isEqual(prevColumnWidths, columnWidths)) {
                this.table?.applyColumnSizes(this.getResizingConfig());
            }
        }
    }

    private isAgGridRerenderNeeded(props: ICorePivotTableProps, prevProps: ICorePivotTableProps): boolean {
        const propsRequiringAgGridRerender = [["config", "menu"]];
        return propsRequiringAgGridRerender.some(
            (propKey) => !isEqual(get(props, propKey), get(prevProps, propKey)),
        );
    }

    private renderLoading() {
        const { LoadingComponent } = this.props;

        return (
            <div className="s-loading gd-table-loading">{LoadingComponent ? <LoadingComponent /> : null}</div>
        );
    }

    public render(): React.ReactNode {
        const { ErrorComponent } = this.props;
        const { desiredHeight, error } = this.state;

        if (error) {
            const errorProps = this.errorMap[
                Object.prototype.hasOwnProperty.call(this.errorMap, error) ? error : ErrorCodes.UNKNOWN_ERROR
            ];

            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
        }

        const style: React.CSSProperties = {
            height: desiredHeight || "100%",
            position: "relative",
            overflow: "hidden",
        };

        if (!this.state.tableReady) {
            return (
                <div className="gd-table-component" style={style}>
                    {this.renderLoading()}
                </div>
            );
        }

        if (!this.gridOptions) {
            this.gridOptions = this.createGridOptions();
        }

        /*
         * Show loading overlay until all the resizing is done. This is because the various resizing operations
         * have to happen asynchronously - they must wait until ag-grid fires onFirstDataRendered, before our code
         * can start reliably interfacing with the autosizing features.
         */
        const shouldRenderLoadingOverlay =
            (this.isColumnAutoresizeEnabled() || this.isGrowToFitEnabled()) && !this.state.resized;

        return (
            <div className="gd-table-component" style={style}>
                <div
                    className="gd-table ag-theme-balham s-pivot-table"
                    style={style}
                    ref={this.setContainerRef}
                >
                    <AgGridReact {...this.gridOptions} modules={AllCommunityModules} />
                    {shouldRenderLoadingOverlay ? this.renderLoading() : null}
                </div>
            </div>
        );
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
        invariant(this.table);

        const drillingIsSame = isEqual(prevProps.drillableItems, this.props.drillableItems);

        if (!drillingIsSame) {
            return true;
        }

        const prepExecutionSame = this.props.execution.fingerprint() === prevProps.execution.fingerprint();

        return !prepExecutionSame && this.table.isMatchingExecution(this.props.execution);
    }

    //
    // getters / setters / manipulators
    //

    private setContainerRef = (container: HTMLDivElement): void => {
        this.containerRef = container;

        if (this.containerRef) {
            this.containerRef.addEventListener("mousedown", this.onContainerMouseDown);
        }
    };

    private getColumnTotals = () => {
        return this.state.columnTotals;
    };

    private getTableDescriptor = () => {
        invariant(this.table);

        return this.table.tableDescriptor;
    };

    private getExecutionDefinition = () => {
        return this.props.execution.definition;
    };

    private getGroupRows = (): boolean => {
        return this.props.config?.groupRows ?? true;
    };

    private getMenuConfig = (): IMenu => {
        return this.props.config?.menu ?? {};
    };

    //
    // column resizing stuff
    //

    private getDefaultWidth = () => {
        return DEFAULT_COLUMN_WIDTH;
    };

    private isColumnAutoresizeEnabled = () => {
        const defaultWidth = this.getDefaultWidthFromProps(this.props);
        return defaultWidth === "viewport" || defaultWidth === "autoresizeAll";
    };

    private isGrowToFitEnabled = (props: ICorePivotTableProps = this.props) => {
        return props.config?.columnSizing?.growToFit === true;
    };

    private getColumnWidths = (props: ICorePivotTableProps): ColumnWidthItem[] | undefined => {
        return props.config!.columnSizing?.columnWidths;
    };

    private hasColumnWidths = () => {
        return !!this.getColumnWidths(this.props);
    };

    private getDefaultWidthFromProps = (props: ICorePivotTableProps): DefaultColumnWidth => {
        return props.config?.columnSizing?.defaultWidth ?? "unset";
    };

    private growToFit() {
        invariant(this.table);

        if (!this.isGrowToFitEnabled()) {
            return;
        }

        this.table?.growToFit(this.getResizingConfig());

        if (!this.state.resized && !this.table.isResizing()) {
            this.setState({
                resized: true,
            });
        }
    }

    private autoresizeColumns = async (force: boolean = false) => {
        if (this.state.resized && !force) {
            return;
        }

        const didResize = await this.table?.autoresizeColumns(this.getResizingConfig(), force);

        if (didResize) {
            this.setState({
                resized: true,
            });
        }
    };

    private shouldAutoResizeColumns = () => {
        const columnAutoresize = this.isColumnAutoresizeEnabled();
        const growToFit = this.isGrowToFitEnabled();
        return columnAutoresize || growToFit;
    };

    private startWatchingTableRendered = () => {
        if (!this.table) {
            return;
        }

        const missingContainerRef = !this.containerRef; // table having no data will be unmounted, it causes ref null
        const isTableRendered = this.shouldAutoResizeColumns()
            ? this.state.resized
            : this.table.isPivotTableReady();
        const shouldCallAutoresizeColumns =
            this.table.isPivotTableReady() && !this.state.resized && !this.table.isResizing();

        if (this.shouldAutoResizeColumns() && shouldCallAutoresizeColumns) {
            this.autoresizeColumns();
        }

        if (missingContainerRef || isTableRendered) {
            this.stopWatchingTableRendered();
        }
    };

    private stopWatchingTableRendered = () => {
        if (this.watchingIntervalId) {
            clearInterval(this.watchingIntervalId);
            this.watchingIntervalId = null;
        }

        this.props.afterRender!();
    };

    //
    // event handlers
    //

    private onGridReady = (event: GridReadyEvent) => {
        invariant(this.table);

        this.table.finishInitialization(event.api, event.columnApi);
        this.updateDesiredHeight();

        if (this.getGroupRows()) {
            this.table.initializeStickyRow();
        }
    };

    private onFirstDataRendered = async (_event: AgGridEvent) => {
        invariant(this.table);

        if (this.firstDataRendered) {
            // eslint-disable-next-line no-console
            console.error("onFirstDataRendered called multiple times");
        }

        this.firstDataRendered = true;

        // Since issue here is not resolved, https://github.com/ag-grid/ag-grid/issues/3263,
        // work-around by using 'setInterval'
        if (!this.watchingIntervalId) {
            this.watchingIntervalId = window.setInterval(
                this.startWatchingTableRendered,
                WATCHING_TABLE_RENDERED_INTERVAL,
            );
        }

        /*
         * At this point data from backend is available, some of it is rendered and auto-resize can be done.
         *
         * See: https://www.ag-grid.com/javascript-grid-resizing/#resize-after-data
         *
         * I suspect now that the table life-cycle is somewhat more sane, we can follow the docs. For a good
         * measure, let's throw in a mild timeout. I have observed different results (slightly less space used)
         * when the timeout was not in place.
         */
        if (this.isColumnAutoresizeEnabled()) {
            await this.autoresizeColumns();
        } else if (this.isGrowToFitEnabled()) {
            this.growToFit();
        }

        this.updateStickyRow();
    };

    private onModelUpdated = () => {
        this.updateStickyRow();
    };

    private onGridColumnsChanged = () => {
        this.updateStickyRow();
    };

    private onGridColumnResized = async (columnEvent: ColumnResizedEvent) => {
        invariant(this.table);

        if (!columnEvent.finished) {
            return; // only update the height once the user is done setting the column size
        }

        this.updateDesiredHeight();

        if (isManualResizing(columnEvent)) {
            this.table.onManualColumnResize(this.getResizingConfig(), columnEvent.columns!);
        }
    };

    private onSortChanged = (event: SortChangedEvent): void => {
        if (!this.table) {
            // eslint-disable-next-line no-console
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortItems = this.table.createSortItems(event.columnApi.getAllColumns());

        this.props.pushData!({
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

    private onContainerMouseDown = (event: MouseEvent) => {
        if (event.target && isHeaderResizer(event.target as HTMLElement)) {
            event.stopPropagation();
        }
        this.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
        this.isAltKeyPressed = event.altKey;
    };

    private onPageLoaded = (_dv: DataViewFacade, newResult: boolean): void => {
        if (!this.table) {
            return;
        }

        if (newResult) {
            this.props.onExportReady?.(this.table.createExportFunction(this.props.exportTitle));
        }

        this.updateDesiredHeight();
    };

    private onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        const newColumnTotals = getUpdatedColumnTotals(this.getColumnTotals(), menuAggregationClickConfig);

        this.props.pushData!({
            properties: {
                totals: newColumnTotals,
            },
        });

        this.setState({ columnTotals: newColumnTotals }, () => {
            this.table?.refreshData();
        });
    };

    private onLoadingChanged = (loadingState: ILoadingState): void => {
        const { onLoadingChanged } = this.props;

        if (onLoadingChanged) {
            onLoadingChanged(loadingState);
        }
    };

    private onError(error: GoodDataSdkError, execution = this.props.execution) {
        const { onExportReady } = this.props;

        if (this.props.execution.fingerprint() === execution.fingerprint()) {
            this.setState({ error: error.getMessage() });

            onExportReady!(createExportErrorFunction(error));

            this.props.onError?.(error);
        }
    }

    //
    // grid options & styling;
    //

    private createGridOptions = (): ICustomGridOptions => {
        invariant(this.table);

        const { colDefs } = this.table.tableDescriptor;
        const { pageSize } = this.props;
        const totalRowCount = this.table.getRowCount();

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
        const extraTotalsBuffer = this.props.config && this.props.config.menu ? 10 : 0;
        const effectivePageSize = Math.min(pageSize!, totalRowCount + extraTotalsBuffer);

        const commonHeaderComponentParams: ICommonHeaderParams = {
            onMenuAggregationClick: this.onMenuAggregationClick,
            getTableDescriptor: this.getTableDescriptor,
            getExecutionDefinition: this.getExecutionDefinition,
            getColumnTotals: this.getColumnTotals,
            intl: this.props.intl,
        };

        return {
            // Initial data
            columnDefs: allColumnDefs,
            rowData: [],
            defaultColDef: {
                cellClass: cellClassFactory(this.table, this.props),
                headerComponentFramework: ColumnHeader as any,
                headerComponentParams: {
                    menu: this.getMenuConfig,
                    enableSorting: true,
                    ...commonHeaderComponentParams,
                },
                minWidth: MIN_WIDTH,
                sortable: true,
                resizable: true,
            },
            defaultColGroupDef: {
                headerClass: headerClassFactory(this.table, this.props),
                children: [],
                headerGroupComponentFramework: ColumnGroupHeader as any,
                headerGroupComponentParams: {
                    menu: this.getMenuConfig,
                    ...commonHeaderComponentParams,
                },
            },
            onCellClicked: onCellClickedFactory(this.table, this.props),
            onSortChanged: this.onSortChanged,
            onColumnResized: this.onGridColumnResized,
            onGridColumnsChanged: this.onGridColumnsChanged,
            onModelUpdated: this.onModelUpdated,

            // Basic options
            suppressMovableColumns: true,
            suppressCellSelection: true,
            suppressAutoSize: this.hasColumnWidths(),
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
            onBodyScroll: this.onBodyScroll,

            // Column types
            columnTypes: {
                [ROW_ATTRIBUTE_COLUMN]: rowAttributeTemplate(this.table, this.props),
                [COLUMN_ATTRIBUTE_COLUMN]: columnAttributeTemplate(this.table, this.props),
                [MEASURE_COLUMN]: measureColumnTemplate(this.table, this.props),
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
    };

    //
    // Sticky row handling
    //

    private isStickyRowAvailable(): boolean {
        invariant(this.table);

        return Boolean(this.getGroupRows() && this.table.stickyRowExists());
    }

    private updateStickyRow(): void {
        if (!this.table) {
            return;
        }

        if (this.isStickyRowAvailable()) {
            this.table.updateStickyRowPosition();

            const scrollPosition: IScrollPosition = { ...this.lastScrollPosition };
            this.lastScrollPosition = {
                top: 0,
                left: 0,
            };

            this.updateStickyRowContent(scrollPosition);
        }
    }

    private updateStickyRowContent(scrollPosition: IScrollPosition): void {
        invariant(this.table);

        if (this.isStickyRowAvailable()) {
            this.table.updateStickyRowContent({
                scrollPosition,
                lastScrollPosition: this.lastScrollPosition,
            });
        }

        this.lastScrollPosition = { ...scrollPosition };
    }

    //
    // Desired height updating
    //

    private getScrollBarPadding(): number {
        if (!this.table?.isFullyInitialized()) {
            return 0;
        }

        if (!this.containerRef) {
            return 0;
        }

        // check for scrollbar presence
        return scrollBarExists(this.containerRef) ? getScrollbarWidth() : 0;
    }

    private calculateDesiredHeight(): number | undefined {
        const { maxHeight } = this.props.config!;
        if (!maxHeight) {
            return;
        }
        const bodyHeight = this.table?.getTotalBodyHeight() ?? 0;
        const totalHeight = bodyHeight + this.getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    }

    private updateDesiredHeight(): void {
        if (!this.table) {
            return;
        }

        const desiredHeight = this.calculateDesiredHeight();

        if (this.state.desiredHeight !== desiredHeight) {
            this.setState({ desiredHeight });
        }
    }

    //
    // Obtaining different table contexts
    //

    private getResizingConfig = (): ColumnResizingConfig => {
        return {
            defaultWidth: this.getDefaultWidth(),
            growToFit: this.isGrowToFitEnabled(),
            columnAutoresizeEnabled: this.isColumnAutoresizeEnabled(),
            widths: this.getColumnWidths(this.props),

            isAltKeyPressed: this.isAltKeyPressed,
            isMetaOrCtrlKeyPressed: this.isMetaOrCtrlKeyPressed,

            clientWidth: this.containerRef?.clientWidth ?? 0,
            containerRef: this.containerRef,
            separators: this.props?.config?.separators,

            onColumnResized: this.props.onColumnResized,
        };
    };
}

const CorePivotTableWithIntl = injectIntl(CorePivotTablePure);

/**
 * @internal
 */
export const CorePivotTable: React.FC<ICorePivotTableProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <CorePivotTableWithIntl {...props} />
    </IntlWrapper>
);
