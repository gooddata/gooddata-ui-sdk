// (C) 2007-2019 GoodData Corporation
import {
    IAttributeDescriptor,
    IDataView,
    IExecutionResult,
    IMeasureDescriptor,
    IPreparedExecution,
    isAttributeDescriptor,
    isNoDataError,
    isUnexpectedResponseError,
    IMeasureGroupDescriptor,
    isMeasureGroupDescriptor,
    IDimensionDescriptor,
} from "@gooddata/sdk-backend-spi";
import { defFingerprint, defTotals, ITotal, SortDirection } from "@gooddata/sdk-model";
import {
    AgGridEvent,
    AllCommunityModules,
    BodyScrollEvent,
    CellClassParams,
    Column,
    ColumnApi,
    ColumnResizedEvent,
    GridApi,
    GridReadyEvent,
    IDatasource,
    SortChangedEvent,
} from "@ag-grid-community/all-modules";
import { AgGridReact } from "@ag-grid-community/react";
import cx from "classnames";
import CustomEvent from "custom-event";
import React from "react";
import { injectIntl } from "react-intl";
import flatMap from "lodash/fp/flatMap";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";

import "../styles/css/pivotTable.css";
import {
    convertDrillableItemsToPredicates,
    convertError,
    createExportErrorFunction,
    createExportFunction,
    DataViewFacade,
    ErrorCodes,
    ErrorComponent,
    getDrillIntersection,
    GoodDataSdkError,
    IAvailableDrillTargets,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargetAttribute,
    IDrillEvent,
    IDrillEventContextTable,
    IDrillEventIntersectionElement,
    IErrorDescriptors,
    IHeaderPredicate,
    ILoadingState,
    IMappingHeader,
    IntlWrapper,
    isSomeHeaderPredicateMatched,
    LoadingComponent,
    newErrorMapping,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
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
import { getDrillRowData } from "./impl/agGridDrilling";
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
    getColumnIdentifier,
    getMeasureFormat,
    getRowNodeId,
    getTreeLeaves,
    indexOfTreeNode,
    isColumnDisplayed,
    isMeasureColumn,
} from "./impl/agGridUtils";
import ColumnGroupHeader from "./impl/ColumnGroupHeader";
import ColumnHeader from "./impl/ColumnHeader";
import { getScrollbarWidth, sleep } from "./impl/utils";
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

import { DefaultColumnWidth, ICorePivotTableProps, IMenu, IMenuAggregationClickConfig } from "./types";
import { setColumnMaxWidth, setColumnMaxWidthIf } from "./impl/agGridColumnWrapper";
import { ColumnWidthItem, ColumnEventSourceType, IResizedColumns, UIClick } from "./columnWidths";
import {
    isColumnAutoResized,
    MANUALLY_SIZED_MAX_WIDTH,
    MIN_WIDTH,
    resetColumnsWidthToDefault,
    resizeAllMeasuresColumns,
    ResizedColumnsStore,
    resizeWeakMeasureColumns,
    syncSuppressSizeToFitOnColumns,
    updateColumnDefinitionsWithWidths,
} from "./impl/agGridColumnSizing";
import { fixEmptyHeaderItems } from "@gooddata/sdk-ui-vis-commons";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import sumBy from "lodash/sumBy";
import difference from "lodash/difference";
import debounce from "lodash/debounce";

const AG_NUMERIC_CELL_CLASSNAME = "ag-numeric-cell";
const AG_NUMERIC_HEADER_CLASSNAME = "ag-numeric-header";
const DEFAULT_ROW_HEIGHT = 28;

const DEFAULT_AUTOSIZE_PADDING = 10;
const COLUMN_RESIZE_TIMEOUT = 300;
const AGGRID_ON_RESIZE_TIMEOUT = 300;
const AUTO_SIZED_MAX_WIDTH = 500;

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
        groupRows: true,
        onColumnResized: noop,
    };

    private readonly errorMap: IErrorDescriptors;

    private containerRef: HTMLDivElement;

    private unmounted: boolean = false;

    private gridApi: GridApi = null;
    private columnApi: ColumnApi = null;
    private gridOptions: ICustomGridOptions = null;
    private tableHeaders: TableHeaders = null;
    private agGridDataSource: AgGridDatasource = null;

    private currentResult: IExecutionResult = null;
    private visibleData: DataViewFacade = null;
    private currentFingerprint: string = null;

    /**
     * Fingerprint of the last execution definition the initialize was called with.
     */
    private lastInitRequestFingerprint: string = null;

    private lastScrollPosition: IScrollPosition = {
        top: 0,
        left: 0,
    };

    private firstDataRendered: boolean = false;
    private watchingIntervalId: number | null;

    private resizedColumnsStore: ResizedColumnsStore;
    private autoResizedColumns: IResizedColumns = {};
    private growToFittedColumns: IResizedColumns = {};
    private resizing: boolean = false;
    private lastResizedWidth = 0;
    private lastResizedHeight = 0;
    private numberOfColumnResizedCalls = 0;
    private isMetaOrCtrlKeyPressed = false;
    private isAltKeyPressed = false;

    constructor(props: ICorePivotTableProps) {
        super(props);

        const { execution, config } = props;

        this.state = {
            tableReady: false,
            columnTotals: cloneDeep(defTotals(execution.definition, 0)),
            desiredHeight: config.maxHeight,
            resized: false,
        };

        this.errorMap = newErrorMapping(props.intl);
        this.gridSizeChanged = debounce(this.gridSizeChanged, AGGRID_ON_RESIZE_TIMEOUT);
        this.resizedColumnsStore = new ResizedColumnsStore();
    }

    private clearFittedColumns = () => {
        this.growToFittedColumns = {};
    };

    private clearTimeouts = () => {
        if (this.watchingIntervalId) {
            clearTimeout(this.watchingIntervalId);
            this.watchingIntervalId = null;
        }
    };

    private cleanupNonReactState = () => {
        this.gridApi = null;
        this.gridOptions = null;
        this.tableHeaders = null;
        this.agGridDataSource = null;
        this.currentResult = null;
        this.visibleData = null;
        this.currentFingerprint = null;
        this.lastInitRequestFingerprint = null;
        this.firstDataRendered = false;
        this.resizedColumnsStore = new ResizedColumnsStore();
        this.autoResizedColumns = {};
        this.lastResizedWidth = 0;
        this.lastResizedHeight = 0;
        this.clearFittedColumns();

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
                desiredHeight: this.props.config.maxHeight,
                resized: false,
            },
            () => {
                this.cleanupNonReactState();
                this.initialize(execution);
            },
        );
    };

    private getAttributeItemsForDimension = (
        dv: DataViewFacade,
        dimension: number,
    ): IAvailableDrillTargetAttribute[] => {
        return dv
            .meta()
            .attributeDescriptorsForDim(dimension)
            .map((attribute: IAttributeDescriptor) => {
                return {
                    dimension,
                    attribute,
                };
            });
    };

    private getAvailableDrillTargets = (dv: DataViewFacade): IAvailableDrillTargets => {
        const measureDescriptors = dv
            .meta()
            .measureDescriptors()
            .map(
                (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                    measure,
                    attributes: dv.meta().attributeDescriptors(),
                }),
            );

        const rowAttributeItems = this.getAttributeItemsForDimension(dv, 0);
        const columnAttributeItems = this.getAttributeItemsForDimension(dv, 1);
        return {
            measures: measureDescriptors,
            attributes: [...rowAttributeItems, ...columnAttributeItems],
        };
    };

    private getAvailableDrillTargetsFromExecutionResult(
        executionResult: IExecutionResult,
    ): IAvailableDrillTargets {
        const attributeDescriptors: IAttributeDescriptor[] = flow(
            flatMap((dimensionDescriptor: IDimensionDescriptor) => dimensionDescriptor.headers),
            filter(isAttributeDescriptor),
        )(executionResult.dimensions);

        const measureDescriptors: IMeasureDescriptor[] = flow(
            flatMap((dimensionDescriptor: IDimensionDescriptor) => dimensionDescriptor.headers),
            filter(isMeasureGroupDescriptor),
            flatMap(
                (measureGroupDescriptor: IMeasureGroupDescriptor) =>
                    measureGroupDescriptor.measureGroupHeader.items,
            ),
        )(executionResult.dimensions);

        return {
            measures: measureDescriptors.map(
                (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                    measure,
                    attributes: attributeDescriptors,
                }),
            ),
        };
    }

    private onLoadingChanged = (loadingState: ILoadingState): void => {
        const { onLoadingChanged } = this.props;

        if (onLoadingChanged) {
            onLoadingChanged(loadingState);
        }
    };

    private initializeNonReactState = (result: IExecutionResult, dataView: IDataView) => {
        this.currentResult = result;
        this.visibleData = DataViewFacade.for(dataView);
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        /*
         * Initialize table headers from first page of data, then update the initialized
         * headers according to column sizing rules.
         *
         * NOTE: it would be better to have this all orchestrated in a single call.
         */
        this.tableHeaders = createTableHeaders(dataView);

        const columnWidths = this.getColumnWidths(this.props);
        this.resizedColumnsStore.updateColumnWidths(columnWidths, this.visibleData);

        updateColumnDefinitionsWithWidths(
            this.tableHeaders.allHeaders,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            this.getDefaultWidth(),
            this.isGrowToFitEnabled(),
            this.growToFittedColumns,
        );

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
    };

    private initialize(execution: IPreparedExecution): void {
        this.onLoadingChanged({ isLoading: true });
        this.lastInitRequestFingerprint = defFingerprint(execution.definition);
        execution
            .execute()
            .then((result) => {
                result
                    .readWindow([0, 0], [this.props.pageSize, COLS_PER_PAGE])
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

                        fixEmptyHeaderItems(
                            dataView,
                            `(${this.props.intl.formatMessage({ id: "visualization.emptyValue" })})`,
                        );

                        this.initializeNonReactState(result, dataView);

                        this.onLoadingChanged({ isLoading: false });
                        this.props.onExportReady(
                            createExportFunction(this.currentResult, this.props.exportTitle),
                        );
                        this.setState({ tableReady: true });

                        const availableDrillTargets = this.getAvailableDrillTargets(this.visibleData);
                        this.props.pushData({ dataView, availableDrillTargets });
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
                            const availableDrillTargets = this.getAvailableDrillTargetsFromExecutionResult(
                                result,
                            );

                            this.props.pushData({ availableDrillTargets });
                        }

                        /*
                         * There can be situations, where there is no data to visualize but the result / dataView contains
                         * metadata essential for setup of drilling. Look for that and if available push up.
                         */
                        if (isNoDataError(error) && error.dataView) {
                            const availableDrillTargets = this.getAvailableDrillTargets(
                                DataViewFacade.for(error.dataView),
                            );

                            this.props.pushData({ availableDrillTargets });
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
                this.gridApi.refreshHeader();
            }

            if (this.isGrowToFitEnabled() && !this.isGrowToFitEnabled(prevProps)) {
                this.growToFit(this.columnApi);
            }

            const prevColumnWidths = this.getColumnWidths(prevProps);
            const columnWidths = this.getColumnWidths(this.props);

            if (!isEqual(prevColumnWidths, columnWidths)) {
                this.applyColumnSizes(columnWidths);
            }
        }
    }

    private applyColumnSizes(columnWidths: ColumnWidthItem[]) {
        if (!this.columnApi) {
            return;
        }

        this.resizedColumnsStore.updateColumnWidths(columnWidths, this.visibleData);

        syncSuppressSizeToFitOnColumns(this.resizedColumnsStore, this.columnApi);

        if (this.isGrowToFitEnabled()) {
            this.growToFit(this.columnApi); // calls resetColumnsWidthToDefault internally too
        } else {
            const columns = this.columnApi.getAllColumns();
            this.resetColumnsWidthToDefault(this.columnApi, columns);
        }
    }

    private renderLoading() {
        const { LoadingComponent } = this.props;

        return (
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    background: "white",
                }}
                className="s-loading"
            >
                {LoadingComponent ? <LoadingComponent /> : null}
            </div>
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

        if (this.isTableInitializing()) {
            return this.renderLoading();
        }

        const style: React.CSSProperties = {
            height: desiredHeight || "100%",
            position: "relative",
            overflow: "hidden",
        };

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

    //
    //
    //

    private isTableInitializing() {
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
        const drillingIsSame = isEqual(prevProps.drillableItems, this.props.drillableItems);

        if (!drillingIsSame) {
            return true;
        }

        const prepExecutionSame = this.props.execution.fingerprint() === prevProps.execution.fingerprint();
        const fingerprintSame = this.currentFingerprint === this.props.execution.fingerprint();

        return !prepExecutionSame && !fingerprintSame;
    }

    private onError(error: GoodDataSdkError, execution = this.props.execution) {
        const { onExportReady } = this.props;

        if (this.props.execution.fingerprint() === execution.fingerprint()) {
            this.setState({ error: error.getMessage() });

            if (onExportReady) {
                onExportReady(createExportErrorFunction(error));
            }

            this.props.onError?.(error);
        }
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

    private getExecutionDefinition = () => {
        return this.props.execution.definition;
    };

    private getDataView = () => {
        return this.visibleData;
    };

    private getMenuConfig = (): IMenu => {
        return this.props.config?.menu ?? {};
    };

    private getGridApi = () => this.gridApi;

    //
    // working with data source
    //

    private isAgGridRerenderNeeded(props: ICorePivotTableProps, prevProps: ICorePivotTableProps): boolean {
        const propsRequiringAgGridRerender = [["config", "menu"]];
        return propsRequiringAgGridRerender.some(
            (propKey) => !isEqual(get(props, propKey), get(prevProps, propKey)),
        );
    }

    private setGridDataSource(dataSource: IDatasource) {
        if (this.gridApi) {
            this.gridApi.setDatasource(dataSource);
        }
    }

    //
    // column resizing stuff
    //

    private isColumnAutoresizeEnabled = (props: ICorePivotTableProps = this.props) => {
        return this.getDefaultWidthFromProps(props) === "viewport";
    };

    private isGrowToFitEnabled = (props: ICorePivotTableProps = this.props) => {
        return props.config?.columnSizing?.growToFit === true;
    };

    private getColumnWidths = (props: ICorePivotTableProps): ColumnWidthItem[] | undefined => {
        return props.config?.columnSizing?.columnWidths;
    };

    private hasColumnWidths = () => {
        return !!this.getColumnWidths(this.props);
    };

    private getDefaultWidthFromProps = (props: ICorePivotTableProps): DefaultColumnWidth => {
        return props.config?.columnSizing?.defaultWidth ?? "unset";
    };

    private getColumnIds = (columns: Column[]): string[] => {
        return columns.map((column: Column) => column.getColId());
    };

    private getAutoResizedColumns = (columns: Column[]): IResizedColumns => {
        return columns.reduce((acc, col) => {
            const columnId = getColumnIdentifier(col);
            const resizedColumn = acc[columnId];
            if (resizedColumn) {
                return acc;
            }
            return {
                ...acc,
                [columnId]: {
                    width: col.getActualWidth(),
                },
            };
        }, this.autoResizedColumns);
    };

    private autoresizeVisibleColumns = async (
        columnApi: ColumnApi,
        previouslyResizedColumnIds: string[],
        firstCall: boolean = true,
    ): Promise<void> => {
        if (!this.shouldPerformAutoresize()) {
            return Promise.resolve();
        }

        if (!this.isColumnAutoresizeEnabled()) {
            return Promise.resolve();
        }

        if (firstCall) {
            await sleep(COLUMN_RESIZE_TIMEOUT);
        }

        const displayedVirtualColumns = columnApi.getAllDisplayedVirtualColumns();
        const autoWidthColumnIds: string[] = this.getColumnIds(displayedVirtualColumns);

        if (previouslyResizedColumnIds.length >= autoWidthColumnIds.length) {
            this.autoResizedColumns = this.getAutoResizedColumns(columnApi.getAllDisplayedVirtualColumns());
            return Promise.resolve();
        }

        const newColumnIds = difference(autoWidthColumnIds, previouslyResizedColumnIds);

        this.autoresizeColumnsByColumnId(columnApi, newColumnIds);

        await sleep(COLUMN_RESIZE_TIMEOUT);
        this.autoresizeVisibleColumns(columnApi, autoWidthColumnIds, false);
    };

    private autoresizeColumnsByColumnId(columnApi: ColumnApi, columnIds: string[]) {
        setColumnMaxWidth(columnApi, columnIds, AUTO_SIZED_MAX_WIDTH);

        columnApi.autoSizeColumns(columnIds);
        // await sleep(COLUMN_RESIZE_TIMEOUT);

        setColumnMaxWidth(columnApi, columnIds, MANUALLY_SIZED_MAX_WIDTH);
    }

    private shouldPerformAutoresize() {
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
    }

    private isPivotTableReady = (api: GridApi) => {
        const noRowHeadersOrRows = () => {
            return this.visibleData.rawData().isEmpty() && this.visibleData.meta().hasNoHeadersInDim(0);
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

    private autoresizeColumns = async (
        event: AgGridEvent,
        force: boolean = false,
        previouslyResizedColumnIds: string[] = [],
    ) => {
        const alreadyResized = () => this.state.resized || this.resizing;

        if (this.isPivotTableReady(event.api) && (!alreadyResized() || (alreadyResized() && force))) {
            this.resizing = true;
            // we need to know autosize width for each column, even manually resized ones, to support removal of columnWidth def from props
            await this.autoresizeVisibleColumns(event.columnApi, previouslyResizedColumnIds);
            // after that we need to reset manually resized columns back to its manually set width by growToFit or by helper. See UT resetColumnsWidthToDefault for width priorities
            if (this.isGrowToFitEnabled()) {
                this.growToFit(event.columnApi);
            } else if (this.shouldPerformAutoresize() && this.isColumnAutoresizeEnabled()) {
                const columns = this.columnApi.getAllColumns();
                this.resetColumnsWidthToDefault(this.columnApi, columns);
            }
            this.resizing = false;
            this.setState({
                resized: true,
            });
        }
    };

    private isColumnAutoResized(resizedColumnId: string) {
        return isColumnAutoResized(this.autoResizedColumns, resizedColumnId);
    }

    private resetColumnsWidthToDefault(columnApi: ColumnApi, columns: Column[]) {
        resetColumnsWidthToDefault(
            columnApi,
            columns,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            this.getDefaultWidth(),
        );
    }

    private setFittedColumns(columnApi: ColumnApi) {
        const columns = columnApi.getAllColumns();

        columns.forEach((col) => {
            const id = getColumnIdentifier(col);

            this.growToFittedColumns[id] = {
                width: col.getActualWidth(),
            };
        });
    }

    private growToFit(columnApi: ColumnApi) {
        if (!this.isGrowToFitEnabled()) {
            return;
        }
        const clientWidth = this.containerRef && this.containerRef.clientWidth;

        if (clientWidth === 0) {
            return;
        }

        const columns = columnApi.getAllColumns();
        this.resetColumnsWidthToDefault(columnApi, columns);
        this.clearFittedColumns();

        const widths = columns.map((column) => column.getActualWidth());
        const sumOfWidths = widths.reduce((a, b) => a + b, 0);

        if (sumOfWidths < clientWidth) {
            const columnIds = this.getColumnIds(columns);
            setColumnMaxWidth(columnApi, columnIds, undefined);
            this.gridApi.sizeColumnsToFit();
            setColumnMaxWidthIf(
                columnApi,
                columnIds,
                MANUALLY_SIZED_MAX_WIDTH,
                (column: Column) => column.getActualWidth() <= MANUALLY_SIZED_MAX_WIDTH,
            );
            this.setFittedColumns(columnApi);
        }
    }

    private mapFieldIdToGridId(columnApi: ColumnApi, fieldIds: string[]) {
        const columns = columnApi.getAllColumns();

        return columns.filter((d) => fieldIds.includes(getColumnIdentifier(d))).map((d) => d.getColId());
    }

    private gridSizeChanged = async (gridSizeChangedEvent: any) => {
        if (
            !this.resizing &&
            (this.lastResizedWidth !== gridSizeChangedEvent.clientWidth ||
                this.lastResizedHeight !== gridSizeChangedEvent.clientHeight)
        ) {
            this.lastResizedWidth = gridSizeChangedEvent.clientWidth;
            this.lastResizedHeight = gridSizeChangedEvent.clientHeight;

            const resizedColumnsGridIds = this.mapFieldIdToGridId(
                gridSizeChangedEvent.columnApi,
                Object.keys(this.autoResizedColumns),
            );
            this.autoresizeColumns(gridSizeChangedEvent, true, resizedColumnsGridIds);
        }
    };

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
        const isTableRendered = this.shouldAutoResizeColumns()
            ? this.state.resized
            : this.isPivotTableReady(this.gridApi);
        if (missingContainerRef || isTableRendered) {
            this.stopWatchingTableRendered();
        }
    };

    private stopWatchingTableRendered = () => {
        clearInterval(this.watchingIntervalId);
        this.watchingIntervalId = null;

        this.props.afterRender();
    };

    //
    // event handlers - ag-grid
    //

    private onGridReady = (event: GridReadyEvent) => {
        this.gridApi = event.api;
        this.columnApi = event.columnApi;
        this.setGridDataSource(this.agGridDataSource);
        this.updateDesiredHeight(this.visibleData);

        if (this.props.groupRows) {
            initializeStickyRow(this.gridApi);
        }
    };

    private onFirstDataRendered = async (event: AgGridEvent) => {
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
        const shouldAutoresizeColumns = this.isColumnAutoresizeEnabled();
        const growToFit = this.isGrowToFitEnabled();

        if (shouldAutoresizeColumns) {
            await this.autoresizeColumns(event);
        } else if (this.columnApi && growToFit) {
            this.growToFit(this.columnApi);
        }

        this.updateStickyRow();
    };

    private shouldAutoResizeColumns = () => {
        const columnAutoresize = this.isColumnAutoresizeEnabled();
        const growToFit = this.isGrowToFitEnabled();
        return columnAutoresize || growToFit;
    };

    private onModelUpdated = () => {
        this.updateStickyRow();
    };

    private gridColumnsChanged = () => {
        this.updateStickyRow();
    };

    private getAttributeHeader(colId: string, columnDefs: IGridHeader[]): IAttributeDescriptor {
        const matchingColDef: IGridHeader = columnDefs.find(
            (columnDef: IGridHeader) => columnDef.field === colId,
        );
        if (matchingColDef && matchingColDef.drillItems.length === 1) {
            const drillItemHeader = matchingColDef.drillItems[0];
            if (isAttributeDescriptor(drillItemHeader)) {
                return drillItemHeader;
            }
        }
        return null;
    }

    private getItemAndAttributeHeaders = (
        attributeItemHeaders: { [colId: string]: IMappingHeader },
        columnDefs: IGridHeader[],
    ): IMappingHeader[] => {
        return Object.keys(attributeItemHeaders).reduce((headers: IMappingHeader[], colId: string) => {
            const attributeHeader = this.getAttributeHeader(colId, columnDefs);
            if (attributeHeader) {
                headers.push(attributeItemHeaders[colId]);
                headers.push(attributeHeader);
            }
            return headers;
        }, []);
    };

    private getAttributeDrillItemsForMeasureDrill = (
        cellEvent: IGridCellEvent,
        columnDefs: IGridHeader[],
    ): IMappingHeader[] => {
        const rowDrillItems = get(cellEvent, ["data", "headerItemMap"]);
        return this.getItemAndAttributeHeaders(rowDrillItems, columnDefs);
    };

    private getAttributeDrillItemsForAttributeDrill = (
        cellEvent: IGridCellEvent,
        columnDefs: IGridHeader[],
        rowDrillItem: IMappingHeader,
    ): IMappingHeader[] => {
        const attributeHeaders = this.getAttributeDrillItemsForMeasureDrill(cellEvent, columnDefs);

        // pick whole path up to current attributeHeader and attributeHeaderItem (inclusive)
        const index = attributeHeaders.indexOf(rowDrillItem);
        return attributeHeaders.slice(0, index + 2);
    };

    private isSomeTotal = (rowType: string) => {
        const isRowTotal = rowType === ROW_TOTAL;
        const isRowSubtotal = rowType === ROW_SUBTOTAL;
        return isRowTotal || isRowSubtotal;
    };

    private getRowDrillItem = (cellEvent: IGridCellEvent) =>
        get(cellEvent, ["data", "headerItemMap", cellEvent.colDef.field]);

    private getDrillItems = (cellEvent: IGridCellEvent): IMappingHeader[] => {
        const { colDef } = cellEvent;
        const rowDrillItem = this.getRowDrillItem(cellEvent);
        return rowDrillItem ? [rowDrillItem, ...colDef.drillItems] : colDef.drillItems;
    };

    private getDrillIntersection = (
        cellEvent: IGridCellEvent,
        drillItems: IMappingHeader[],
        allHeaders: IGridHeader[],
    ): IDrillEventIntersectionElement[] => {
        const rowDrillItem = this.getRowDrillItem(cellEvent);
        const completeDrillItems: IMappingHeader[] = rowDrillItem
            ? this.getAttributeDrillItemsForAttributeDrill(cellEvent, allHeaders, rowDrillItem)
            : [...drillItems, ...this.getAttributeDrillItemsForMeasureDrill(cellEvent, allHeaders)];
        return getDrillIntersection(completeDrillItems);
    };

    private cellClicked = (cellEvent: IGridCellEvent) => {
        const { onDrill } = this.props;
        const tableHeaders = this.tableHeaders;
        const dv = this.visibleData;
        const drillablePredicates = this.getDrillablePredicates();
        const { colDef, rowIndex } = cellEvent;
        const rowType = get(cellEvent, ["data", "type"], "");
        if (this.isSomeTotal(rowType)) {
            return false;
        }

        const drillItems: IMappingHeader[] = this.getDrillItems(cellEvent);
        const drillableHeaders = drillItems.filter((drillItem: IMappingHeader) =>
            isSomeHeaderPredicateMatched(drillablePredicates, drillItem, dv),
        );

        if (drillableHeaders.length === 0) {
            return false;
        }

        const leafColumnDefs = getTreeLeaves(tableHeaders.allHeaders);
        const columnIndex = leafColumnDefs.findIndex((gridHeader) => gridHeader.field === colDef.field);
        const row = getDrillRowData(leafColumnDefs, cellEvent.data);
        const intersection = this.getDrillIntersection(cellEvent, drillItems, tableHeaders.allHeaders);

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

    private isManualResizing(columnEvent: ColumnResizedEvent) {
        return columnEvent && columnEvent.source === ColumnEventSourceType.UI_DRAGGED && columnEvent.columns;
    }

    private getDefaultWidth = () => {
        return DEFAULT_COLUMN_WIDTH;
    };

    private async resetResizedColumn(column: Column) {
        const id = getColumnIdentifier(column);

        if (this.resizedColumnsStore.isColumnManuallyResized(column)) {
            this.resizedColumnsStore.removeFromManuallyResizedColumn(column);
        }

        column.getColDef().suppressSizeToFit = false;

        if (this.isColumnAutoResized(id)) {
            this.columnApi.setColumnWidth(column, this.autoResizedColumns[id].width);
            return;
        }

        this.autoresizeColumnsByColumnId(this.columnApi, this.getColumnIds([column]));
        if (isColumnDisplayed(this.columnApi.getAllDisplayedVirtualColumns(), column)) {
            // skip columns out of viewport because these can not be autoresized
            this.resizedColumnsStore.addToManuallyResizedColumn(column, true);
        }
    }

    private onGridColumnResized = async (columnEvent: ColumnResizedEvent) => {
        if (!columnEvent.finished) {
            return; // only update the height once the user is done setting the column size
        }

        this.updateDesiredHeight(this.visibleData);

        if (this.isManualResizing(columnEvent)) {
            this.numberOfColumnResizedCalls++;
            await sleep(COLUMN_RESIZE_TIMEOUT);

            if (this.numberOfColumnResizedCalls === UIClick.DOUBLE_CLICK) {
                this.numberOfColumnResizedCalls = 0;
                await this.onColumnsManualReset(columnEvent.columns);
            } else if (this.numberOfColumnResizedCalls === UIClick.CLICK) {
                this.numberOfColumnResizedCalls = 0;
                this.onColumnsManualResized(columnEvent.columns);
            }
        }
    };

    private getAllMeasureColumns() {
        return this.columnApi.getAllColumns().filter((col) => isMeasureColumn(col));
    }

    private onColumnsManualReset = async (columns: Column[]) => {
        let columnsToReset = columns;

        if (this.isAllMeasureResizeOperation(columns)) {
            this.resizedColumnsStore.removeAllMeasureColumns();
            columnsToReset = this.getAllMeasureColumns();
        }

        if (this.isWeakMeasureResizeOperation(columns)) {
            columnsToReset = this.resizedColumnsStore.getMatchingColumnsByMeasure(
                columns[0],
                this.getAllMeasureColumns(),
            );
            this.resizedColumnsStore.removeWeakMeasureColumn(columns[0]);
        }

        for (const column of columnsToReset) {
            await this.resetResizedColumn(column);
        }

        this.afterOnResizeColumns();
    };

    private isAllMeasureResizeOperation(columns: Column[]) {
        return this.isMetaOrCtrlKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    private isWeakMeasureResizeOperation(columns: Column[]) {
        return this.isAltKeyPressed && columns.length === 1 && isMeasureColumn(columns[0]);
    }

    private onColumnsManualResized = (columns: Column[]) => {
        if (this.isAllMeasureResizeOperation(columns)) {
            resizeAllMeasuresColumns(this.columnApi, this.resizedColumnsStore, columns[0]);
        } else if (this.isWeakMeasureResizeOperation(columns)) {
            resizeWeakMeasureColumns(this.columnApi, this.resizedColumnsStore, columns[0]);
        } else {
            columns.forEach((column) => {
                this.resizedColumnsStore.addToManuallyResizedColumn(column);
            });
        }

        this.afterOnResizeColumns();
    };

    private afterOnResizeColumns() {
        this.growToFit(this.columnApi);
        const columnWidths = this.resizedColumnsStore.getColumnWidthsFromMap(this.visibleData);
        this.props.onColumnResized(columnWidths);
    }

    private sortChanged = (event: SortChangedEvent): void => {
        if (!this.currentResult) {
            // eslint-disable-next-line no-console
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortModel: ISortModelItem[] = event.columnApi
            .getAllColumns()
            .filter((col) => col.getSort() !== undefined && col.getSort() !== null)
            .map((col) => ({
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

    private onContainerMouseDown = (event: MouseEvent) => {
        if (event.target && this.isHeaderResizer(event.target as HTMLElement)) {
            event.stopPropagation();
        }
        this.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
        this.isAltKeyPressed = event.altKey;
    };

    //
    // grid options & styling;
    // TODO: refactor to move all this outside of the file
    //
    private createGridOptions = (): ICustomGridOptions => {
        const tableHeaders = this.tableHeaders;
        const { pageSize } = this.props;
        const totalRowCount = this.visibleData.rawData().firstDimSize();
        const separators = get(this.props, ["config", "separators"], undefined);

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
            getExecutionDefinition: this.getExecutionDefinition,
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
                    menu: this.getMenuConfig,
                    enableSorting: true,
                    ...commonHeaderComponentParams,
                },
                minWidth: MIN_WIDTH,
                sortable: true,
                resizable: true,
            },
            defaultColGroupDef: {
                headerClass: this.getHeaderClass(null),
                children: [],
                headerGroupComponentFramework: ColumnGroupHeader as any,
                headerGroupComponentParams: {
                    menu: this.getMenuConfig,
                    ...commonHeaderComponentParams,
                },
            },
            onCellClicked: this.cellClicked,
            onSortChanged: this.sortChanged,
            onColumnResized: this.onGridColumnResized,
            onGridSizeChanged: this.gridSizeChanged,
            onGridColumnsChanged: this.gridColumnsChanged,
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

            // this provides persistent row selection (if enabled)
            getRowNodeId,

            // Column types
            columnTypes: {
                [ROW_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass("gd-row-attribute-column"),
                    headerClass: this.getHeaderClass("gd-row-attribute-column-header"),
                    colSpan: (params) => {
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
                    valueFormatter: (params) => {
                        return params.value === undefined ? null : params.value;
                    },
                    cellRenderer,
                },
                [COLUMN_ATTRIBUTE_COLUMN]: {
                    cellClass: this.getCellClass("gd-column-attribute-column"),
                    headerClass: this.getHeaderClass("gd-column-attribute-column-header"),
                },
                [MEASURE_COLUMN]: {
                    cellClass: this.getCellClass(cx(AG_NUMERIC_CELL_CLASSNAME, "gd-measure-column")),
                    headerClass: this.getHeaderClass(
                        cx(AG_NUMERIC_HEADER_CLASSNAME, "gd-measure-column-header"),
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
                    cellStyle: (params) => {
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
            autoSizePadding: DEFAULT_AUTOSIZE_PADDING,
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

        return cx(
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
        const { field, measureIndex, index } = colDef;
        const treeIndexes = colDef
            ? indexOfTreeNode(
                  colDef,
                  this.tableHeaders.allHeaders,
                  (nodeA, nodeB) => nodeA.field !== undefined && nodeA.field === nodeB.field,
              )
            : null;
        const colGroupIndex = treeIndexes ? treeIndexes[treeIndexes.length - 1] : null;
        const isFirstColumn = treeIndexes !== null && !treeIndexes.some((index) => index !== 0);

        return cx(
            classList,
            "gd-column-group-header",
            colGroupIndex !== null ? `gd-column-group-header-${colGroupIndex}` : null,
            colGroupIndex !== null ? `s-table-measure-column-header-group-cell-${colGroupIndex}` : null,
            measureIndex !== null && measureIndex !== undefined
                ? `s-table-measure-column-header-cell-${measureIndex}`
                : null,
            index ? `s-table-measure-column-header-index-${index}` : null,
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
        const aggregationCount = sumBy(dv.rawData().totals(), (total) => total.length);
        const rowCount = dv.rawData().firstDimSize();

        const headerHeight = ApiWrapper.getHeaderHeight(this.gridApi);

        // add small room for error to avoid scrollbars that scroll one, two pixels
        // increased in order to resolve issue BB-1509
        const leeway = 2;

        const bodyHeight = rowCount * DEFAULT_ROW_HEIGHT + leeway;
        const footerHeight = aggregationCount * DEFAULT_ROW_HEIGHT;

        return headerHeight + bodyHeight + footerHeight;
    }

    private scrollBarExists(): boolean {
        const { scrollWidth, clientWidth } = document.getElementsByClassName(
            "ag-body-horizontal-scroll-viewport",
        )[0];
        return scrollWidth > clientWidth ? true : false;
    }

    private getScrollBarPadding(): number {
        if (!this.gridApi) {
            return 0;
        }

        if (!this.containerRef) {
            return 0;
        }

        // check for scrollbar presence
        return this.scrollBarExists() ? getScrollbarWidth() : 0;
    }

    private calculateDesiredHeight(dv: DataViewFacade): number {
        const { maxHeight } = this.props.config;
        if (!maxHeight) {
            return;
        }

        const totalHeight = this.getTotalBodyHeight(dv) + this.getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    }

    private updateDesiredHeight(dv: DataViewFacade | null): void {
        if (!dv) {
            return;
        }

        const desiredHeight = this.calculateDesiredHeight(dv);

        if (this.state.desiredHeight !== desiredHeight) {
            this.setState({ desiredHeight });
        }
    }

    private isHeaderResizer(target: HTMLElement) {
        return target.classList.contains("ag-header-cell-resize");
    }
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
