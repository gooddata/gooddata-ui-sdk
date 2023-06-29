// (C) 2007-2022 GoodData Corporation
import {
    AgGridEvent,
    AllCommunityModules,
    BodyScrollEvent,
    ColumnResizedEvent,
    GridReadyEvent,
    SortChangedEvent,
    PinnedRowDataChangedEvent,
} from "@ag-grid-community/all-modules";
import { v4 as uuidv4 } from "uuid";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AgGridReact } from "@ag-grid-community/react";
import React from "react";
import { injectIntl } from "react-intl";
import {
    BucketNames,
    createExportErrorFunction,
    DataViewFacade,
    ErrorCodes,
    ErrorComponent,
    GoodDataSdkError,
    IErrorDescriptors,
    ILoadingState,
    IntlWrapper,
    IPushData,
    LoadingComponent,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { getUpdatedColumnOrRowTotals } from "./impl/structure/headers/aggregationsMenuHelper.js";
import { getScrollbarWidth, sanitizeDefTotals, getTotalsForColumnsBucket } from "./impl/utils.js";
import { IScrollPosition } from "./impl/stickyRowHandler.js";

import { DefaultColumnWidth, ICorePivotTableProps, IMenu } from "./publicTypes.js";
import { ColumnWidthItem } from "./columnWidths.js";
import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
import debounce from "lodash/debounce.js";
import { invariant } from "ts-invariant";
import { isManualResizing, scrollBarExists } from "./impl/base/agUtils.js";
import {
    ColumnResizingConfig,
    IMenuAggregationClickConfig,
    TableAgGridCallbacks,
    TableMethods,
} from "./impl/privateTypes.js";
import { createGridOptions } from "./impl/gridOptions.js";
import { TableFacadeInitializer } from "./impl/tableFacadeInitializer.js";
import { ICorePivotTableState, InternalTableState } from "./tableState.js";
import { isColumnAutoresizeEnabled } from "./impl/resizing/columnSizing.js";
import cloneDeep from "lodash/cloneDeep.js";

const DEFAULT_COLUMN_WIDTH = 200;
const WATCHING_TABLE_RENDERED_INTERVAL = 500;
const AGGRID_ON_RESIZE_TIMEOUT = 300;

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
    public static defaultProps: Pick<
        ICorePivotTableProps,
        | "locale"
        | "drillableItems"
        | "afterRender"
        | "pushData"
        | "onExportReady"
        | "onLoadingChanged"
        | "onError"
        | "onDrill"
        | "ErrorComponent"
        | "LoadingComponent"
        | "pageSize"
        | "config"
        | "onColumnResized"
    > = {
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
    private containerRef: HTMLDivElement | undefined;
    private pivotTableId: string;

    private internal: InternalTableState;
    private boundAgGridCallbacks: TableAgGridCallbacks;

    constructor(props: ICorePivotTableProps) {
        super(props);

        const { execution, config } = props;

        this.state = {
            readyToRender: false,
            columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
            rowTotals: getTotalsForColumnsBucket(execution.definition),
            desiredHeight: config!.maxHeight,
            resized: false,
        };

        this.errorMap = newErrorMapping(props.intl);
        this.internal = new InternalTableState();
        this.boundAgGridCallbacks = this.createBoundAgGridCallbacks();
        this.pivotTableId = uuidv4().replace(/-/g, "");
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
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

        const initializer = new TableFacadeInitializer(execution, this.getTableMethods(), this.props);

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
                this.boundAgGridCallbacks = this.createBoundAgGridCallbacks();
                this.internal.initializer = this.initialize(execution);
            },
        );
    };

    public componentDidMount(): void {
        this.alertParentWrapperMissingHeight();
        this.internal.initializer = this.initialize(this.props.execution);
    }

    public componentWillUnmount(): void {
        if (this.containerRef) {
            this.containerRef.removeEventListener("mousedown", this.onContainerMouseDown);
        }

        // this ensures any events emitted during the async initialization will be sunk. they are no longer needed.
        this.internal.destroy();
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
            // eslint-disable-next-line no-console
            console.debug(
                "triggering reinit",
                this.props.execution.definition,
                prevProps.execution.definition,
            );
            this.reinitialize(this.props.execution);
        } else {
            /*
             * When in this branch, the ag-grid instance is up and running and is already showing some data and
             * it _should_ be possible to normally use the ag-grid APIs.
             *
             * The currentResult and visibleData _will_ be available at this point because the component is definitely
             * after a successful execution and initialization.
             */

            if (this.shouldRefreshHeader(this.props, prevProps)) {
                this.internal.table?.refreshHeader();
            }

            if (this.isGrowToFitEnabled() && !this.isGrowToFitEnabled(prevProps)) {
                this.growToFit();
            }

            const prevColumnWidths = this.getColumnWidths(prevProps);
            const columnWidths = this.getColumnWidths(this.props);

            if (!isEqual(prevColumnWidths, columnWidths)) {
                this.internal.table?.applyColumnSizes(this.getResizingConfig());
            }

            if (
                this.props.config?.maxHeight &&
                !isEqual(this.props.config?.maxHeight, prevProps.config?.maxHeight)
            ) {
                this.updateDesiredHeight();
            }
        }
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
     */
    private isReinitNeeded(prevProps: ICorePivotTableProps): boolean {
        const drillingIsSame = isEqual(prevProps.drillableItems, this.props.drillableItems);

        if (!drillingIsSame) {
            // eslint-disable-next-line no-console
            console.debug("drilling is different", prevProps.drillableItems, this.props.drillableItems);

            return true;
        }

        if (!this.internal.table) {
            // Table is not yet fully initialized. See if the initialization is in progress. If so, see if
            // the init is for same execution or not. Otherwise fall back to compare props vs props.
            if (this.internal.initializer) {
                const initializeForSameExec = this.internal.initializer.isSameExecution(this.props.execution);

                if (!initializeForSameExec) {
                    // eslint-disable-next-line no-console
                    console.debug(
                        "initializer for different execution",
                        this.props.execution,
                        prevProps.execution,
                    );
                }

                return !initializeForSameExec;
            } else {
                const prepExecutionSame =
                    this.props.execution.fingerprint() === prevProps.execution.fingerprint();

                if (!prepExecutionSame) {
                    // eslint-disable-next-line no-console
                    console.debug("have to reinit table", this.props.execution, prevProps.execution);
                }

                return !prepExecutionSame;
            }
        }

        return !this.internal.table.isMatchingExecution(this.props.execution);
    }

    /**
     * Tests whether ag-grid's refreshHeader should be called. At the moment this is necessary when user
     * turns on/off the aggregation menus through the props. The menus happen to appear in the table column headers
     * so the refresh is essential to show/hide them.
     *
     * @param props - current table props
     * @param prevProps - previous table props
     * @internal
     */
    private shouldRefreshHeader(props: ICorePivotTableProps, prevProps: ICorePivotTableProps): boolean {
        const propsRequiringAgGridRerender: Array<(props: ICorePivotTableProps) => any> = [
            (props) => props?.config?.menu,
        ];
        return propsRequiringAgGridRerender.some(
            (propGetter) => !isEqual(propGetter(props), propGetter(prevProps)),
        );
    }

    /**
     * Checks DOM if height has been set on PivotTable parent wrapper. If height has not been set,
     * PivotTable will not be rendered correctly. Therefore, we need to inform the user at least on the console
     * on what is happening.
     *
     * @internal
     */
    private alertParentWrapperMissingHeight(): void {
        const parentWrapper = document.getElementById(this.pivotTableId)?.parentElement;
        const parentHeight = parentWrapper?.offsetHeight ?? 0;
        if (parentHeight < 20) {
            console.warn(
                `The wrapper height of the pivot table has not been set or is suspiciously small. This might cause pivot table rendering issues. If so, please set an appropriate height for the wrapper. Use document.getElementById("${this.pivotTableId}") to find the PivotTable element in the DOM, which will help you to identify its wrapper.`,
            );
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

        const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;

        return (
            <div className="s-loading gd-table-loading">
                {LoadingComponent ? <LoadingComponent color={color} /> : null}
            </div>
        );
    }

    public render() {
        const { ErrorComponent } = this.props;
        const { desiredHeight, error } = this.state;

        if (error) {
            const errorProps =
                this.errorMap[
                    Object.prototype.hasOwnProperty.call(this.errorMap, error)
                        ? error
                        : ErrorCodes.UNKNOWN_ERROR
                ];

            return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
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

        return (
            <div
                className="gd-table-component"
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
                    <AgGridReact {...this.internal.gridOptions} modules={AllCommunityModules} />
                    {shouldRenderLoadingOverlay ? this.renderLoading() : null}
                </div>
            </div>
        );
    }

    //
    // event handlers
    //

    private onGridReady = (event: GridReadyEvent) => {
        invariant(this.internal.table);

        this.internal.table.finishInitialization(event.api, event.columnApi);
        this.updateDesiredHeight();

        if (this.getGroupRows()) {
            this.internal.table.initializeStickyRow();
        }

        this.internal.table.setTooltipFields();
    };

    private onFirstDataRendered = async (_event: AgGridEvent) => {
        invariant(this.internal.table);

        if (this.internal.firstDataRendered) {
            console.error("onFirstDataRendered called multiple times");
        }

        this.internal.firstDataRendered = true;

        // Since issue here is not resolved, https://github.com/ag-grid/ag-grid/issues/3263,
        // work-around by using 'setInterval'
        this.internal.startWatching(this.startWatchingTableRendered, WATCHING_TABLE_RENDERED_INTERVAL);

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

    private onGridSizeChanged = (gridSizeChangedEvent: any): void => {
        if (!this.internal.firstDataRendered) {
            // ag-grid does emit the grid size changed even before first data gets rendered (i suspect this is
            // to cater for the initial render where it goes from nothing to something that has the headers, and then
            // it starts rendering the data itself)
            //
            // Don't do anything, the resizing will be triggered after the first data is rendered
            return;
        }

        if (!this.internal.table) {
            return;
        }

        if (this.internal.table.isResizing()) {
            // don't do anything if the table is already resizing. this copies what we have in v7 line however
            // I think it opens room for racy/timing behavior. if the window is resized _while_ the table is resizing
            // it is likely that it will not respect current window size.
            //
            // keeping it like this for now. if needed, we can enqueue an auto-resize request somewhere and process
            // it after resizing finishes.
            return;
        }

        if (
            this.internal.checkAndUpdateLastSize(
                gridSizeChangedEvent.clientWidth,
                gridSizeChangedEvent.clientHeight,
            )
        ) {
            this.autoresizeColumns(true);
        }
    };

    private onGridColumnResized = async (columnEvent: ColumnResizedEvent) => {
        invariant(this.internal.table);

        if (!columnEvent.finished) {
            return; // only update the height once the user is done setting the column size
        }

        this.updateDesiredHeight();

        if (isManualResizing(columnEvent)) {
            this.internal.table.onManualColumnResize(this.getResizingConfig(), columnEvent.columns!);
        }
    };

    private onSortChanged = (event: SortChangedEvent): void => {
        if (!this.internal.table) {
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortItems = this.internal.table.createSortItems(event.columnApi.getAllColumns()!);

        // Changing sort may cause subtotals to no longer be reasonably placed - remove them if that is the case
        // This applies only to totals in ATTRIBUTE bucket, column totals are not affected by sorting
        const executionDefinition = this.getExecutionDefinition();
        const totals = sanitizeDefTotals(executionDefinition, sortItems);

        // eslint-disable-next-line no-console
        console.debug("onSortChanged", sortItems);

        this.pushDataGuard({
            properties: {
                sortItems,
                totals,
                bucketType: BucketNames.ATTRIBUTE,
            },
        });

        this.setState({ columnTotals: totals }, () => {
            this.internal.table?.refreshData();
        });
    };

    private onPinnedRowDataChanged = async (event: PinnedRowDataChangedEvent) => {
        if (event?.api.getPinnedBottomRowCount() > 0) {
            await this.autoresizeColumns(true);
        }
    };

    private onBodyScroll = (event: BodyScrollEvent) => {
        const scrollPosition: IScrollPosition = {
            top: Math.max(event.top, 0),
            left: event.left,
        };

        this.updateStickyRowContent(scrollPosition);
    };

    private onContainerMouseDown = (event: MouseEvent) => {
        this.internal.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
        this.internal.isAltKeyPressed = event.altKey;
    };

    private onPageLoaded = (_dv: DataViewFacade, newResult: boolean): void => {
        if (!this.internal.table) {
            return;
        }

        if (newResult) {
            this.props.onExportReady?.(this.internal.table.createExportFunction(this.props.exportTitle));
        }

        this.updateStickyRow();
        this.updateDesiredHeight();
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
     * @param _newExecution - the new execution which is being run and will be used to populate the table
     */
    private onExecutionTransformed = (_newExecution: IPreparedExecution): void => {
        if (!this.internal.table) {
            return;
        }

        this.internal.table.clearStickyRow();
    };

    private onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        const sortItems = this.internal.table?.getSortItems();
        const { isColumn } = menuAggregationClickConfig;

        if (isColumn) {
            const newColumnTotals = sanitizeDefTotals(
                this.getExecutionDefinition(),
                sortItems,
                getUpdatedColumnOrRowTotals(this.getColumnTotals(), menuAggregationClickConfig),
            );

            this.pushDataGuard({
                properties: {
                    totals: newColumnTotals,
                    bucketType: BucketNames.ATTRIBUTE,
                },
            });

            this.setState({ columnTotals: newColumnTotals }, () => {
                this.internal.table?.refreshData();
            });
        } else {
            const newRowTotals = getUpdatedColumnOrRowTotals(this.getRowTotals(), menuAggregationClickConfig);

            this.setState({ rowTotals: newRowTotals }, () => {
                this.internal.table?.refreshData();
            });

            this.pushDataGuard({
                properties: {
                    totals: newRowTotals,
                    bucketType: BucketNames.COLUMNS,
                },
            });
        }
    };

    private onLoadingChanged = (loadingState: ILoadingState): void => {
        const { onLoadingChanged } = this.props;

        if (onLoadingChanged) {
            onLoadingChanged(loadingState);
        }
    };

    private onError = (error: GoodDataSdkError, execution = this.props.execution) => {
        const { onExportReady } = this.props;

        if (this.props.execution.fingerprint() === execution.fingerprint()) {
            this.setState({ error: error.getMessage() });

            // update loading state when an error occurs
            this.onLoadingChanged({ isLoading: false });

            onExportReady!(createExportErrorFunction(error));

            this.props.onError?.(error);
        }
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

        if (didResize && !this.state.resized) {
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
    // Sticky row handling
    //

    private isStickyRowAvailable = (): boolean => {
        invariant(this.internal.table);

        return Boolean(this.getGroupRows() && this.internal.table.stickyRowExists());
    };

    private updateStickyRow = (): void => {
        if (!this.internal.table) {
            return;
        }

        if (this.isStickyRowAvailable()) {
            const scrollPosition: IScrollPosition = { ...this.internal.lastScrollPosition };
            this.internal.lastScrollPosition = {
                top: 0,
                left: 0,
            };

            this.updateStickyRowContent(scrollPosition);
        }
    };

    private updateStickyRowContent = (scrollPosition: IScrollPosition): void => {
        invariant(this.internal.table);

        if (this.isStickyRowAvailable()) {
            // Position update was moved here because in some complicated cases with totals,
            // it was not behaving properly. This was mainly visible in storybook, but it may happen
            // in other environments as well.
            this.internal.table.updateStickyRowPosition();

            this.internal.table.updateStickyRowContent({
                scrollPosition,
                lastScrollPosition: this.internal.lastScrollPosition,
            });
        }

        this.internal.lastScrollPosition = { ...scrollPosition };
    };

    //
    // Desired height updating
    //

    private getScrollBarPadding = (): number => {
        if (!this.internal.table?.isFullyInitialized()) {
            return 0;
        }

        if (!this.containerRef) {
            return 0;
        }

        // check for scrollbar presence
        return scrollBarExists(this.containerRef) ? getScrollbarWidth() : 0;
    };

    private calculateDesiredHeight = (): number | undefined => {
        const { maxHeight } = this.props.config!;
        if (!maxHeight) {
            return;
        }
        const bodyHeight = this.internal.table?.getTotalBodyHeight() ?? 0;
        const totalHeight = bodyHeight + this.getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    };

    private updateDesiredHeight = (): void => {
        if (!this.internal.table) {
            return;
        }

        const desiredHeight = this.calculateDesiredHeight();

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
    };

    //
    // Table configuration accessors
    //

    private getColumnTotals = () => {
        return this.state.columnTotals;
    };

    private getRowTotals = () => {
        return this.state.rowTotals;
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

    private getDefaultWidth = () => {
        return DEFAULT_COLUMN_WIDTH;
    };

    private isColumnAutoresizeEnabled = () => {
        const defaultWidth = this.getDefaultWidthFromProps(this.props);
        return isColumnAutoresizeEnabled(defaultWidth);
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    private stateBoundCallback = <T extends Function>(callback: T): T => {
        const forInternalState = this.internal;
        return ((...args: any) => {
            if (this.internal !== forInternalState) {
                return;
            }
            return callback(...args);
        }) as unknown as T;
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
        const debouncedGridSizeChanged = debounce(
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
            getResizingConfig: this.getResizingConfig,

            onLoadingChanged: this.onLoadingChanged,
            onError: this.onError,
            onExportReady: this.props.onExportReady ?? noop,
            pushData: this.pushDataGuard,
            onPageLoaded: this.onPageLoaded,
            onExecutionTransformed: this.onExecutionTransformed,
            onMenuAggregationClick: this.onMenuAggregationClick,

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
export const CorePivotTable: React.FC<ICorePivotTableProps> = (props) => (
    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
        <IntlWrapper locale={props.locale}>
            <CorePivotTableWithIntl {...props} />
        </IntlWrapper>
    </ThemeContextProvider>
);
