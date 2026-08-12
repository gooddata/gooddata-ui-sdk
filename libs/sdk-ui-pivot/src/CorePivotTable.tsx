// (C) 2007-2026 GoodData Corporation

import {
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    type AgGridEvent,
    AllCommunityModule,
    type BodyScrollEvent,
    type ColumnResizedEvent,
    type GridReadyEvent,
    type GridSizeChangedEvent,
    ModuleRegistry,
    type PinnedRowDataChangedEvent,
    type SortChangedEvent,
    provideGlobalGridOptions,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import cx from "classnames";
import { cloneDeep, isEqual } from "lodash-es";
import { injectIntl } from "react-intl";
import { invariant } from "ts-invariant";
import { v4 as uuidv4 } from "uuid";

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type DataViewFacade,
    type GoodDataSdkError,
    type ILoadingState,
    type IPushData,
    IntlWrapper,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";

import { PivotTableError } from "./components/PivotTableError.js";
import { PivotTableLoading } from "./components/PivotTableLoading.js";
import { createDebouncedCallback, createStateBoundCallback } from "./components/utils/callbackHelpers.js";
import { type ConfigDelegates, createConfigDelegates } from "./components/utils/configDelegation.js";
import {
    AGGRID_ON_RESIZE_TIMEOUT,
    PIVOT_TABLE_DEFAULT_PROPS,
} from "./components/utils/pivotTableDefaults.js";
import { TableConfigAccessors } from "./impl/config/tableConfigAccessors.js";
import { AggregationEventHandlers } from "./impl/eventHandlers/aggregationEventHandlers.js";
import { DataLoadingEventHandlers } from "./impl/eventHandlers/dataLoadingEventHandlers.js";
import { DataRenderHandlers } from "./impl/eventHandlers/dataRenderHandlers.js";
import { GridEventHandlers } from "./impl/eventHandlers/gridEventHandlers.js";
import { ResizeEventHandlers } from "./impl/eventHandlers/resizeEventHandlers.js";
import { ScrollEventHandlers } from "./impl/eventHandlers/scrollEventHandlers.js";
import { SortingEventHandlers } from "./impl/eventHandlers/sortingEventHandlers.js";
import { ExecutionAbortManager } from "./impl/execution/executionAbortManager.js";
import { createGridOptions } from "./impl/gridOptions.js";
import { HeightCalculationManager } from "./impl/height/heightCalculationManager.js";
import {
    type ColumnResizingConfig,
    type IMenuAggregationClickConfig,
    type TableAgGridCallbacks,
    type TableMethods,
} from "./impl/privateTypes.js";
import { StickyRowManager } from "./impl/stickyRow/stickyRowManager.js";
import { type IScrollPosition } from "./impl/stickyRowHandler.js";
import { TableFacadeInitializer } from "./impl/tableFacadeInitializer.js";
import { ComponentUpdateAnalyzer } from "./impl/updates/componentUpdateAnalyzer.js";
import { getTotalsForColumnsBucket, sanitizeDefTotals } from "./impl/utils.js";
import { type ICorePivotTableProps } from "./publicTypes.js";
import { type ICorePivotTableState, InternalTableState } from "./tableState.js";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" });

/**
 * State update accepted by the `React.Component.setState`-compatible state setter that the table hands over
 * to all its imperative sub-components.
 */
type CorePivotTableStateUpdate =
    | Partial<ICorePivotTableState>
    | ((prevState: ICorePivotTableState) => Partial<ICorePivotTableState>);

/**
 * All event handler instances used by the table. They are created together and thrown away together whenever
 * the table gets re-initialized.
 */
interface ITableEventHandlers {
    gridEventHandlers: GridEventHandlers;
    dataRenderHandlers: DataRenderHandlers;
    scrollEventHandlers: ScrollEventHandlers;
    resizeEventHandlers: ResizeEventHandlers;
    sortingEventHandlers: SortingEventHandlers;
    aggregationEventHandlers: AggregationEventHandlers;
    dataLoadingEventHandlers: DataLoadingEventHandlers;
}

/**
 * Config accessors & managers used by the table. They are created together and thrown away together whenever
 * the table gets re-initialized.
 */
interface ITableConfigAccessors {
    configAccessors: TableConfigAccessors;
    configDelegates: ConfigDelegates;
    stickyRowManager: StickyRowManager;
    heightCalculationManager: HeightCalculationManager;
}

/**
 * Applies the table default props. This is the functional component equivalent of the `defaultProps` static
 * that this component used to have while it was implemented as a class component.
 */
function resolveDefaultProps(props: ICorePivotTableProps): ICorePivotTableProps {
    return {
        ...props,
        locale: props.locale ?? PIVOT_TABLE_DEFAULT_PROPS.locale,
        drillableItems: props.drillableItems ?? PIVOT_TABLE_DEFAULT_PROPS.drillableItems,
        afterRender: props.afterRender ?? PIVOT_TABLE_DEFAULT_PROPS.afterRender,
        pushData: props.pushData ?? PIVOT_TABLE_DEFAULT_PROPS.pushData,
        onExportReady: props.onExportReady ?? PIVOT_TABLE_DEFAULT_PROPS.onExportReady,
        onLoadingChanged: props.onLoadingChanged ?? PIVOT_TABLE_DEFAULT_PROPS.onLoadingChanged,
        onError: props.onError ?? PIVOT_TABLE_DEFAULT_PROPS.onError,
        onDataView: props.onDataView ?? PIVOT_TABLE_DEFAULT_PROPS.onDataView,
        onDrill: props.onDrill ?? PIVOT_TABLE_DEFAULT_PROPS.onDrill,
        ErrorComponent: props.ErrorComponent ?? PIVOT_TABLE_DEFAULT_PROPS.ErrorComponent,
        LoadingComponent: props.LoadingComponent ?? PIVOT_TABLE_DEFAULT_PROPS.LoadingComponent,
        pageSize: props.pageSize ?? PIVOT_TABLE_DEFAULT_PROPS.pageSize,
        config: props.config ?? PIVOT_TABLE_DEFAULT_PROPS.config,
        onColumnResized: props.onColumnResized ?? PIVOT_TABLE_DEFAULT_PROPS.onColumnResized,
    };
}

function stopEventWhenResizeHeader(e: ReactMouseEvent): void {
    // Do not propagate event when it originates from the table resizer.
    // This means for example that we can resize columns without triggering drag in the application.
    if ((e.target as Element)?.className?.includes?.("ag-header-cell-resize")) {
        e.preventDefault();
        e.stopPropagation();
    }
}

/**
 * This component implements pivot table using the community version of ag-grid.
 *
 * Bear in mind that this is not a typical, standard React component implementation; the main reason
 * behind that is that while ag-grid comes with a React component the ag-grid itself is not a React component
 * and vast majority of its APIs are non-React as well. You will therefore find that there is a lot of non-react
 * state flying around.
 *
 * Instead of looking at this implementation as a typical React component, look at it like a adapter between
 * React and ag-grid which is used to render data obtained using GD executions.
 *
 * The code in this component is built to reflect the adapter nature of the integration. The responsibility of this
 * component is to correctly handle the component lifecycle and orchestrate integration of React and ag-grid, React
 * and GoodData, React and GoodData and ag-grid.
 *
 * Note on the implementation: because the table is driven imperatively, all the non-react state lives in refs and
 * all the functions that the table hands over to its sub-components are stable for the entire lifetime of the
 * component; they read the current props, state and internal state through refs.
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
 * or subtotals. All of this is handled outside of  These changes are handled in the ag-grid data source
 * implementation. As it discovers that different sorts or totals are needed, it will transform the original
 * prepared execution, add the extra settings and re-drive the execution. Once done, it will update the internal
 * state and ping ag-grid API to re-render the table.
 *
 * In case the client changes props (say modifying the prepared execution) the update effect will determine
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
export function CorePivotTableAgImpl(props: ICorePivotTableProps) {
    const resolvedProps = resolveDefaultProps(props);

    /*
     * Vast majority of the code below runs outside of the React rendering (ag-grid callbacks, timeouts, promise
     * continuations). Props and state are therefore mirrored into refs so that this code always sees the current
     * values - exactly like `this.props` and `this.state` used to do.
     */
    const propsRef = useRef(resolvedProps);
    propsRef.current = resolvedProps;

    const [state, setStateInternal] = useState<ICorePivotTableState>(() => {
        const { execution, config } = resolvedProps;

        return {
            readyToRender: false,
            columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
            rowTotals: getTotalsForColumnsBucket(execution.definition),
            desiredHeight: config!.maxHeight,
            resized: false,
            tempExecution: execution,
            isLoading: false,
        };
    });
    const stateRef = useRef(state);
    stateRef.current = state;

    /*
     * Callbacks passed to the `setState(update, callback)` calls; they must run after the commit of the state
     * update that registered them - the same way React does it for class components.
     *
     * Callbacks of the state updates that are already reflected in the state being rendered are moved to the
     * 'committed' queue below, which is then drained by an effect after the commit.
     */
    const enqueuedStateUpdateCallbacks = useRef<Array<() => void>>([]);
    const committedStateUpdateCallbacks = useRef<Array<() => void>>([]);

    if (enqueuedStateUpdateCallbacks.current.length > 0) {
        committedStateUpdateCallbacks.current.push(...enqueuedStateUpdateCallbacks.current);
        enqueuedStateUpdateCallbacks.current = [];
    }

    /**
     * Drop-in replacement of `React.Component.setState`: merges the partial state (or the result of the state
     * updater function) into the current state and optionally calls a callback once the new state is committed.
     */
    const setState = useCallback((update: CorePivotTableStateUpdate, callback?: () => void): void => {
        if (callback) {
            enqueuedStateUpdateCallbacks.current.push(callback);
        }

        setStateInternal((prevState) => ({
            ...prevState,
            ...(typeof update === "function" ? update(prevState) : update),
        }));
    }, []);

    const errorMap = useMemo(() => newErrorMapping(resolvedProps.intl), [resolvedProps.intl]);
    const pivotTableId = useMemo(() => uuidv4().replace(/-/g, ""), []);

    /*
     * The internal table state is intentionally kept out of the React state; it is replaced whenever the table
     * gets re-initialized. Always access it through the ref so that the current instance is used.
     */
    const internalRef = useRef<InternalTableState>(new InternalTableState());
    const containerRef = useRef<HTMLDivElement | undefined>(undefined);

    // Execution abort manager instance; created once for the whole lifetime of the component
    const [executionAbortManager] = useState(
        () =>
            new ExecutionAbortManager({
                enableExecutionCancelling: resolvedProps.config?.enableExecutionCancelling,
            }),
    );

    /*
     * The imperative helpers below are created during the first render (this is what the constructor used to do)
     * and are replaced whenever the table gets re-initialized.
     */
    const eventHandlersRef = useRef<ITableEventHandlers | null>(null);
    const configAccessorsRef = useRef<ITableConfigAccessors | null>(null);
    const componentUpdateAnalyzerRef = useRef<ComponentUpdateAnalyzer | null>(null);
    const boundAgGridCallbacksRef = useRef<TableAgGridCallbacks | null>(null);

    /*
     * The table methods handed over to the sub-components need to be able to trigger the table
     * re-initialization; the re-initialization in turn needs the table methods. This ref breaks that cycle.
     */
    const reinitializeRef = useRef<(execution: IPreparedExecution) => void>(() => {});

    /**
     * Getter of the current internal table state. It is essential to always obtain the internal state through
     * this getter because the internal state gets replaced on table re-initialization.
     */
    const getInternal = useCallback((): InternalTableState => internalRef.current, []);

    const getContainerRef = useCallback((): HTMLDivElement | undefined => containerRef.current, []);

    const getEventHandlers = useCallback((): ITableEventHandlers => {
        const eventHandlers = eventHandlersRef.current;
        invariant(eventHandlers);

        return eventHandlers;
    }, []);

    const getConfigAccessors = useCallback((): ITableConfigAccessors => {
        const configAccessors = configAccessorsRef.current;
        invariant(configAccessors);

        return configAccessors;
    }, []);

    //
    // Table configuration accessors
    //

    const getLastSortedColId = useCallback((): string | null => internalRef.current.lastSortedColId, []);

    const setLastSortedColId = useCallback((colId: string | null): void => {
        internalRef.current.lastSortedColId = colId;
    }, []);

    // Delegate to config accessors
    const getColumnTotals = useCallback(
        () => getConfigAccessors().configDelegates.getColumnTotals(),
        [getConfigAccessors],
    );
    const getRowTotals = useCallback(
        () => getConfigAccessors().configDelegates.getRowTotals(),
        [getConfigAccessors],
    );
    const getExecutionDefinition = useCallback(
        () => getConfigAccessors().configDelegates.getExecutionDefinition(),
        [getConfigAccessors],
    );
    const getGroupRows = useCallback(
        () => getConfigAccessors().configDelegates.getGroupRows(),
        [getConfigAccessors],
    );
    const getMeasureGroupDimension = useCallback(
        () => getConfigAccessors().configDelegates.getMeasureGroupDimension(),
        [getConfigAccessors],
    );
    const getColumnHeadersPosition = useCallback(
        () => getConfigAccessors().configDelegates.getColumnHeadersPosition(),
        [getConfigAccessors],
    );
    const getMenuConfig = useCallback(
        () => getConfigAccessors().configDelegates.getMenuConfig(),
        [getConfigAccessors],
    );
    const getDefaultWidth = useCallback(
        () => getConfigAccessors().configDelegates.getDefaultWidth(),
        [getConfigAccessors],
    );
    const isColumnAutoresizeEnabled = useCallback(
        () => getConfigAccessors().configDelegates.isColumnAutoresizeEnabled(),
        [getConfigAccessors],
    );
    const isGrowToFitEnabled = useCallback(
        (props: ICorePivotTableProps = propsRef.current) =>
            getConfigAccessors().configDelegates.isGrowToFitEnabled(props),
        [getConfigAccessors],
    );
    const getColumnWidths = useCallback(
        (props: ICorePivotTableProps) => getConfigAccessors().configDelegates.getColumnWidths(props),
        [getConfigAccessors],
    );
    const hasColumnWidths = useCallback(
        () => getConfigAccessors().configDelegates.hasColumnWidths(),
        [getConfigAccessors],
    );
    const getDefaultWidthFromProps = useCallback(
        (props: ICorePivotTableProps) => getConfigAccessors().configDelegates.getDefaultWidthFromProps(props),
        [getConfigAccessors],
    );
    const shouldAutoResizeColumns = useCallback(
        () => getConfigAccessors().configDelegates.shouldAutoResizeColumns(),
        [getConfigAccessors],
    );

    const getResizingConfig = useCallback((): ColumnResizingConfig => {
        const currentProps = propsRef.current;
        const internal = internalRef.current;

        return {
            defaultWidth: getDefaultWidth(),
            growToFit: isGrowToFitEnabled(),
            columnAutoresizeOption: getDefaultWidthFromProps(currentProps),
            widths: getColumnWidths(currentProps),

            isAltKeyPressed: internal.isAltKeyPressed,
            isMetaOrCtrlKeyPressed: internal.isMetaOrCtrlKeyPressed,

            // use clientWidth of the viewport container to accommodate for vertical scrollbars if needed
            clientWidth:
                containerRef.current?.getElementsByClassName("ag-body-viewport")[0]?.clientWidth ?? 0,
            containerRef: containerRef.current,
            separators: currentProps?.config?.separators,

            onColumnResized: currentProps.onColumnResized,
        };
    }, [getColumnWidths, getDefaultWidth, getDefaultWidthFromProps, isGrowToFitEnabled]);

    /**
     * All pushData calls done by the table must go through this guard.
     *
     * TODO: The guard should ensure a 'disconnect' between push data handling and the calling function processing.
     *  When the pushData is handled by the application, it MAY (and in our case it DOES) trigger processing that
     *  lands back in the table. This opens additional set of invariants to check / be prepared for in order to
     *  optimize the renders and re-renders.
     */
    const pushDataGuard = useCallback((data: IPushData): void => {
        propsRef.current.pushData?.(data);

        /*
         * TODO: Switch to this on in FET-715.
        setTimeout(() => {
            propsRef.current.pushData?.(data);
        }, 0);
         */
    }, []);

    //
    // Sticky row handling - delegated to StickyRowManager
    //

    const updateStickyRow = useCallback((): void => {
        getConfigAccessors().stickyRowManager.updateStickyRow();
    }, [getConfigAccessors]);

    const updateStickyRowContent = useCallback(
        (scrollPosition: IScrollPosition): void => {
            getConfigAccessors().stickyRowManager.updateStickyRowContent(scrollPosition);
        },
        [getConfigAccessors],
    );

    //
    // Desired height updating - delegated to HeightCalculationManager
    //

    const updateDesiredHeight = useCallback((): void => {
        getConfigAccessors().heightCalculationManager.updateDesiredHeight();
    }, [getConfigAccessors]);

    //
    // Table resizing
    //

    const growToFit = useCallback((): void => {
        const internal = internalRef.current;
        invariant(internal.table);

        if (!isGrowToFitEnabled()) {
            return;
        }

        internal.table.growToFit(getResizingConfig());

        if (!stateRef.current.resized && !internal.table.isResizing()) {
            setState({
                resized: true,
            });
        }
    }, [getResizingConfig, isGrowToFitEnabled, setState]);

    const autoresizeColumns = useCallback(
        async (force: boolean = false): Promise<void> => {
            if (stateRef.current.resized && !force) {
                return;
            }

            const didResize = await internalRef.current.table?.autoresizeColumns(getResizingConfig(), force);

            if (didResize) {
                // after column resizing, horizontal scroolbar may change and table height may need resizing
                updateDesiredHeight();
            }

            if (didResize && !stateRef.current.resized) {
                setState({
                    resized: true,
                });
            }
        },
        [getResizingConfig, setState, updateDesiredHeight],
    );

    const stopWatchingTableRendered = useCallback((): void => {
        internalRef.current.stopWatching();
        propsRef.current.afterRender!();
    }, []);

    const startWatchingTableRendered = useCallback((): void => {
        const internal = internalRef.current;

        if (!internal.table) {
            return;
        }

        const missingContainerRef = !containerRef.current; // table having no data will be unmounted, it causes ref null
        const isTableRendered = shouldAutoResizeColumns()
            ? stateRef.current.resized
            : internal.table.isPivotTableReady();
        const shouldCallAutoresizeColumns =
            internal.table.isPivotTableReady() && !stateRef.current.resized && !internal.table.isResizing();

        if (shouldAutoResizeColumns() && shouldCallAutoresizeColumns) {
            void autoresizeColumns();
        }

        if (missingContainerRef || isTableRendered) {
            stopWatchingTableRendered();
        }
    }, [autoresizeColumns, shouldAutoResizeColumns, stopWatchingTableRendered]);

    //
    // event handlers
    //

    const onGridReady = useCallback(
        (event: GridReadyEvent): void => {
            getEventHandlers().gridEventHandlers.onGridReady(event);
        },
        [getEventHandlers],
    );

    const onFirstDataRendered = useCallback(
        async (_event?: AgGridEvent): Promise<void> => {
            await getEventHandlers().dataRenderHandlers.onFirstDataRendered(_event);
        },
        [getEventHandlers],
    );

    const onModelUpdated = useCallback(
        (event: AgGridEvent): void => {
            getEventHandlers().gridEventHandlers.onModelUpdated(event);
        },
        [getEventHandlers],
    );

    const onGridColumnsChanged = useCallback((): void => {
        getEventHandlers().gridEventHandlers.onGridColumnsChanged();
    }, [getEventHandlers]);

    const onGridSizeChanged = useCallback(
        (gridSizeChangedEvent: GridSizeChangedEvent): void => {
            getEventHandlers().resizeEventHandlers.onGridSizeChanged(gridSizeChangedEvent);
        },
        [getEventHandlers],
    );

    const onGridColumnResized = useCallback(
        (columnEvent: ColumnResizedEvent): void => {
            getEventHandlers().resizeEventHandlers.onGridColumnResized(columnEvent);
        },
        [getEventHandlers],
    );

    const onSortChanged = useCallback(
        (event: SortChangedEvent): void => {
            getEventHandlers().sortingEventHandlers.onSortChanged(event);
        },
        [getEventHandlers],
    );

    const onPinnedRowDataChanged = useCallback(
        async (event: PinnedRowDataChangedEvent): Promise<void> => {
            await getEventHandlers().resizeEventHandlers.onPinnedRowDataChanged(event);
        },
        [getEventHandlers],
    );

    const onBodyScroll = useCallback(
        (event: BodyScrollEvent): void => {
            getEventHandlers().scrollEventHandlers.onBodyScroll(event);
        },
        [getEventHandlers],
    );

    const onContainerMouseDown = useCallback(
        (event: MouseEvent): void => {
            getEventHandlers().scrollEventHandlers.onContainerMouseDown(event);
        },
        [getEventHandlers],
    );

    const onPageLoaded = useCallback(
        (dv: DataViewFacade, newResult: boolean): void => {
            getEventHandlers().dataLoadingEventHandlers.onPageLoaded(dv, newResult);
        },
        [getEventHandlers],
    );

    const onMenuAggregationClick = useCallback(
        (menuAggregationClickConfig: IMenuAggregationClickConfig): void => {
            getEventHandlers().aggregationEventHandlers.onMenuAggregationClick(menuAggregationClickConfig);
        },
        [getEventHandlers],
    );

    const onLoadingChanged = useCallback(
        (loadingState: ILoadingState): void => {
            getEventHandlers().dataLoadingEventHandlers.onLoadingChanged(loadingState);
        },
        [getEventHandlers],
    );

    const onError = useCallback(
        (error: GoodDataSdkError, execution: IPreparedExecution = propsRef.current.execution): void => {
            getEventHandlers().dataLoadingEventHandlers.onError(error, execution);
        },
        [getEventHandlers],
    );

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
    const onExecutionTransformed = useCallback(
        (newExecution: IPreparedExecution): void => {
            // Handle the reinitialize call directly here since we can't pass it to the handler
            const internal = internalRef.current;

            if (!internal.table) {
                return;
            }

            internal.table.clearStickyRow();

            // Force double execution only when totals/subtotals for columns change, so table is render properly.
            if (
                !isEqual(
                    stateRef.current.tempExecution.definition.buckets[2],
                    newExecution.definition.buckets[2],
                )
            ) {
                setState({
                    tempExecution: newExecution,
                });
                reinitializeRef.current(newExecution);
            }
        },
        [setState],
    );

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
    const createBoundAgGridCallbacks = useCallback((): TableAgGridCallbacks => {
        const internal = internalRef.current;
        const debouncedGridSizeChanged = createDebouncedCallback(
            createStateBoundCallback(onGridSizeChanged, internal, getInternal),
            AGGRID_ON_RESIZE_TIMEOUT,
        );

        return {
            onGridReady: createStateBoundCallback(onGridReady, internal, getInternal),
            onFirstDataRendered: createStateBoundCallback(onFirstDataRendered, internal, getInternal),
            onBodyScroll: createStateBoundCallback(onBodyScroll, internal, getInternal),
            onModelUpdated: createStateBoundCallback(onModelUpdated, internal, getInternal),
            onGridColumnsChanged: createStateBoundCallback(onGridColumnsChanged, internal, getInternal),
            onGridColumnResized: createStateBoundCallback(onGridColumnResized, internal, getInternal),
            onSortChanged: createStateBoundCallback(onSortChanged, internal, getInternal),
            onGridSizeChanged: debouncedGridSizeChanged,
            onPinnedRowDataChanged: createStateBoundCallback(onPinnedRowDataChanged, internal, getInternal),
        };
    }, [
        getInternal,
        onBodyScroll,
        onFirstDataRendered,
        onGridColumnResized,
        onGridColumnsChanged,
        onGridReady,
        onGridSizeChanged,
        onModelUpdated,
        onPinnedRowDataChanged,
        onSortChanged,
    ]);

    const getTableMethods = useCallback((): TableMethods => {
        const boundAgGridCallbacks = boundAgGridCallbacksRef.current;
        invariant(boundAgGridCallbacks);

        return {
            hasColumnWidths: hasColumnWidths(),

            getExecutionDefinition,
            getMenuConfig,
            getGroupRows,
            getColumnTotals,
            getRowTotals,
            getColumnHeadersPosition,
            getMeasureGroupDimension,
            getResizingConfig,
            onLoadingChanged,
            onError,
            onExportReady: propsRef.current.onExportReady ?? (() => {}),
            pushData: pushDataGuard,
            onPageLoaded,
            onExecutionTransformed,
            onMenuAggregationClick,
            setLastSortedColId,

            ...boundAgGridCallbacks,
        };
    }, [
        getColumnHeadersPosition,
        getColumnTotals,
        getExecutionDefinition,
        getGroupRows,
        getMeasureGroupDimension,
        getMenuConfig,
        getResizingConfig,
        getRowTotals,
        hasColumnWidths,
        onError,
        onExecutionTransformed,
        onLoadingChanged,
        onMenuAggregationClick,
        onPageLoaded,
        pushDataGuard,
        setLastSortedColId,
    ]);

    //
    // Initialization of the imperative parts of the table
    //

    const initializeEventHandlers = useCallback((): void => {
        const internal = internalRef.current;
        const currentProps = propsRef.current;

        // Create event handler instances with proper context
        eventHandlersRef.current = {
            gridEventHandlers: new GridEventHandlers({
                internal,
                props: currentProps,
                updateDesiredHeight,
                onFirstDataRendered,
                updateStickyRow,
                getGroupRows,
                getLastSortedColId,
                setLastSortedColId,
            }),

            dataRenderHandlers: new DataRenderHandlers({
                internal,
                isColumnAutoresizeEnabled,
                isGrowToFitEnabled,
                autoresizeColumns,
                growToFit,
                updateStickyRow,
                startWatchingTableRendered,
            }),

            scrollEventHandlers: new ScrollEventHandlers({
                internal,
                updateStickyRowContent,
            }),

            resizeEventHandlers: new ResizeEventHandlers({
                internal,
                updateDesiredHeight,
                autoresizeColumns,
                getResizingConfig,
            }),

            sortingEventHandlers: new SortingEventHandlers({
                internal,
                getExecutionDefinition,
                pushDataGuard,
                setState,
            }),

            aggregationEventHandlers: new AggregationEventHandlers({
                internal,
                getExecutionDefinition,
                getColumnTotals,
                getRowTotals,
                pushDataGuard,
                setState,
            }),

            dataLoadingEventHandlers: new DataLoadingEventHandlers({
                internal,
                props: currentProps,
                updateStickyRow,
                updateDesiredHeight,
                setState,
            }),
        };
    }, [
        autoresizeColumns,
        getColumnTotals,
        getExecutionDefinition,
        getGroupRows,
        getLastSortedColId,
        getResizingConfig,
        getRowTotals,
        growToFit,
        isColumnAutoresizeEnabled,
        isGrowToFitEnabled,
        onFirstDataRendered,
        pushDataGuard,
        setLastSortedColId,
        setState,
        startWatchingTableRendered,
        updateDesiredHeight,
        updateStickyRow,
        updateStickyRowContent,
    ]);

    const createComponentUpdateAnalyzer = useCallback(
        (): ComponentUpdateAnalyzer =>
            new ComponentUpdateAnalyzer({
                props: propsRef.current,
                state: stateRef.current,
                internal: internalRef.current,
                executionAbortManager,
            }),
        [executionAbortManager],
    );

    const initializeConfigAccessors = useCallback((): void => {
        const internal = internalRef.current;
        const currentProps = propsRef.current;
        const currentState = stateRef.current;

        const configAccessors = new TableConfigAccessors({
            props: currentProps,
            state: currentState,
        });

        configAccessorsRef.current = {
            configAccessors,
            configDelegates: createConfigDelegates(configAccessors),

            // Initialize sticky row manager
            stickyRowManager: new StickyRowManager({
                internal,
                props: currentProps,
                state: currentState,
                getGroupRows,
            }),

            // Initialize height calculation manager
            heightCalculationManager: new HeightCalculationManager({
                internal,
                props: currentProps,
                state: currentState,
                setState,
                getContainerRef,
            }),
        };

        // Initialize component update analyzer
        componentUpdateAnalyzerRef.current = createComponentUpdateAnalyzer();
    }, [createComponentUpdateAnalyzer, getContainerRef, getGroupRows, setState]);

    /*
     * Mirrors what the class constructor used to do: create the event handlers, config accessors and the
     * ag-grid callbacks before anything gets rendered.
     */
    const isInitializedRef = useRef(false);
    if (!isInitializedRef.current) {
        isInitializedRef.current = true;

        initializeEventHandlers();
        initializeConfigAccessors();
        boundAgGridCallbacksRef.current = createBoundAgGridCallbacks();
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
    const initialize = useCallback(
        (execution: IPreparedExecution): TableFacadeInitializer => {
            internalRef.current.abandonInitialization();
            executionAbortManager.refresh({
                isLoading: stateRef.current.isLoading,
                readyToRender: stateRef.current.readyToRender,
            });
            const initializer = new TableFacadeInitializer(
                execution,
                getTableMethods(),
                propsRef.current,
                () => executionAbortManager.getCurrentController(),
            );

            void initializer.initialize().then((result) => {
                if (!result || internalRef.current.initializer !== result.initializer) {
                    /*
                     * This particular initialization was abandoned.
                     */
                    return;
                }

                internalRef.current.initializer = undefined;
                internalRef.current.table = result.table;
                setState({ readyToRender: true });
            });

            return initializer;
        },
        [executionAbortManager, getTableMethods, setState],
    );

    /**
     * Completely re-initializes the table in order to show data for the provided prepared execution. At this point
     * code has determined that the table layout for the other prepared execution differs from what is currently
     * shown and the only reasonable thing to do is to throw everything away and start from scratch.
     *
     * This will reset all React state and non-react state and start table initialization process.
     */
    const reinitialize = useCallback(
        (execution: IPreparedExecution): void => {
            setState(
                {
                    readyToRender: false,
                    columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
                    rowTotals: getTotalsForColumnsBucket(execution.definition),
                    error: undefined,
                    desiredHeight: propsRef.current.config!.maxHeight,
                    resized: false,
                },
                () => {
                    internalRef.current.destroy();
                    internalRef.current = new InternalTableState();
                    initializeEventHandlers();
                    initializeConfigAccessors();
                    boundAgGridCallbacksRef.current = createBoundAgGridCallbacks();
                    internalRef.current.initializer = initialize(execution);
                },
            );
        },
        [
            createBoundAgGridCallbacks,
            initialize,
            initializeConfigAccessors,
            initializeEventHandlers,
            setState,
        ],
    );
    reinitializeRef.current = reinitialize;

    /**
     * Handles the component update; this is the functional equivalent of what used to live in
     * `componentDidUpdate`.
     */
    const handleUpdate = useCallback(
        (prevProps: ICorePivotTableProps): void => {
            const currentProps = propsRef.current;
            const previousAnalyzer = componentUpdateAnalyzerRef.current;
            invariant(previousAnalyzer);

            // Update execution abort manager config if it changed
            if (previousAnalyzer.hasExecutionCancellingChanged(prevProps)) {
                executionAbortManager.updateConfig({
                    enableExecutionCancelling: currentProps.config?.enableExecutionCancelling,
                });
            }

            // Update component update analyzer context
            const componentUpdateAnalyzer = createComponentUpdateAnalyzer();
            componentUpdateAnalyzerRef.current = componentUpdateAnalyzer;

            // reinit in progress
            if (componentUpdateAnalyzer.shouldSkipUpdate()) {
                return;
            }

            if (componentUpdateAnalyzer.isReinitNeeded(prevProps)) {
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
                componentUpdateAnalyzer.logReinitDebug(prevProps.execution);
                reinitialize(currentProps.execution);
            } else {
                /*
                 * When in this branch, the ag-grid instance is up and running and is already showing some data and
                 * it _should_ be possible to normally use the ag-grid APIs.
                 *
                 * The currentResult and visibleData _will_ be available at this point because the component is definitely
                 * after a successful execution and initialization.
                 */

                if (componentUpdateAnalyzer.shouldRefreshHeader(prevProps)) {
                    internalRef.current.table?.refreshHeader();
                }

                if (componentUpdateAnalyzer.hasGrowToFitEnabledChanged(prevProps, isGrowToFitEnabled)) {
                    growToFit();
                }

                if (componentUpdateAnalyzer.hasColumnWidthsChanged(prevProps, getColumnWidths)) {
                    internalRef.current.table?.applyColumnSizes(getResizingConfig());
                }

                if (componentUpdateAnalyzer.hasMaxHeightChanged(prevProps)) {
                    updateDesiredHeight();
                }
            }
        },
        [
            createComponentUpdateAnalyzer,
            executionAbortManager,
            getColumnWidths,
            getResizingConfig,
            growToFit,
            isGrowToFitEnabled,
            reinitialize,
            updateDesiredHeight,
        ],
    );

    // componentDidMount & componentWillUnmount
    useLayoutEffect(() => {
        internalRef.current.initializer = initialize(propsRef.current.execution);

        return () => {
            executionAbortManager.destroy();
            if (containerRef.current) {
                containerRef.current.removeEventListener("mousedown", onContainerMouseDown);
            }

            // this ensures any events emitted during the async initialization will be sunk. they are no longer needed.
            internalRef.current.destroy();
        };
        // the table must be initialized on mount only; all the functions used here are stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // componentDidUpdate
    const prevPropsRef = useRef(resolvedProps);
    const isMountedRef = useRef(false);
    useLayoutEffect(() => {
        const prevProps = prevPropsRef.current;
        prevPropsRef.current = resolvedProps;

        if (!isMountedRef.current) {
            // the update handling must not run for the initial render
            isMountedRef.current = true;
            return;
        }

        handleUpdate(prevProps);
    });

    // drain the setState callbacks; they run right after the commit of the state update that registered them
    useLayoutEffect(() => {
        if (committedStateUpdateCallbacks.current.length === 0) {
            return;
        }

        const callbacks = committedStateUpdateCallbacks.current;
        committedStateUpdateCallbacks.current = [];
        callbacks.forEach((callback) => callback());
    });

    //
    // Render
    //

    const setContainerRef = useCallback(
        (container: HTMLDivElement | null): void => {
            containerRef.current = container ?? undefined;

            if (containerRef.current) {
                containerRef.current.addEventListener("mousedown", onContainerMouseDown);
            }
        },
        [onContainerMouseDown],
    );

    const renderLoading = () => {
        const { LoadingComponent, theme } = resolvedProps;

        return <PivotTableLoading LoadingComponent={LoadingComponent} theme={theme} />;
    };

    const { ErrorComponent } = resolvedProps;
    const { desiredHeight, error } = state;

    if (error) {
        return <PivotTableError error={error} errorMap={errorMap} ErrorComponent={ErrorComponent} />;
    }

    const style: CSSProperties = {
        height: desiredHeight || "100%",
        position: "relative",
        overflow: "hidden",
    };

    if (!state.readyToRender) {
        return (
            <div className="gd-table-component" style={style} id={pivotTableId}>
                {renderLoading()}
            </div>
        );
    }

    const internal = internalRef.current;

    // when table is ready, then the table facade must be set. if this bombs then there is a bug
    // in the initialization logic
    invariant(internal.table);

    if (!internal.gridOptions) {
        internal.gridOptions = createGridOptions(internal.table, getTableMethods(), resolvedProps);
    }

    /*
     * Show loading overlay until all the resizing is done. This is because the various resizing operations
     * have to happen asynchronously - they must wait until ag-grid fires onFirstDataRendered, before our code
     * can start reliably interfacing with the autosizing features.
     */
    const shouldRenderLoadingOverlay =
        (isColumnAutoresizeEnabled() || isGrowToFitEnabled()) && !state.resized;

    const classNames = cx("gd-table-component", {
        "gd-table-header-hide":
            resolvedProps.config?.columnHeadersPosition === "left" &&
            internal.table.tableDescriptor.isTransposed(),
    });

    return (
        <div
            className={classNames}
            style={style}
            id={pivotTableId}
            onMouseDown={stopEventWhenResizeHeader}
            onDragStart={stopEventWhenResizeHeader}
        >
            <div className="gd-table ag-theme-balham s-pivot-table" style={style} ref={setContainerRef}>
                <AgGridReact {...internal.gridOptions} modules={[AllCommunityModule]} />
                {shouldRenderLoadingOverlay ? renderLoading() : null}
            </div>
        </div>
    );
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
