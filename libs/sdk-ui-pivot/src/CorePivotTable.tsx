// (C) 2007-2025 GoodData Corporation
import React from "react";

import {
    AgGridEvent,
    AllCommunityModule,
    BodyScrollEvent,
    ColumnResizedEvent,
    GridReadyEvent,
    ModuleRegistry,
    PinnedRowDataChangedEvent,
    SortChangedEvent,
    provideGlobalGridOptions,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import { injectIntl } from "react-intl";
import { invariant } from "ts-invariant";
import { v4 as uuidv4 } from "uuid";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    DataViewFacade,
    GoodDataSdkError,
    IErrorDescriptors,
    ILoadingState,
    IPushData,
    IntlWrapper,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";

import { PivotTableError } from "./components/PivotTableError.js";
import { PivotTableLoading } from "./components/PivotTableLoading.js";
import { createDebouncedCallback, createStateBoundCallback } from "./components/utils/callbackHelpers.js";
import { ConfigDelegates, createConfigDelegates } from "./components/utils/configDelegation.js";
import {
    AGGRID_ON_RESIZE_TIMEOUT,
    PIVOT_TABLE_DEFAULT_PROPS,
    noop,
} from "./components/utils/pivotTableDefaults.js";
import { TableConfigAccessors } from "./impl/config/index.js";
import {
    AggregationEventHandlers,
    DataLoadingEventHandlers,
    DataRenderHandlers,
    GridEventHandlers,
    ResizeEventHandlers,
    ScrollEventHandlers,
    SortingEventHandlers,
} from "./impl/eventHandlers/index.js";
import { ExecutionAbortManager } from "./impl/execution/executionAbortManager.js";
import { createGridOptions } from "./impl/gridOptions.js";
import { HeightCalculationManager } from "./impl/height/heightCalculationManager.js";
import {
    ColumnResizingConfig,
    IMenuAggregationClickConfig,
    TableAgGridCallbacks,
    TableMethods,
} from "./impl/privateTypes.js";
import { StickyRowManager } from "./impl/stickyRow/stickyRowManager.js";
import { IScrollPosition } from "./impl/stickyRowHandler.js";
import { TableFacadeInitializer } from "./impl/tableFacadeInitializer.js";
import { ComponentUpdateAnalyzer } from "./impl/updates/componentUpdateAnalyzer.js";
import { getTotalsForColumnsBucket, sanitizeDefTotals } from "./impl/utils.js";
import { ICorePivotTableProps } from "./publicTypes.js";
import { ICorePivotTableState, InternalTableState } from "./tableState.js";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" });

/**
 * This class implements pivot table using the community version of ag-grid.
 *
 * Bear in mind that this is not a typical, standard React component implementation; the main reason
 * behind that is that while ag-grid comes with a React component the ag-grid itself is not a React component
 * and vast majority of its APIs are non-React as well. You will therefore find that there is a lot of non-react
 * state flying around.
 *
 * Instead of looking at this implementation as a typical React component, look at it like a adapter between
 * React and ag-grid which is used to render data obtained using GD executions.
 *
 * The code in this class is built to reflect the adapter nature of the integration. The responsibility of this
 * component is to correctly handle the component lifecycle and orchestrate integration of React and ag-grid, React
 * and GoodData, React and GoodData and ag-grid.
 *
 * Lifecycle
 * ---------
 *
 * The goal of the table is to render data that it obtains from GD platform by driving an execution. To this end
 * the prop 'execution' contains an instance of Prepared Execution which is all set up and ready to run.
 *
 * Before rendering anything, the code must first drive this prepared execution completion in order to figure out
 * how the actual table should look like header-wise.
 *
 * Once the execution completes successfully code will process the result and the metadata included within
 * to construct table headers for ag-grid and prepare an ag-grid data source that the ag-grid will use to read
 * pages of data from backend. Note: while constructing table headers, the code will also apply manual column
 * sizing settings.
 *
 * With this ready, the component can render the actual ag-grid table. It will create ag-grid options with
 * all the necessary metadata and customizations.
 *
 * After the table is successfully rendered, the code may (depending on props) apply grow-to-width and auto-resizing
 * logic on the table columns. And then finally it will determine and set the sticky row contents.
 *
 * At this point when the table is rendered, the users may interact with it and change sorting or add totals
 * or subtotals. All of this is handled outside of React. These changes are handled in the ag-grid data source
 * implementation. As it discovers that different sorts or totals are needed, it will transform the original
 * prepared execution, add the extra settings and re-drive the execution. Once done, it will update the internal
 * state and ping ag-grid API to re-render the table.
 *
 * In case the client changes props (say modifying the prepared execution) the componentDidUpdate will determine
 * whether the full reinitialization is in order. If so the entire existing ag-grid and all our internal state
 * is thrown out and table is initialized from scratch.
 *
 * Notable sub-components
 * ----------------------
 *
 * All custom logic that we build on top of ag-grid has the entry point in `TableFacade`. The code in this component
 * relies on the facade to drive our custom table logic. This facade further delegates complex pieces of work
 * to other components. The most important are `TableDescriptor` and `ResizedColumnStore` + its friends.
 *
 * The `TableDescriptor` is responsible for figuring out how the table should look like and prepare column
 * descriptors and ag-grid ColDefs.
 *
 * The `ResizedColumnStore` & functions in its vicinity are responsible for implementation of our custom
 * table column resizing logic.
 *
 * Apart from these main components there is also our custom implementation of ag-grid data source - this is responsible
 * for getting correct data and transforming it to form that can be consumed by ag-gird. It is the data source where
 * our code has to figure out whether the sorts or totals have changed and if so update the execution to perform
 * the correct execution.
 *
 * Finally there is the sticky row handling which contains some nasty code & at times works with ag-grid internals
 * to get the job done.
 *
 * Control flow
 * ------------
 *
 * To maintain some kind of sanity in this complex component there are two general rules:
 *
 * 1.  TableMethods or its subtypes are the only way how pivot table component passes down its essential functions
 *     to sub-components.
 *
 * 2.  All table functionality and features MUST be orchestrated from the pivot table component itself.
 *     The facade or other subcomponents merely _do the work_ but they do not make 'high level decisions' of
 *     what the table should be doing.
 *
 * These rules are in place to try and get to 'top-down' control flow.
 *
 *
 * Known flaws
 * -----------
 *
 * -  The initial render & subsequent table column resizing is brittle and includes a async functions, timeouts, intervals
 *    etc.
 *
 *    This can be currently knocked out of balance if during initial table render the data source determines
 *    it needs to transform the execution (to include sorts for instance; this was often the case if AD sent execution
 *    definition with invalid sorts).
 *
 * -  The reinitialization of entire table is too aggressive at the moment. There are two most notable cases:
 *
 *    1.  Client changes drills; this will lead to reinit to correctly mark cells as drillable. Perhaps all we
 *        need it to trigger some kind of ag-grid cell refresh?
 *
 *    2.  Client changes prepared execution that comes in props. Any change means reinit. This is not really needed
 *        if only sorts or totals were added but the shape of the table looks the same.
 *
 * Debugging hints
 * ---------------
 *
 * Nothing renders: check out the problem with resizing & data source interplay.
 *
 *
 * @internal
 */
export class CorePivotTableAgImpl extends React.Component<ICorePivotTableProps, ICorePivotTableState> {
    public static defaultProps = PIVOT_TABLE_DEFAULT_PROPS;

    private readonly errorMap: IErrorDescriptors;
    private containerRef: HTMLDivElement | undefined;
    private pivotTableId: string;

    private internal: InternalTableState;
    private boundAgGridCallbacks: TableAgGridCallbacks;

    // Event handler instances
    private gridEventHandlers!: GridEventHandlers;
    private dataRenderHandlers!: DataRenderHandlers;
    private scrollEventHandlers!: ScrollEventHandlers;
    private resizeEventHandlers!: ResizeEventHandlers;
    private sortingEventHandlers!: SortingEventHandlers;
    private aggregationEventHandlers!: AggregationEventHandlers;
    private dataLoadingEventHandlers!: DataLoadingEventHandlers;

    // Config accessor instance
    private configAccessors!: TableConfigAccessors;
    private configDelegates!: ConfigDelegates;

    // Sticky row manager instance
    private stickyRowManager!: StickyRowManager;

    // Height calculation manager instance
    private heightCalculationManager!: HeightCalculationManager;

    // Execution abort manager instance
    private executionAbortManager: ExecutionAbortManager;

    // Component update analyzer instance
    private componentUpdateAnalyzer!: ComponentUpdateAnalyzer;

    constructor(props: ICorePivotTableProps) {
        super(props);

        const { execution, config } = props;

        this.state = {
            readyToRender: false,
            columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
            rowTotals: getTotalsForColumnsBucket(execution.definition),
            desiredHeight: config!.maxHeight,
            resized: false,
            tempExecution: execution,
            isLoading: false,
        };

        this.errorMap = newErrorMapping(props.intl);
        this.internal = new InternalTableState();
        this.boundAgGridCallbacks = this.createBoundAgGridCallbacks();
        this.pivotTableId = uuidv4().replace(/-/g, "");
        this.onLoadingChanged = this.onLoadingChanged.bind(this);

        // Initialize execution abort manager
        this.executionAbortManager = new ExecutionAbortManager({
            enableExecutionCancelling: props.config?.enableExecutionCancelling,
        });

        // Initialize event handlers and config accessors
        this.initializeEventHandlers();
        this.initializeConfigAccessors();
    }

    //
    // Lifecycle
    //

    /**
     * Starts initialization of table that will show results of the provided prepared execution. If there is
     * already an initialization in progress for the table, this will abandon the previous initialization
     * and start a new one.
     *
     * During the initialization the code drives the execution and obtains the first page of data. Once that
     * is done, the initializer will construct the {@link TableFacade} with all the essential non-react
     * table & data state in it.
     *
     * After the initializer completes this, the table facade and the table itself is ready to render the
     * ag-grid component.
     *
     * @param execution - prepared execution to drive
     */
    private initialize = (execution: IPreparedExecution): TableFacadeInitializer => {
        this.internal.abandonInitialization();
        this.executionAbortManager.refresh({
            isLoading: this.state.isLoading,
            readyToRender: this.state.readyToRender,
        });
        const initializer = new TableFacadeInitializer(execution, this.getTableMethods(), this.props, () =>
            this.executionAbortManager.getCurrentController(),
        );

        initializer.initialize().then((result) => {
            if (!result || this.internal.initializer !== result.initializer) {
                /*
                 * This particular initialization was abandoned.
                 */
                return;
            }

            this.internal.initializer = undefined;
            this.internal.table = result.table;
            this.setState({ readyToRender: true });
        });

        return initializer;
    };

    /**
     * Completely re-initializes the table in order to show data for the provided prepared execution. At this point
     * code has determined that the table layout for the other prepared execution differs from what is currently
     * shown and the only reasonable thing to do is to throw everything away and start from scratch.
     *
     * This will reset all React state and non-react state and start table initialization process.
     */
    private reinitialize = (execution: IPreparedExecution): void => {
        this.setState(
            {
                readyToRender: false,
                columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
                rowTotals: getTotalsForColumnsBucket(execution.definition),
                error: undefined,
                desiredHeight: this.props.config!.maxHeight,
                resized: false,
            },
            () => {
                this.internal.destroy();
                this.internal = new InternalTableState();
                this.initializeEventHandlers();
                this.initializeConfigAccessors();
                this.boundAgGridCallbacks = this.createBoundAgGridCallbacks();
                this.internal.initializer = this.initialize(execution);
            },
        );
    };

    public componentDidMount(): void {
        this.internal.initializer = this.initialize(this.props.execution);
    }

    public componentWillUnmount(): void {
        this.executionAbortManager.destroy();
        if (this.containerRef) {
            this.containerRef.removeEventListener("mousedown", this.onContainerMouseDown);
        }

        // this ensures any events emitted during the async initialization will be sunk. they are no longer needed.
        this.internal.destroy();
    }

    public componentDidUpdate(prevProps: ICorePivotTableProps): void {
        // Update execution abort manager config if it changed
        if (this.componentUpdateAnalyzer.hasExecutionCancellingChanged(prevProps)) {
            this.executionAbortManager.updateConfig({
                enableExecutionCancelling: this.props.config?.enableExecutionCancelling,
            });
        }

        // Update component update analyzer context
        this.componentUpdateAnalyzer = new ComponentUpdateAnalyzer({
            props: this.props,
            state: this.state,
            internal: this.internal,
            executionAbortManager: this.executionAbortManager,
        });

        // reinit in progress
        if (this.componentUpdateAnalyzer.shouldSkipUpdate()) {
            return;
        }

        if (this.componentUpdateAnalyzer.isReinitNeeded(prevProps)) {
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
            this.componentUpdateAnalyzer.logReinitDebug(prevProps.execution);
            this.reinitialize(this.props.execution);
        } else {
            /*
             * When in this branch, the ag-grid instance is up and running and is already showing some data and
             * it _should_ be possible to normally use the ag-grid APIs.
             *
             * The currentResult and visibleData _will_ be available at this point because the component is definitely
             * after a successful execution and initialization.
             */

            if (this.componentUpdateAnalyzer.shouldRefreshHeader(prevProps)) {
                this.internal.table?.refreshHeader();
            }

            if (this.componentUpdateAnalyzer.hasGrowToFitEnabledChanged(prevProps, this.isGrowToFitEnabled)) {
                this.growToFit();
            }

            if (this.componentUpdateAnalyzer.hasColumnWidthsChanged(prevProps, this.getColumnWidths)) {
                this.internal.table?.applyColumnSizes(this.getResizingConfig());
            }

            if (this.componentUpdateAnalyzer.hasMaxHeightChanged(prevProps)) {
                this.updateDesiredHeight();
            }
        }
    }

    private stopEventWhenResizeHeader(e: React.MouseEvent): void {
        // Do not propagate event when it originates from the table resizer.
        // This means for example that we can resize columns without triggering drag in the application.
        if ((e.target as Element)?.className?.includes?.("ag-header-cell-resize")) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    //
    // Render
    //

    private setContainerRef = (container: HTMLDivElement): void => {
        this.containerRef = container;

        if (this.containerRef) {
            this.containerRef.addEventListener("mousedown", this.onContainerMouseDown);
        }
    };

    private renderLoading() {
        const { LoadingComponent, theme } = this.props;
        return <PivotTableLoading LoadingComponent={LoadingComponent} theme={theme} />;
    }

    public render() {
        const { ErrorComponent } = this.props;
        const { desiredHeight, error } = this.state;

        if (error) {
            return <PivotTableError error={error} errorMap={this.errorMap} ErrorComponent={ErrorComponent} />;
        }

        const style: React.CSSProperties = {
            height: desiredHeight || "100%",
            position: "relative",
            overflow: "hidden",
        };

        if (!this.state.readyToRender) {
            return (
                <div className="gd-table-component" style={style} id={this.pivotTableId}>
                    {this.renderLoading()}
                </div>
            );
        }

        // when table is ready, then the table facade must be set. if this bombs then there is a bug
        // in the initialization logic
        invariant(this.internal.table);

        if (!this.internal.gridOptions) {
            this.internal.gridOptions = createGridOptions(
                this.internal.table,
                this.getTableMethods(),
                this.props,
            );
        }

        /*
         * Show loading overlay until all the resizing is done. This is because the various resizing operations
         * have to happen asynchronously - they must wait until ag-grid fires onFirstDataRendered, before our code
         * can start reliably interfacing with the autosizing features.
         */
        const shouldRenderLoadingOverlay =
            (this.isColumnAutoresizeEnabled() || this.isGrowToFitEnabled()) && !this.state.resized;

        const classNames = cx("gd-table-component", {
            "gd-table-header-hide":
                this.props.config?.columnHeadersPosition === "left" &&
                this.internal.table.tableDescriptor.isTransposed(),
        });

        return (
            <div
                className={classNames}
                style={style}
                id={this.pivotTableId}
                onMouseDown={this.stopEventWhenResizeHeader}
                onDragStart={this.stopEventWhenResizeHeader}
            >
                <div
                    className="gd-table ag-theme-balham s-pivot-table"
                    style={style}
                    ref={this.setContainerRef}
                >
                    <AgGridReact {...this.internal.gridOptions} modules={[AllCommunityModule]} />
                    {shouldRenderLoadingOverlay ? this.renderLoading() : null}
                </div>
            </div>
        );
    }

    //
    // Initialize event handlers
    //

    private initializeEventHandlers = (): void => {
        // Create event handler instances with proper context
        this.gridEventHandlers = new GridEventHandlers({
            internal: this.internal,
            props: this.props,
            updateDesiredHeight: this.updateDesiredHeight,
            onFirstDataRendered: this.onFirstDataRendered,
            updateStickyRow: this.updateStickyRow,
            getGroupRows: this.getGroupRows,
            getLastSortedColId: this.getLastSortedColId,
            setLastSortedColId: this.setLastSortedColId,
        });

        this.dataRenderHandlers = new DataRenderHandlers({
            internal: this.internal,
            isColumnAutoresizeEnabled: this.isColumnAutoresizeEnabled,
            isGrowToFitEnabled: this.isGrowToFitEnabled,
            autoresizeColumns: this.autoresizeColumns,
            growToFit: this.growToFit,
            updateStickyRow: this.updateStickyRow,
            startWatchingTableRendered: this.startWatchingTableRendered,
        });

        this.scrollEventHandlers = new ScrollEventHandlers({
            internal: this.internal,
            updateStickyRowContent: this.updateStickyRowContent,
        });

        this.resizeEventHandlers = new ResizeEventHandlers({
            internal: this.internal,
            updateDesiredHeight: this.updateDesiredHeight,
            autoresizeColumns: this.autoresizeColumns,
            getResizingConfig: this.getResizingConfig,
        });

        this.sortingEventHandlers = new SortingEventHandlers({
            internal: this.internal,
            getExecutionDefinition: this.getExecutionDefinition,
            pushDataGuard: this.pushDataGuard,
            setState: this.setState.bind(this),
        });

        this.aggregationEventHandlers = new AggregationEventHandlers({
            internal: this.internal,
            getExecutionDefinition: this.getExecutionDefinition,
            getColumnTotals: this.getColumnTotals,
            getRowTotals: this.getRowTotals,
            pushDataGuard: this.pushDataGuard,
            setState: this.setState.bind(this),
        });

        this.dataLoadingEventHandlers = new DataLoadingEventHandlers({
            internal: this.internal,
            props: this.props,
            updateStickyRow: this.updateStickyRow,
            updateDesiredHeight: this.updateDesiredHeight,
            setState: this.setState.bind(this),
        });
    };

    //
    // event handlers
    //

    private onGridReady = (event: GridReadyEvent) => {
        this.gridEventHandlers.onGridReady(event);
    };

    private onFirstDataRendered = async (_event?: AgGridEvent) => {
        await this.dataRenderHandlers.onFirstDataRendered(_event);
    };

    private onModelUpdated = (event: AgGridEvent) => {
        this.gridEventHandlers.onModelUpdated(event);
    };

    private onGridColumnsChanged = () => {
        this.gridEventHandlers.onGridColumnsChanged();
    };

    private onGridSizeChanged = (gridSizeChangedEvent: any): void => {
        this.resizeEventHandlers.onGridSizeChanged(gridSizeChangedEvent);
    };

    private onGridColumnResized = async (columnEvent: ColumnResizedEvent) => {
        await this.resizeEventHandlers.onGridColumnResized(columnEvent);
    };

    private onSortChanged = (event: SortChangedEvent): void => {
        this.sortingEventHandlers.onSortChanged(event);
    };

    private onPinnedRowDataChanged = async (event: PinnedRowDataChangedEvent) => {
        await this.resizeEventHandlers.onPinnedRowDataChanged(event);
    };

    private onBodyScroll = (event: BodyScrollEvent) => {
        this.scrollEventHandlers.onBodyScroll(event);
    };

    private onContainerMouseDown = (event: MouseEvent) => {
        this.scrollEventHandlers.onContainerMouseDown(event);
    };

    private onPageLoaded = (dv: DataViewFacade, newResult: boolean): void => {
        this.dataLoadingEventHandlers.onPageLoaded(dv, newResult);
    };

    /**
     * This will be called when user changes sorts or adds totals. This means complete re-execution with
     * new sorts or totals. Loading indicators will be shown instead of all rendered rows thanks to the
     * LoadingRenderer used in all cells of the left-most column.
     *
     * The table must take care to remove the sticky (top-pinned) row - it is treated differently by
     * ag-grid and will be literally sticking there on its own with the loading indicators.
     *
     * Once transformation finishes - indicated by call to onPageLoaded, table can re-instance the sticky row.
     *
     * @param newExecution - the new execution which is being run and will be used to populate the table
     */
    private onExecutionTransformed = (newExecution: IPreparedExecution): void => {
        // Handle the reinitialize call directly here since we can't pass it to the handler
        if (!this.internal.table) {
            return;
        }

        this.internal.table.clearStickyRow();

        // Force double execution only when totals/subtotals for columns change, so table is render properly.
        if (!isEqual(this.state.tempExecution.definition.buckets[2], newExecution.definition.buckets[2])) {
            this.setState({
                tempExecution: newExecution,
            });
            this.reinitialize(newExecution);
        }
    };

    private onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        this.aggregationEventHandlers.onMenuAggregationClick(menuAggregationClickConfig);
    };

    private onLoadingChanged = (loadingState: ILoadingState): void => {
        this.dataLoadingEventHandlers.onLoadingChanged(loadingState);
    };

    private onError = (error: GoodDataSdkError, execution = this.props.execution) => {
        this.dataLoadingEventHandlers.onError(error, execution);
    };

    //
    // Table resizing
    //

    private growToFit = () => {
        invariant(this.internal.table);

        if (!this.isGrowToFitEnabled()) {
            return;
        }

        this.internal.table.growToFit(this.getResizingConfig());

        if (!this.state.resized && !this.internal.table.isResizing()) {
            this.setState({
                resized: true,
            });
        }
    };

    private autoresizeColumns = async (force: boolean = false) => {
        if (this.state.resized && !force) {
            return;
        }

        const didResize = await this.internal.table?.autoresizeColumns(this.getResizingConfig(), force);

        if (didResize) {
            // after column resizing, horizontal scroolbar may change and table height may need resizing
            this.updateDesiredHeight();
        }

        if (didResize && !this.state.resized) {
            this.setState({
                resized: true,
            });
        }
    };

    private shouldAutoResizeColumns = () => {
        return this.configDelegates.shouldAutoResizeColumns();
    };

    private startWatchingTableRendered = () => {
        if (!this.internal.table) {
            return;
        }

        const missingContainerRef = !this.containerRef; // table having no data will be unmounted, it causes ref null
        const isTableRendered = this.shouldAutoResizeColumns()
            ? this.state.resized
            : this.internal.table.isPivotTableReady();
        const shouldCallAutoresizeColumns =
            this.internal.table.isPivotTableReady() &&
            !this.state.resized &&
            !this.internal.table.isResizing();

        if (this.shouldAutoResizeColumns() && shouldCallAutoresizeColumns) {
            this.autoresizeColumns();
        }

        if (missingContainerRef || isTableRendered) {
            this.stopWatchingTableRendered();
        }
    };

    private stopWatchingTableRendered = () => {
        this.internal.stopWatching();
        this.props.afterRender!();
    };

    //
    // Sticky row handling - delegated to StickyRowManager
    //

    private updateStickyRow = (): void => {
        this.stickyRowManager.updateStickyRow();
    };

    private updateStickyRowContent = (scrollPosition: IScrollPosition): void => {
        this.stickyRowManager.updateStickyRowContent(scrollPosition);
    };

    //
    // Desired height updating - delegated to HeightCalculationManager
    //

    private updateDesiredHeight = (): void => {
        this.heightCalculationManager.updateDesiredHeight();
    };

    //
    // Initialize config accessors
    //

    private initializeConfigAccessors = (): void => {
        this.configAccessors = new TableConfigAccessors({
            props: this.props,
            state: this.state,
        });
        this.configDelegates = createConfigDelegates(this.configAccessors);

        // Initialize sticky row manager
        this.stickyRowManager = new StickyRowManager({
            internal: this.internal,
            props: this.props,
            state: this.state,
            getGroupRows: this.getGroupRows,
        });

        // Initialize height calculation manager
        this.heightCalculationManager = new HeightCalculationManager({
            internal: this.internal,
            props: this.props,
            state: this.state,
            setState: (state: Partial<ICorePivotTableState>, callback?: () => void) => {
                this.setState(state as any, callback);
            },
            getContainerRef: () => this.containerRef,
        });

        // Initialize component update analyzer
        this.componentUpdateAnalyzer = new ComponentUpdateAnalyzer({
            props: this.props,
            state: this.state,
            internal: this.internal,
            executionAbortManager: this.executionAbortManager,
        });
    };

    //
    // Table configuration accessors
    //

    private getLastSortedColId = (): string | null => {
        return this.internal.lastSortedColId;
    };

    private setLastSortedColId = (colId: string | null): void => {
        this.internal.lastSortedColId = colId;
    };

    // Delegate to config accessors
    private getColumnTotals = () => this.configDelegates.getColumnTotals();
    private getRowTotals = () => this.configDelegates.getRowTotals();
    private getExecutionDefinition = () => this.configDelegates.getExecutionDefinition();
    private getGroupRows = () => this.configDelegates.getGroupRows();
    private getMeasureGroupDimension = () => this.configDelegates.getMeasureGroupDimension();
    private getColumnHeadersPosition = () => this.configDelegates.getColumnHeadersPosition();
    private getMenuConfig = () => this.configDelegates.getMenuConfig();
    private getDefaultWidth = () => this.configDelegates.getDefaultWidth();
    private isColumnAutoresizeEnabled = () => this.configDelegates.isColumnAutoresizeEnabled();
    private isGrowToFitEnabled = (props: ICorePivotTableProps = this.props) =>
        this.configDelegates.isGrowToFitEnabled(props);
    private getColumnWidths = (props: ICorePivotTableProps) => this.configDelegates.getColumnWidths(props);
    private hasColumnWidths = () => this.configDelegates.hasColumnWidths();
    private getDefaultWidthFromProps = (props: ICorePivotTableProps) =>
        this.configDelegates.getDefaultWidthFromProps(props);

    /**
     * All pushData calls done by the table must go through this guard.
     *
     * TODO: The guard should ensure a 'disconnect' between push data handling and the calling function processing.
     *  When the pushData is handled by the application, it MAY (and in our case it DOES) trigger processing that
     *  lands back in the table. This opens additional set of invariants to check / be prepared for in order to
     *  optimize the renders and re-renders.
     */
    private pushDataGuard = (data: IPushData): void => {
        this.props.pushData?.(data);

        /*
         * TODO: Switch to this on in FET-715.
        setTimeout(() => {
            this.props.pushData?.(data);
        }, 0);
         */
    };

    /**
     * Wraps the provided callback function with a guard that checks whether the current table state is the same
     * as the state snapshot at the time of callback creation. If the state differs, the wrapped function WILL NOT
     * be called.
     *
     * @param callback - function to wrap with state guard
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    private stateBoundCallback = <T extends Function>(callback: T): T => {
        return createStateBoundCallback(callback as any, this.internal, () => this.internal) as unknown as T;
    };

    /**
     * All callback functions that the table passes to ag-grid must be bound to the current internal state of the table. The
     * callback functions MUST be noop if the internal state at the time of call is different from the internal state
     * at the time of creation.
     *
     * This is essential to prevent errors stemming for racy behavior triggered by ag-grid. ag-grid often triggers
     * event callbacks using setTimeout(). It can happen, that once the event is actually processed the ag-grid table
     * which caused it is unmounted. Doing anything with the unmounted table's gridApi leads to errors.
     *
     * Without this, table may trigger ag-grid errors such as this:
     *
     * https://github.com/ag-grid/ag-grid/issues/3457
     *
     * or this:
     *
     * https://github.com/ag-grid/ag-grid/issues/3334
     */
    private createBoundAgGridCallbacks = (): TableAgGridCallbacks => {
        const debouncedGridSizeChanged = createDebouncedCallback(
            this.stateBoundCallback(this.onGridSizeChanged),
            AGGRID_ON_RESIZE_TIMEOUT,
        );

        return {
            onGridReady: this.stateBoundCallback(this.onGridReady),
            onFirstDataRendered: this.stateBoundCallback(this.onFirstDataRendered),
            onBodyScroll: this.stateBoundCallback(this.onBodyScroll),
            onModelUpdated: this.stateBoundCallback(this.onModelUpdated),
            onGridColumnsChanged: this.stateBoundCallback(this.onGridColumnsChanged),
            onGridColumnResized: this.stateBoundCallback(this.onGridColumnResized),
            onSortChanged: this.stateBoundCallback(this.onSortChanged),
            onGridSizeChanged: debouncedGridSizeChanged,
            onPinnedRowDataChanged: this.stateBoundCallback(this.onPinnedRowDataChanged),
        };
    };

    private getTableMethods = (): TableMethods => {
        return {
            hasColumnWidths: this.hasColumnWidths(),

            getExecutionDefinition: this.getExecutionDefinition,
            getMenuConfig: this.getMenuConfig,
            getGroupRows: this.getGroupRows,
            getColumnTotals: this.getColumnTotals,
            getRowTotals: this.getRowTotals,
            getColumnHeadersPosition: this.getColumnHeadersPosition,
            getMeasureGroupDimension: this.getMeasureGroupDimension,
            getResizingConfig: this.getResizingConfig,
            onLoadingChanged: this.onLoadingChanged,
            onError: this.onError,
            onExportReady: this.props.onExportReady ?? noop,
            pushData: this.pushDataGuard,
            onPageLoaded: this.onPageLoaded,
            onExecutionTransformed: this.onExecutionTransformed,
            onMenuAggregationClick: this.onMenuAggregationClick,
            setLastSortedColId: this.setLastSortedColId,

            ...this.boundAgGridCallbacks,
        };
    };

    private getResizingConfig = (): ColumnResizingConfig => {
        return {
            defaultWidth: this.getDefaultWidth(),
            growToFit: this.isGrowToFitEnabled(),
            columnAutoresizeOption: this.getDefaultWidthFromProps(this.props),
            widths: this.getColumnWidths(this.props),

            isAltKeyPressed: this.internal.isAltKeyPressed,
            isMetaOrCtrlKeyPressed: this.internal.isMetaOrCtrlKeyPressed,

            // use clientWidth of the viewport container to accommodate for vertical scrollbars if needed
            clientWidth: this.containerRef?.getElementsByClassName("ag-body-viewport")[0]?.clientWidth ?? 0,
            containerRef: this.containerRef,
            separators: this.props?.config?.separators,

            onColumnResized: this.props.onColumnResized,
        };
    };
}

const CorePivotTableWithIntl = injectIntl(withTheme(CorePivotTableAgImpl));

/**
 * @internal
 */
export function CorePivotTable(props: ICorePivotTableProps) {
    return (
        <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
            <IntlWrapper locale={props.locale}>
                <CorePivotTableWithIntl {...props} />
            </IntlWrapper>
        </ThemeContextProvider>
    );
}
