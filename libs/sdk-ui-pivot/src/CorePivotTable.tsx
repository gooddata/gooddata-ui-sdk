// (C) 2007-2019 GoodData Corporation
import {
    AgGridEvent,
    AllCommunityModules,
    BodyScrollEvent,
    CellClassParams,
    CellEvent,
    ColDef,
    ColGroupDef,
    Column,
    ColumnApi,
    ColumnResizedEvent,
    GridApi,
    GridReadyEvent,
    IDatasource,
    SortChangedEvent,
    ValueFormatterParams,
} from "@ag-grid-community/all-modules";
import {
    IAttributeDescriptor,
    IDataView,
    IDimensionDescriptor,
    IExecutionResult,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IPreparedExecution,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isNoDataError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { defFingerprint, defTotals, ITotal } from "@gooddata/sdk-model";
import { AgGridReact } from "@ag-grid-community/react";
import cx from "classnames";
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
    GoodDataSdkError,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
    IDrillEvent,
    IDrillEventContextTable,
    IErrorDescriptors,
    IHeaderPredicate,
    ILoadingState,
    IntlWrapper,
    LoadingComponent,
    newErrorMapping,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { getUpdatedColumnTotals } from "./impl/structure/headers/aggregationsMenuHelper";
import ApiWrapper from "./impl/base/agGridApiWrapper";
import {
    AVAILABLE_TOTALS,
    COLS_PER_PAGE,
    COLUMN_ATTRIBUTE_COLUMN,
    MEASURE_COLUMN,
    ROW_ATTRIBUTE_COLUMN,
    ROW_SUBTOTAL,
    ROW_TOTAL,
} from "./impl/base/constants";
import { AgGridDatasource, createAgGridDatasource } from "./impl/data/dataSource";
import { ICustomGridOptions } from "./impl/base/agGridTypes";
import { isMeasureColumn } from "./impl/base/agGridUtils";
import ColumnGroupHeader from "./impl/structure/headers/ColumnGroupHeader";
import ColumnHeader from "./impl/structure/headers/ColumnHeader";
import { getScrollbarWidth, sleep } from "./impl/utils";
import { IGroupingProvider } from "./impl/data/rowGroupingProvider";
import { RowLoadingElement } from "./impl/data/RowLoadingElement";
import {
    initializeStickyRow,
    IScrollPosition,
    stickyRowExists,
    updateStickyRowContentClassesAndData,
    updateStickyRowPosition,
} from "./impl/stickyRowHandler";

import {
    createCellRenderer,
    getCellClassNames,
    getMeasureCellFormattedValue,
    getMeasureCellStyle,
} from "./impl/data/tableCell";

import { DefaultColumnWidth, ICorePivotTableProps, IMenu, IMenuAggregationClickConfig } from "./types";
import { setColumnMaxWidth, setColumnMaxWidthIf } from "./impl/base/agGridColumnWrapper";
import { ColumnEventSourceType, ColumnWidthItem, IResizedColumns, UIClick } from "./columnWidths";
import {
    AUTO_SIZED_MAX_WIDTH,
    autoresizeAllColumns,
    getAutoResizedColumns,
    isColumnAutoResized,
    MANUALLY_SIZED_MAX_WIDTH,
    MIN_WIDTH,
    resetColumnsWidthToDefault,
    resizeAllMeasuresColumns,
    ResizedColumnsStore,
    resizeWeakMeasureColumns,
    syncSuppressSizeToFitOnColumns,
    updateColumnDefinitionsWithWidths,
} from "./impl/resizing/agGridColumnSizing";
import { fixEmptyHeaderItems } from "@gooddata/sdk-ui-vis-commons";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import sumBy from "lodash/sumBy";
import {
    agColId,
    ColumnGroupingDescriptorId,
    isDataColLeaf,
    isDataColRootGroup,
    isSliceCol,
} from "./impl/structure/tableDescriptorTypes";
import { invariant } from "ts-invariant";
import { TableDescriptor } from "./impl/structure/tableDescriptor";
import { ICommonHeaderParams } from "./impl/structure/headers/HeaderCell";
import { createDrilledRow } from "./impl/drilling/drilledRowFactory";
import isEmpty from "lodash/isEmpty";
import { createDrillIntersection } from "./impl/drilling/drillIntersectionFactory";
import { IGridRow } from "./impl/data/resultTypes";
import { isSomeTotal } from "./impl/data/dataSourceUtils";
import last from "lodash/last";
import { isCellDrillable } from "./impl/drilling/cellDrillabilityPredicate";
import debounce from "lodash/debounce";

const AG_NUMERIC_CELL_CLASSNAME = "ag-numeric-cell";
const AG_NUMERIC_HEADER_CLASSNAME = "ag-numeric-header";
const DEFAULT_ROW_HEIGHT = 28;

/**
 * DEFAULT_AUTOSIZE_PADDING needs to match real padding from styles
 */
const DEFAULT_AUTOSIZE_PADDING = 12;
const HEADER_CELL_BORDER = 1;
const COLUMN_RESIZE_TIMEOUT = 300;
const AGGRID_ON_RESIZE_TIMEOUT = 300;

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

    private readonly errorMap: IErrorDescriptors;

    private containerRef: HTMLDivElement;

    private unmounted: boolean = false;

    private gridApi: GridApi | null = null;
    private columnApi: ColumnApi | null = null;
    private gridOptions: ICustomGridOptions | null = null;
    private tableDescriptor: TableDescriptor | null = null;
    private agGridDataSource: AgGridDatasource | null = null;

    private currentResult: IExecutionResult | null = null;
    private visibleData: DataViewFacade | null = null;
    private currentFingerprint: string | null = null;

    /**
     * Fingerprint of the last execution definition the initialize was called with.
     */
    private lastInitRequestFingerprint: string | null = null;

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
    private numberOfColumnResizedCalls = 0;
    private isMetaOrCtrlKeyPressed = false;
    private isAltKeyPressed = false;

    private lastResizedWidth = 0;
    private lastResizedHeight = 0;
    private readonly debouncedGridSizeChanged: (gridSizeChangedEvent: any) => Promise<void> | undefined;

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
        this.debouncedGridSizeChanged = debounce(this.gridSizeChanged, AGGRID_ON_RESIZE_TIMEOUT);
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
        this.tableDescriptor = null;
        this.agGridDataSource = null;
        this.currentResult = null;
        this.visibleData = null;
        this.currentFingerprint = null;
        this.lastInitRequestFingerprint = null;
        this.firstDataRendered = false;
        this.resizedColumnsStore = new ResizedColumnsStore();
        this.autoResizedColumns = {};
        this.clearFittedColumns();

        this.lastScrollPosition = {
            top: 0,
            left: 0,
        };
        this.lastResizedHeight = 0;
        this.lastResizedWidth = 0;

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

        const rowAttributeItems = dv
            .meta()
            .attributeDescriptorsForDim(0)
            .map((attribute: IAttributeDescriptor) => ({
                attribute,
            }));

        return {
            measures: measureDescriptors,
            attributes: rowAttributeItems,
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

    private fixEmptyHeaders = (dataView: IDataView): void => {
        fixEmptyHeaderItems(
            dataView,
            `(${this.props.intl.formatMessage({ id: "visualization.emptyValue" })})`,
        );
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
        this.tableDescriptor = TableDescriptor.for(this.visibleData);

        const columnWidths = this.getColumnWidths(this.props);
        this.resizedColumnsStore.updateColumnWidths(this.tableDescriptor, columnWidths);

        updateColumnDefinitionsWithWidths(
            this.tableDescriptor,
            this.resizedColumnsStore,
            this.autoResizedColumns,
            this.getDefaultWidth(),
            this.isGrowToFitEnabled(),
            this.growToFittedColumns,
        );

        this.agGridDataSource = createAgGridDatasource(
            {
                tableDescriptor: this.tableDescriptor,
                getGroupRows: this.getGroupRows,
                getColumnTotals: this.getColumnTotals,
                onPageLoaded: this.onPageLoaded,
                dataViewTransform: (dataView) => {
                    this.fixEmptyHeaders(dataView);
                    return dataView;
                },
            },
            this.visibleData,
            this.getGridApi as () => GridApi,
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

                        this.fixEmptyHeaders(dataView);

                        this.initializeNonReactState(result, dataView);

                        this.onLoadingChanged({ isLoading: false });
                        this.props.onExportReady!(
                            createExportFunction(this.currentResult!, this.props.exportTitle),
                        );
                        this.setState({ tableReady: true });

                        const availableDrillTargets = this.getAvailableDrillTargets(this.visibleData!);
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
                            const availableDrillTargets = this.getAvailableDrillTargetsFromExecutionResult(
                                result,
                            );

                            this.props.pushData!({ availableDrillTargets });
                        }

                        /*
                         * There can be situations, where there is no data to visualize but the result / dataView contains
                         * metadata essential for setup of drilling. Look for that and if available push up.
                         */
                        if (isNoDataError(error) && error.dataView) {
                            const availableDrillTargets = this.getAvailableDrillTargets(
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
                this.gridApi?.refreshHeader();
            }

            if (this.isGrowToFitEnabled() && !this.isGrowToFitEnabled(prevProps)) {
                this.growToFit(this.columnApi!);
            }

            const prevColumnWidths = this.getColumnWidths(prevProps);
            const columnWidths = this.getColumnWidths(this.props);

            if (!isEqual(prevColumnWidths, columnWidths)) {
                this.applyColumnSizes(columnWidths);
            }
        }
    }

    private applyColumnSizes(columnWidths: ColumnWidthItem[] | undefined) {
        if (!this.columnApi || !this.tableDescriptor) {
            return;
        }

        this.resizedColumnsStore.updateColumnWidths(this.tableDescriptor, columnWidths);

        syncSuppressSizeToFitOnColumns(this.tableDescriptor, this.resizedColumnsStore, this.columnApi);

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

        if (this.isTableInitializing()) {
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

            onExportReady!(createExportErrorFunction(error));

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

    private getTableDescriptor = () => {
        invariant(this.tableDescriptor);

        return this.tableDescriptor;
    };

    private getExecutionDefinition = () => {
        return this.props.execution.definition;
    };

    private getDataView = () => {
        invariant(this.visibleData);

        return this.visibleData;
    };

    private getGroupRows = (): boolean => {
        return this.props.config?.groupRows ?? true;
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

    private getColumnIds = (columns: Column[]): string[] => {
        return columns.map((column: Column) => column.getColId());
    };

    private autoresizeColumnsByColumnId(columnApi: ColumnApi, columnIds: string[]) {
        setColumnMaxWidth(columnApi, columnIds, AUTO_SIZED_MAX_WIDTH);

        columnApi.autoSizeColumns(columnIds);

        setColumnMaxWidth(columnApi, columnIds, MANUALLY_SIZED_MAX_WIDTH);
    }

    private updateAutoResizedColumns = (gridApi: GridApi, columnApi: ColumnApi): void => {
        this.autoResizedColumns = getAutoResizedColumns(
            this.tableDescriptor,
            gridApi,
            columnApi,
            this.currentResult,
            this.containerRef,
            {
                measureHeaders: true,
                padding: 2 * DEFAULT_AUTOSIZE_PADDING + HEADER_CELL_BORDER,
                separators: this.getSeparators(),
            },
        );
    };

    private autoresizeAllColumns = async (gridApi: GridApi, columnApi: ColumnApi) => {
        if (!this.shouldPerformAutoresize() || !this.isColumnAutoresizeEnabled()) {
            return Promise.resolve();
        }

        await sleep(COLUMN_RESIZE_TIMEOUT);

        /*
         * Ensures correct autoResizeColumns
         */
        this.updateAutoResizedColumns(gridApi, columnApi);
        autoresizeAllColumns(columnApi, this.autoResizedColumns);
    };

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
            return Boolean(
                this.visibleData?.rawData().isEmpty() && this.visibleData.meta().hasNoHeadersInDim(0),
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

    private autoresizeColumns = async (api: GridApi, columnApi: ColumnApi, force: boolean = false) => {
        const alreadyResized = () => this.state.resized || this.resizing;
        if (this.isPivotTableReady(api) && (!alreadyResized() || (alreadyResized() && force))) {
            this.resizing = true;
            // we need to know autosize width for each column, even manually resized ones, to support removal of columnWidth def from props
            await this.autoresizeAllColumns(api, columnApi);
            // after that we need to reset manually resized columns back to its manually set width by growToFit or by helper. See UT resetColumnsWidthToDefault for width priorities
            if (this.isGrowToFitEnabled()) {
                this.growToFit(columnApi);
            } else if (this.shouldPerformAutoresize() && this.isColumnAutoresizeEnabled()) {
                const columns = this.columnApi!.getAllColumns();
                this.resetColumnsWidthToDefault(this.columnApi!, columns);
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
            this.tableDescriptor!,
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
            const id = agColId(col);

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
            this.gridApi?.sizeColumnsToFit();
            setColumnMaxWidthIf(
                columnApi,
                columnIds,
                MANUALLY_SIZED_MAX_WIDTH,
                (column: Column) => column.getActualWidth() <= MANUALLY_SIZED_MAX_WIDTH,
            );
            this.setFittedColumns(columnApi);

            if (!this.state.resized && !this.resizing) {
                this.setState({
                    resized: true,
                });
            }
        }
    }

    //
    // event handlers - internal & funny stuff
    //

    private onPageLoaded = (dv: DataViewFacade): void => {
        const currentResult = dv.result();
        if (!this.currentResult?.equals(currentResult)) {
            this.props.onExportReady!(currentResult.export.bind(currentResult));
        }
        this.currentResult = currentResult;
        this.visibleData = dv;
        this.currentFingerprint = defFingerprint(this.currentResult.definition);

        this.updateDesiredHeight(dv);
    };

    private onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        const newColumnTotals = getUpdatedColumnTotals(this.getColumnTotals(), menuAggregationClickConfig);

        this.props.pushData!({
            properties: {
                totals: newColumnTotals,
            },
        });

        this.setState({ columnTotals: newColumnTotals }, () => {
            // make ag-grid refresh data
            // see: https://www.ag-grid.com/javascript-grid-infinite-scrolling/#changing-the-datasource
            this.setGridDataSource(this.agGridDataSource!);
        });
    };

    private startWatchingTableRendered = () => {
        const missingContainerRef = !this.containerRef; // table having no data will be unmounted, it causes ref null
        const isTableRendered = this.shouldAutoResizeColumns()
            ? this.state.resized
            : this.isPivotTableReady(this.gridApi!);
        const shouldCallAutoresizeColumns =
            this.isPivotTableReady(this.gridApi!) && !this.state.resized && !this.resizing;

        if (this.shouldAutoResizeColumns() && shouldCallAutoresizeColumns) {
            this.autoresizeColumns(this.gridApi!, this.columnApi!);
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
    // event handlers - ag-grid
    //

    private onGridReady = (event: GridReadyEvent) => {
        this.gridApi = event.api;
        this.columnApi = event.columnApi;
        this.setGridDataSource(this.agGridDataSource!);
        this.updateDesiredHeight(this.visibleData);

        if (this.getGroupRows()) {
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
            await this.autoresizeColumns(event.api, event.columnApi);
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

    private cellClicked = (cellEvent: CellEvent) => {
        invariant(this.tableDescriptor);
        invariant(this.visibleData);

        const row = cellEvent.data as IGridRow;

        invariant(row);

        if (isSomeTotal(row.type)) {
            return false;
        }

        const { colDef, data, rowIndex } = cellEvent;
        const col = this.tableDescriptor.getCol(colDef);

        // cells belong to either slice column or leaf data column; if cells belong to column of a different
        // type then there must be either something messed up with table construction or a new type of cell
        invariant(isSliceCol(col) || isDataColLeaf(col));

        const { onDrill } = this.props;
        const dv = this.visibleData;
        const drillablePredicates = this.getDrillablePredicates();

        const areDrillableHeaders = isCellDrillable(col, cellEvent.data, dv, drillablePredicates);

        if (!areDrillableHeaders) {
            return false;
        }

        const drillContext: IDrillEventContextTable = {
            type: VisualizationTypes.TABLE,
            element: "cell",
            columnIndex: this.tableDescriptor.getAbsoluteLeafColIndex(col),
            rowIndex,
            row: createDrilledRow(data as IGridRow, this.tableDescriptor),
            intersection: createDrillIntersection(cellEvent, this.tableDescriptor),
        };
        const drillEvent: IDrillEvent = {
            dataView: dv.dataView,
            drillContext,
        };

        if (onDrill?.(drillEvent)) {
            // This is needed for /analyze/embedded/ drilling with post message
            // More info: https://github.com/gooddata/gdc-analytical-designer/blob/develop/test/drillEventing/drillEventing_page.html
            const event = new CustomEvent("drill", {
                detail: drillEvent,
                bubbles: true,
            });
            cellEvent.event?.target?.dispatchEvent(event);
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

        this.autoresizeColumnsByColumnId(this.columnApi!, this.getColumnIds([column]));
        this.resizedColumnsStore.addToManuallyResizedColumn(column, true);
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
                await this.onColumnsManualReset(columnEvent.columns!);
            } else if (this.numberOfColumnResizedCalls === UIClick.CLICK) {
                this.numberOfColumnResizedCalls = 0;
                this.onColumnsManualResized(columnEvent.columns!);
            }
        }
    };

    private getAllMeasureColumns() {
        return this.columnApi!.getAllColumns().filter((col) => isMeasureColumn(col));
    }

    private getSeparators() {
        return get(this.props, ["config", "separators"], undefined);
    }

    private onColumnsManualReset = async (columns: Column[]) => {
        if (!this.tableDescriptor) {
            return;
        }

        let columnsToReset = columns;

        /*
         * Ensures that all columns have the correct width to use during column reset
         * resetResizedColumn uses updateAutoResizedColumns to properly reset columns
         */
        if (!Object.keys(this.autoResizedColumns).length) {
            this.updateAutoResizedColumns(this.gridApi!, this.columnApi!);
        }

        if (this.isAllMeasureResizeOperation(columns)) {
            this.resizedColumnsStore.removeAllMeasureColumns();
            columnsToReset = this.getAllMeasureColumns();
        }

        if (this.isWeakMeasureResizeOperation(columns)) {
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
            resizeAllMeasuresColumns(this.columnApi!, this.resizedColumnsStore, columns[0]);
        } else if (this.isWeakMeasureResizeOperation(columns)) {
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

        this.afterOnResizeColumns();
    };

    private afterOnResizeColumns() {
        this.growToFit(this.columnApi!);
        const columnWidths = this.resizedColumnsStore.getColumnWidthsFromMap(this.tableDescriptor!);
        this.props.onColumnResized!(columnWidths);
    }

    private sortChanged = (event: SortChangedEvent): void => {
        if (!this.tableDescriptor || !this.currentResult) {
            // eslint-disable-next-line no-console
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortItems = this.tableDescriptor.createSortItems(
            event.columnApi.getAllColumns(),
            this.currentResult.definition.sortBy,
        );

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

    private gridSizeChanged = async (gridSizeChangedEvent: any): Promise<void> => {
        if (
            this.firstDataRendered &&
            !this.resizing &&
            (this.lastResizedWidth !== gridSizeChangedEvent.clientWidth ||
                this.lastResizedHeight !== gridSizeChangedEvent.clientHeight)
        ) {
            this.lastResizedWidth = gridSizeChangedEvent.clientWidth;
            this.lastResizedHeight = gridSizeChangedEvent.clientHeight;

            this.autoresizeColumns(this.gridApi!, this.columnApi!, true);
        }
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
        invariant(this.tableDescriptor);
        invariant(this.visibleData);

        const { colDefs } = this.tableDescriptor;
        const { pageSize } = this.props;
        const totalRowCount = this.visibleData.rawData().firstDimSize();
        const separators = get(this.props, ["config", "separators"], undefined);

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
            getDataView: this.getDataView,
            getColumnTotals: this.getColumnTotals,
            intl: this.props.intl,
        };

        // cellRenderer and getCellClass are shared by normal cells, sticky header cells and total cells
        // consider to use custom pinnedRowCellRenderer to simplify the logic
        const cellRenderer = createCellRenderer();

        return {
            // Initial data
            columnDefs: allColumnDefs,
            rowData: [],
            defaultColDef: {
                cellClass: this.getCellClass(),
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
                headerClass: this.getHeaderClass(),
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
            onGridSizeChanged: this.debouncedGridSizeChanged,

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
                    valueFormatter: (params: ValueFormatterParams) => {
                        invariant(this.tableDescriptor);

                        const colDesc = this.tableDescriptor.getCol(params.colDef);

                        invariant(isDataColLeaf(colDesc));

                        return params.value !== undefined
                            ? getMeasureCellFormattedValue(
                                  params.value,
                                  colDesc.seriesDescriptor.measureFormat(),
                                  separators,
                              )
                            : (null as any);
                    },
                    cellStyle: (params) => {
                        invariant(this.tableDescriptor);

                        const colDesc = this.tableDescriptor.getCol(params.colDef);

                        invariant(isDataColLeaf(colDesc));

                        return params.value !== undefined
                            ? getMeasureCellStyle(
                                  params.value,
                                  colDesc.seriesDescriptor.measureFormat(),
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
    private getCellClass = (classList?: string) => (cellClassParams: CellClassParams): string => {
        invariant(this.tableDescriptor);
        invariant(this.visibleData);

        const { rowIndex, data } = cellClassParams;
        const row: IGridRow = data;
        const isEmptyCell = !cellClassParams.value;
        // hide empty sticky cells
        const isTopPinned = cellClassParams.node.rowPinned === "top";

        if (isEmpty(row)) {
            // ag-grid calls getCellClass before the data is available & rows are created - there will be no
            // data in the cellClassParams. not sure what is the purpose or whether that is a bug. anyway it
            // does not make sense to proceed further.
            //
            // ag-grid may call this with either data undefined or data being empty object

            // empty row data are also possible for pinned row, when no cell should be visible
            return cx(classList, isTopPinned && isEmptyCell ? "gd-hidden-sticky-column" : null);
        }

        const dv = this.visibleData;
        const colDef = cellClassParams.colDef;
        const col = this.tableDescriptor.getCol(colDef);

        invariant(!isDataColRootGroup(col));

        const drillablePredicates = this.getDrillablePredicates();
        const isRowTotal = row.type === ROW_TOTAL;
        const isRowSubtotal = row.type === ROW_SUBTOTAL;
        let hasDrillableHeader = false;

        if (!isRowTotal && !isRowSubtotal && !isEmptyCell) {
            hasDrillableHeader = isCellDrillable(col, row, dv, drillablePredicates);
        }

        const colIndex = this.tableDescriptor.getAbsoluteLeafColIndex(col);
        const measureIndex = isDataColLeaf(col) ? last(col.fullIndexPathToHere) : undefined;
        const isPinnedRow = cellClassParams.node.isRowPinned();
        const hiddenCell = !isPinnedRow && this.getGroupingProvider().isRepeatedValue(col.id, rowIndex);
        const rowSeparator = !hiddenCell && this.getGroupingProvider().isGroupBoundary(rowIndex);
        const subtotalStyle = row?.subtotalStyle;

        return cx(
            classList,
            measureIndex !== undefined ? `gd-column-measure-${measureIndex}` : null,
            getCellClassNames(rowIndex, colIndex, hasDrillableHeader),
            `gd-column-index-${colIndex}`,
            isRowTotal ? "gd-row-total" : null,
            subtotalStyle ? `gd-table-row-subtotal gd-table-row-subtotal-${subtotalStyle}` : null,
            hiddenCell ? "gd-cell-hide s-gd-cell-hide" : null,
            rowSeparator ? "gd-table-row-separator s-gd-table-row-separator" : null,
            isTopPinned && isEmptyCell ? "gd-hidden-sticky-column" : null,
        );
    };

    private getHeaderClass = (classList?: string) => (headerClassParams: any): string => {
        invariant(this.tableDescriptor, "getHeaderClass requires table descriptor");

        const colDef: ColDef | ColGroupDef = headerClassParams.colDef;
        const colId = agColId(colDef);

        if (!colId) {
            return cx(classList);
        }

        if (colId === ColumnGroupingDescriptorId) {
            // This is the special, presentation-only ColGroupDef which communicates to the user
            // what attributes are used for grouping the column header.

            return cx(
                classList,
                "gd-column-group-header",
                "s-table-column-group-header-descriptor",
                !this.tableDescriptor.sliceColCount() ? "gd-column-group-header--first" : null,
            );
        } else {
            const colDesc = this.tableDescriptor.getCol(colId);
            const treeIndexes = colDesc.fullIndexPathToHere;
            const indexWithinGroup = treeIndexes ? treeIndexes[treeIndexes.length - 1] : undefined;
            const noLeftBorder =
                this.tableDescriptor.isFirstCol(colId) || !this.tableDescriptor.hasGroupedDataCols();
            const absoluteColIndex = isDataColLeaf(colDesc)
                ? this.tableDescriptor.getAbsoluteLeafColIndex(colDesc)
                : undefined;

            return cx(
                classList,
                "gd-column-group-header",
                // Funny stuff begin
                // NOTE: this funny stuff is here to mimic how selectors were originally created.it does not seem
                //  to make much sense :)
                indexWithinGroup !== undefined ? `gd-column-group-header-${indexWithinGroup}` : null,
                indexWithinGroup !== undefined
                    ? `s-table-measure-column-header-group-cell-${indexWithinGroup}`
                    : null,
                // Funny stuff end
                indexWithinGroup !== undefined && !isSliceCol(colDesc)
                    ? `s-table-measure-column-header-cell-${indexWithinGroup}`
                    : null,
                absoluteColIndex !== undefined
                    ? `s-table-measure-column-header-index-${absoluteColIndex}`
                    : null,
                noLeftBorder ? "gd-column-group-header--first" : null,
                !colDef.headerName ? "gd-column-group-header--empty" : null,
            );
        }
    };

    //
    // misc :)
    //
    private getGroupingProvider(): IGroupingProvider {
        return this.agGridDataSource!.getGroupingProvider();
    }

    private getDrillablePredicates(): IHeaderPredicate[] {
        return convertDrillableItemsToPredicates(this.props.drillableItems!);
    }

    private isStickyRowAvailable(): boolean {
        const gridApi = this.getGridApi();
        return Boolean(this.getGroupRows() && gridApi && stickyRowExists(gridApi));
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
            updateStickyRowContentClassesAndData(
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

        const headerHeight = ApiWrapper.getHeaderHeight(this.gridApi!);

        // add small room for error to avoid scrollbars that scroll one, two pixels
        // increased in order to resolve issue BB-1509
        const leeway = 2;

        const bodyHeight = rowCount * DEFAULT_ROW_HEIGHT + leeway;
        const footerHeight = aggregationCount * DEFAULT_ROW_HEIGHT;

        return headerHeight + bodyHeight + footerHeight;
    }

    private scrollBarExists(): boolean {
        const { scrollWidth, clientWidth } = this.containerRef.getElementsByClassName(
            "ag-body-horizontal-scroll-viewport",
        )[0];
        return scrollWidth > clientWidth;
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

    private calculateDesiredHeight(dv: DataViewFacade): number | undefined {
        const { maxHeight } = this.props.config!;
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

        /*
         * For some mysterious reasons, there sometimes is exactly 2px discrepancy between the current height
         * and the maxHeight coming from the config. This 2px seems to be unrelated to any CSS property (border,
         * padding, etc.) not even the leeway variable in getTotalBodyHeight.
         * In these cases there is a positive feedback loop between the maxHeight and the config:
         *
         * increase in desiredHeight -> increase in config.maxHeight -> increase in desiredHeight -> ...
         *
         * This causes the table to grow in height in 2px increments until it reaches its full size - then
         * the resizing stops as bodyHeight of the table gets smaller than the maxHeight and "wins"
         * in calculateDesiredHeight)...
         *
         * So we ignore changes smaller than those 2px to break the loop as it is quite unlikely that such a small
         * change would be legitimate (and if it is, a mismatch of 2px should not have practical consequences).
         *
         * Ideally, this maxHeight would not be needed at all (if I remove it altogether, the problem goes away),
         * however, it is necessary for ONE-4322 (there seems to be no native way of doing this in ag-grid itself).
         */
        const HEIGHT_CHANGE_TOLERANCE = 2;

        if (
            this.state.desiredHeight === undefined ||
            (desiredHeight !== undefined &&
                Math.abs(this.state.desiredHeight - desiredHeight) > HEIGHT_CHANGE_TOLERANCE)
        ) {
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
