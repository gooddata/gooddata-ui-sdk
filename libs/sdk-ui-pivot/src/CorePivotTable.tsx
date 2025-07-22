// (C) 2007-2025 GoodData Corporation
import {
    AgGridEvent,
    AllCommunityModule,
    BodyScrollEvent,
    ColumnResizedEvent,
    GridReadyEvent,
    SortChangedEvent,
    PinnedRowDataChangedEvent,
    ModuleRegistry,
    provideGlobalGridOptions,
} from "ag-grid-community";

import { v4 as uuidv4 } from "uuid";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { injectIntl } from "react-intl";
import cx from "classnames";
import {
    BucketNames,
    createExportErrorFunction,
    DataViewFacade,
    ErrorCodes,
    GoodDataSdkError,
    IErrorDescriptors,
    ILoadingState,
    IntlWrapper,
    IPushData,
    newErrorMapping,
} from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { getUpdatedColumnOrRowTotals } from "./impl/structure/headers/aggregationsMenuHelper.js";
import { getScrollbarWidth, sanitizeDefTotals, getTotalsForColumnsBucket } from "./impl/utils.js";
import { IScrollPosition } from "./impl/stickyRowHandler.js";

import {
    ColumnHeadersPosition,
    DefaultColumnWidth,
    ICorePivotTableProps,
    IMenu,
    MeasureGroupDimension,
} from "./publicTypes.js";
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
import {
    InternalTableState,
    ITableRenderState,
    ITableDataState,
    ITableLayoutState,
    ITableErrorState,
} from "./tableState.js";
import { isColumnAutoresizeEnabled as isColumnAutoresizeEnabledUtil } from "./impl/resizing/columnSizing.js";
import cloneDeep from "lodash/cloneDeep.js";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" });

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
export function CorePivotTableAgImpl({
    drillableItems = [],
    afterRender = noop,
    pushData = noop,
    onExportReady = noop,
    onLoadingChanged = noop,
    onError = noop,
    onDataView = noop,
    ErrorComponent,
    LoadingComponent,
    config = {},
    onColumnResized = noop,
    ...props
}: ICorePivotTableProps) {
    const { execution } = props;

    // Separated state for better performance and maintainability
    const [renderState, setRenderState] = useState<ITableRenderState>({
        readyToRender: false,
        isLoading: false,
    });

    const [dataState, setDataState] = useState<ITableDataState>({
        columnTotals: cloneDeep(sanitizeDefTotals(execution.definition)),
        rowTotals: getTotalsForColumnsBucket(execution.definition),
        tempExecution: execution,
    });

    const [layoutState, setLayoutState] = useState<ITableLayoutState>({
        desiredHeight: config?.maxHeight,
        resized: false,
    });

    const [errorState, setErrorState] = useState<ITableErrorState>({
        error: undefined,
    });

    const errorMapRef = useRef<IErrorDescriptors>(newErrorMapping(props.intl));
    const containerRef = useRef<HTMLDivElement | undefined>();
    const pivotTableIdRef = useRef<string>(uuidv4().replace(/-/g, ""));
    const internalRef = useRef<InternalTableState>(new InternalTableState());
    const abortControllerRef = useRef<AbortController | undefined>(
        config?.enableExecutionCancelling ? new AbortController() : undefined,
    );
    const reinitializeRef = useRef<((execution: IPreparedExecution) => void) | undefined>();

    //
    // Lifecycle
    //

    const refreshAbortController = useCallback((): void => {
        if (config?.enableExecutionCancelling) {
            if (renderState.isLoading || !renderState.readyToRender) {
                abortControllerRef.current?.abort();
            }
            abortControllerRef.current = new AbortController();
        }
    }, [config?.enableExecutionCancelling, renderState.isLoading, renderState.readyToRender]);

    const getCurrentAbortController = useCallback((): AbortController | undefined => {
        return config?.enableExecutionCancelling ? abortControllerRef.current : undefined;
    }, [config?.enableExecutionCancelling]);

    const onContainerMouseDown = useCallback((event: MouseEvent) => {
        internalRef.current.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
        internalRef.current.isAltKeyPressed = event.altKey;
    }, []);

    const setContainerRef = useCallback(
        (container: HTMLDivElement): void => {
            containerRef.current = container;

            if (containerRef.current) {
                containerRef.current.addEventListener("mousedown", onContainerMouseDown);
            }
        },
        [onContainerMouseDown],
    );

    const onLoadingChangedHandler = useCallback(
        (loadingState: ILoadingState): void => {
            if (onLoadingChanged) {
                onLoadingChanged(loadingState);

                setRenderState((prevState) => ({ ...prevState, isLoading: loadingState.isLoading }));
            }
        },
        [onLoadingChanged],
    );

    const onErrorHandler = useCallback(
        (error: GoodDataSdkError, executionToCheck = execution) => {
            if (execution.fingerprint() === executionToCheck.fingerprint()) {
                setErrorState({ error: error.getMessage() });
                setRenderState((prevState) => ({ ...prevState, readyToRender: true }));

                // update loading state when an error occurs
                onLoadingChangedHandler({ isLoading: false });

                onExportReady(createExportErrorFunction(error));

                onError?.(error);
            }
        },
        [execution, onLoadingChangedHandler, onExportReady, onError],
    );

    //
    // Table configuration accessors
    //

    const getLastSortedColId = useCallback((): string | null => {
        return internalRef.current.lastSortedColId;
    }, []);

    const setLastSortedColId = useCallback((colId: string | null): void => {
        internalRef.current.lastSortedColId = colId;
    }, []);

    const getColumnTotals = useCallback(() => {
        return dataState.columnTotals;
    }, [dataState.columnTotals]);

    const getRowTotals = useCallback(() => {
        return dataState.rowTotals;
    }, [dataState.rowTotals]);

    const getExecutionDefinition = useCallback(() => {
        return execution.definition;
    }, [execution.definition]);

    const getGroupRows = useCallback((): boolean => {
        return config?.groupRows ?? true;
    }, [config?.groupRows]);

    const getMeasureGroupDimension = useCallback((): MeasureGroupDimension => {
        return config?.measureGroupDimension ?? "columns";
    }, [config?.measureGroupDimension]);

    const getColumnHeadersPosition = useCallback((): ColumnHeadersPosition => {
        return config?.columnHeadersPosition ?? "top";
    }, [config?.columnHeadersPosition]);

    const getMenuConfig = useCallback((): IMenu => {
        return config?.menu ?? {};
    }, [config?.menu]);

    const getDefaultWidth = useCallback(() => {
        return DEFAULT_COLUMN_WIDTH;
    }, []);

    const getDefaultWidthFromProps = useCallback((propsToCheck: ICorePivotTableProps): DefaultColumnWidth => {
        return propsToCheck.config?.columnSizing?.defaultWidth ?? "unset";
    }, []);

    const isColumnAutoresizeEnabled = useCallback(() => {
        const defaultWidth = getDefaultWidthFromProps(props);
        return isColumnAutoresizeEnabledUtil(defaultWidth);
    }, [getDefaultWidthFromProps, props]);

    const isGrowToFitEnabled = useCallback(
        (propsToCheck: ICorePivotTableProps = props) => {
            return propsToCheck.config?.columnSizing?.growToFit === true;
        },
        [props],
    );

    const getColumnWidths = useCallback(
        (propsToCheck: ICorePivotTableProps): ColumnWidthItem[] | undefined => {
            return propsToCheck.config?.columnSizing?.columnWidths;
        },
        [],
    );

    const hasColumnWidths = useCallback(() => {
        return !!getColumnWidths(props);
    }, [getColumnWidths, props]);

    /**
     * All pushData calls done by the table must go through this guard.
     *
     * TODO: The guard should ensure a 'disconnect' between push data handling and the calling function processing.
     *  When the pushData is handled by the application, it MAY (and in our case it DOES) trigger processing that
     *  lands back in the table. This opens additional set of invariants to check / be prepared for in order to
     *  optimize the renders and re-renders.
     */
    const pushDataGuard = useCallback(
        (data: IPushData): void => {
            pushData?.(data);

            /*
         * TODO: Switch to this on in FET-715.
        setTimeout(() => {
            pushData?.(data);
        }, 0);
         */
        },
        [pushData],
    );

    const getScrollBarPadding = useCallback((): number => {
        if (!internalRef.current.table?.isFullyInitialized()) {
            return 0;
        }

        if (!containerRef.current) {
            return 0;
        }

        // check for scrollbar presence
        return scrollBarExists(containerRef.current) ? getScrollbarWidth() : 0;
    }, []);

    const calculateDesiredHeight = useCallback((): number | undefined => {
        const { maxHeight } = config ?? {};
        if (!maxHeight) {
            return;
        }
        const bodyHeight = internalRef.current.table?.getTotalBodyHeight() ?? 0;
        const totalHeight = bodyHeight + getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    }, [config, getScrollBarPadding]);

    const updateDesiredHeight = useCallback((): void => {
        if (!internalRef.current.table) {
            return;
        }

        const desiredHeight = calculateDesiredHeight();

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
            layoutState.desiredHeight === undefined ||
            (desiredHeight !== undefined &&
                Math.abs(layoutState.desiredHeight - desiredHeight) > HEIGHT_CHANGE_TOLERANCE)
        ) {
            setLayoutState((prevState) => ({ ...prevState, desiredHeight }));
        }
    }, [calculateDesiredHeight, layoutState.desiredHeight]);

    const getResizingConfig = useCallback((): ColumnResizingConfig => {
        return {
            defaultWidth: getDefaultWidth(),
            growToFit: isGrowToFitEnabled(),
            columnAutoresizeOption: getDefaultWidthFromProps(props),
            widths: getColumnWidths(props),

            isAltKeyPressed: internalRef.current.isAltKeyPressed,
            isMetaOrCtrlKeyPressed: internalRef.current.isMetaOrCtrlKeyPressed,

            // use clientWidth of the viewport container to accommodate for vertical scrollbars if needed
            clientWidth:
                containerRef.current?.getElementsByClassName("ag-body-viewport")[0]?.clientWidth ?? 0,
            containerRef: containerRef.current,
            separators: config?.separators,

            onColumnResized: onColumnResized,
        };
    }, [
        getDefaultWidth,
        isGrowToFitEnabled,
        getDefaultWidthFromProps,
        props,
        getColumnWidths,
        config?.separators,
        onColumnResized,
    ]);

    //
    // Sticky row handling
    //

    const isStickyRowAvailable = useCallback((): boolean => {
        invariant(internalRef.current.table);

        return Boolean(getGroupRows() && internalRef.current.table.stickyRowExists());
    }, [getGroupRows]);

    const updateStickyRowContent = useCallback(
        (scrollPosition: IScrollPosition): void => {
            invariant(internalRef.current.table);

            if (isStickyRowAvailable()) {
                // Position update was moved here because in some complicated cases with totals,
                // it was not behaving properly. This was mainly visible in storybook, but it may happen
                // in other environments as well.
                internalRef.current.table.updateStickyRowPosition();

                internalRef.current.table.updateStickyRowContent({
                    scrollPosition,
                    lastScrollPosition: internalRef.current.lastScrollPosition,
                });
            }

            internalRef.current.lastScrollPosition = { ...scrollPosition };
        },
        [isStickyRowAvailable],
    );

    const updateStickyRow = useCallback((): void => {
        if (!internalRef.current.table) {
            return;
        }

        if (isStickyRowAvailable()) {
            const scrollPosition: IScrollPosition = { ...internalRef.current.lastScrollPosition };
            internalRef.current.lastScrollPosition = {
                top: 0,
                left: 0,
            };

            updateStickyRowContent(scrollPosition);
        }
    }, [isStickyRowAvailable, updateStickyRowContent]);

    //
    // Table resizing
    //

    const growToFit = useCallback(() => {
        invariant(internalRef.current.table);

        if (!isGrowToFitEnabled()) {
            return;
        }

        internalRef.current.table.growToFit(getResizingConfig());

        if (!layoutState.resized && !internalRef.current.table.isResizing()) {
            setLayoutState((prevState) => ({
                ...prevState,
                resized: true,
            }));
        }
    }, [isGrowToFitEnabled, getResizingConfig, layoutState.resized]);

    const autoresizeColumns = useCallback(
        async (force: boolean = false) => {
            if (layoutState.resized && !force) {
                return;
            }

            const didResize = await internalRef.current.table?.autoresizeColumns(getResizingConfig(), force);

            if (didResize) {
                // after column resizing, horizontal scroolbar may change and table height may need resizing
                updateDesiredHeight();
            }

            if (didResize && !layoutState.resized) {
                setLayoutState((prevState) => ({
                    ...prevState,
                    resized: true,
                }));
            }
        },
        [layoutState.resized, getResizingConfig, updateDesiredHeight],
    );

    const shouldAutoResizeColumns = useCallback(() => {
        const columnAutoresize = isColumnAutoresizeEnabled();
        const growToFitOption = isGrowToFitEnabled();
        return columnAutoresize || growToFitOption;
    }, [isColumnAutoresizeEnabled, isGrowToFitEnabled]);

    const stopWatchingTableRendered = useCallback(() => {
        internalRef.current.stopWatching();
        afterRender();
    }, [afterRender]);

    const startWatchingTableRendered = useCallback(() => {
        if (!internalRef.current.table) {
            return;
        }

        const missingContainerRef = !containerRef.current; // table having no data will be unmounted, it causes ref null
        const isTableRendered = shouldAutoResizeColumns()
            ? layoutState.resized
            : internalRef.current.table.isPivotTableReady();
        const shouldCallAutoresizeColumns =
            internalRef.current.table.isPivotTableReady() &&
            !layoutState.resized &&
            !internalRef.current.table.isResizing();

        if (shouldAutoResizeColumns() && shouldCallAutoresizeColumns) {
            autoresizeColumns();
        }

        if (missingContainerRef || isTableRendered) {
            stopWatchingTableRendered();
        }
    }, [shouldAutoResizeColumns, layoutState.resized, autoresizeColumns, stopWatchingTableRendered]);

    //
    // event handlers
    //

    const onFirstDataRendered = useCallback(
        async (_event?: AgGridEvent) => {
            invariant(internalRef.current.table);

            if (internalRef.current.firstDataRendered) {
                console.error("onFirstDataRendered called multiple times");
            }

            internalRef.current.firstDataRendered = true;

            // Since issue here is not resolved, https://github.com/ag-grid/ag-grid/issues/3263,
            // work-around by using 'setInterval'
            internalRef.current.startWatching(startWatchingTableRendered, WATCHING_TABLE_RENDERED_INTERVAL);

            /*
             * At this point data from backend is available, some of it is rendered and auto-resize can be done.
             *
             * See: https://www.ag-grid.com/javascript-grid-resizing/#resize-after-data
             *
             * I suspect now that the table life-cycle is somewhat more sane, we can follow the docs. For a good
             * measure, let's throw in a mild timeout. I have observed different results (slightly less space used)
             * when the timeout was not in place.
             */
            if (isColumnAutoresizeEnabled()) {
                await autoresizeColumns();
            } else if (isGrowToFitEnabled()) {
                growToFit();
            }

            updateStickyRow();
        },
        [
            startWatchingTableRendered,
            isColumnAutoresizeEnabled,
            autoresizeColumns,
            isGrowToFitEnabled,
            growToFit,
            updateStickyRow,
        ],
    );

    const onGridReady = useCallback(
        (event: GridReadyEvent) => {
            invariant(internalRef.current.table);

            internalRef.current.table.finishInitialization(event.api, event.api);
            updateDesiredHeight();

            if (getGroupRows()) {
                internalRef.current.table.initializeStickyRow();
            }

            internalRef.current.table.setTooltipFields();

            // when table contains only headers, the onFirstDataRendered
            // is not triggered; trigger it manually
            if (internalRef.current.table.isEmpty()) {
                onFirstDataRendered();
            }
        },
        [updateDesiredHeight, getGroupRows, onFirstDataRendered],
    );

    const onModelUpdated = useCallback(
        (event: AgGridEvent) => {
            updateStickyRow();
            if (internalRef.current.table?.isPivotTableReady()) {
                const lastSortedColId = getLastSortedColId();
                // Restore focus to the header cell
                if (lastSortedColId && event.api) {
                    event.api.setFocusedHeader(lastSortedColId);
                    setLastSortedColId(null);
                }
            }
        },
        [updateStickyRow, getLastSortedColId, setLastSortedColId],
    );

    const onGridColumnsChanged = useCallback(() => {
        updateStickyRow();
    }, [updateStickyRow]);

    const onGridSizeChanged = useCallback(
        (gridSizeChangedEvent: any): void => {
            if (!internalRef.current.firstDataRendered) {
                // ag-grid does emit the grid size changed even before first data gets rendered (i suspect this is
                // to cater for the initial render where it goes from nothing to something that has the headers, and then
                // it starts rendering the data itself)
                //
                // Don't do anything, the resizing will be triggered after the first data is rendered
                return;
            }

            if (!internalRef.current.table) {
                return;
            }

            if (internalRef.current.table.isResizing()) {
                // don't do anything if the table is already resizing. this copies what we have in v7 line however
                // I think it opens room for racy/timing behavior. if the window is resized _while_ the table is resizing
                // it is likely that it will not respect current window size.
                //
                // keeping it like this for now. if needed, we can enqueue an auto-resize request somewhere and process
                // it after resizing finishes.
                return;
            }

            if (
                internalRef.current.checkAndUpdateLastSize(
                    gridSizeChangedEvent.clientWidth,
                    gridSizeChangedEvent.clientHeight,
                )
            ) {
                autoresizeColumns(true);
            }
        },
        [autoresizeColumns],
    );

    const onGridColumnResized = useCallback(
        async (columnEvent: ColumnResizedEvent) => {
            invariant(internalRef.current.table);

            if (!columnEvent.finished) {
                return; // only update the height once the user is done setting the column size
            }

            updateDesiredHeight();

            if (isManualResizing(columnEvent)) {
                internalRef.current.table.onManualColumnResize(getResizingConfig(), columnEvent.columns!);
            }
        },
        [updateDesiredHeight, getResizingConfig],
    );

    const onSortChanged = useCallback(
        (event: SortChangedEvent): void => {
            if (!internalRef.current.table) {
                console.warn("changing sorts without prior execution cannot work");
                return;
            }

            const sortItems = internalRef.current.table.createSortItems(event.api.getAllGridColumns()!);

            // Changing sort may cause subtotals to no longer be reasonably placed - remove them if that is the case
            // This applies only to totals in ATTRIBUTE bucket, column totals are not affected by sorting
            const executionDefinition = getExecutionDefinition();
            const totals = sanitizeDefTotals(executionDefinition, sortItems);

            // eslint-disable-next-line no-console
            console.debug("onSortChanged", sortItems);

            pushDataGuard({
                properties: {
                    sortItems,
                    totals,
                    bucketType: BucketNames.ATTRIBUTE,
                },
            });

            setDataState((prevState) => ({ ...prevState, columnTotals: totals }));

            // Use a timeout to ensure state is updated before refreshing data
            setTimeout(() => {
                internalRef.current.table?.refreshData();
            }, 0);
        },
        [getExecutionDefinition, pushDataGuard],
    );

    const onPinnedRowDataChanged = useCallback(
        async (event: PinnedRowDataChangedEvent) => {
            if (event?.api.getPinnedBottomRowCount() > 0) {
                await autoresizeColumns(true);
            }
        },
        [autoresizeColumns],
    );

    const onBodyScroll = useCallback(
        (event: BodyScrollEvent) => {
            const scrollPosition: IScrollPosition = {
                top: Math.max(event.top, 0),
                left: event.left,
            };

            updateStickyRowContent(scrollPosition);
        },
        [updateStickyRowContent],
    );

    const onPageLoaded = useCallback(
        (dv: DataViewFacade, newResult: boolean): void => {
            onDataView?.(dv);

            if (!internalRef.current.table) {
                return;
            }

            if (newResult) {
                onExportReady?.(internalRef.current.table.createExportFunction(props.exportTitle));
            }

            updateStickyRow();
            updateDesiredHeight();
        },
        [onDataView, onExportReady, props.exportTitle, updateStickyRow, updateDesiredHeight],
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
            if (!internalRef.current.table) {
                return;
            }

            internalRef.current.table.clearStickyRow();

            // Force double execution only when totals/subtotals for columns change, so table is render properly.
            if (!isEqual(dataState.tempExecution.definition.buckets[2], newExecution.definition.buckets[2])) {
                setDataState((prevState) => ({
                    ...prevState,
                    tempExecution: newExecution,
                }));

                // Use ref to break circular dependency between onExecutionTransformed and reinitialize
                if (reinitializeRef.current) {
                    reinitializeRef.current(newExecution);
                }
            }
        },
        [dataState.tempExecution.definition.buckets],
    );

    const onMenuAggregationClick = useCallback(
        (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
            const sortItems = internalRef.current.table?.getSortItems();
            const { isColumn } = menuAggregationClickConfig;

            if (isColumn) {
                const newColumnTotals = sanitizeDefTotals(
                    getExecutionDefinition(),
                    sortItems,
                    getUpdatedColumnOrRowTotals(getColumnTotals(), menuAggregationClickConfig),
                );

                pushDataGuard({
                    properties: {
                        totals: newColumnTotals,
                        bucketType: BucketNames.ATTRIBUTE,
                    },
                });

                setDataState((prevState) => ({ ...prevState, columnTotals: newColumnTotals }));

                // Use a timeout to ensure state is updated before refreshing data
                setTimeout(() => {
                    internalRef.current.table?.refreshData();
                }, 0);
            } else {
                const newRowTotals = getUpdatedColumnOrRowTotals(getRowTotals(), menuAggregationClickConfig);

                setDataState((prevState) => ({ ...prevState, rowTotals: newRowTotals }));

                // Use a timeout to ensure state is updated before refreshing data
                setTimeout(() => {
                    internalRef.current.table?.refreshData();
                }, 0);

                pushDataGuard({
                    properties: {
                        totals: newRowTotals,
                        bucketType: BucketNames.COLUMNS,
                    },
                });
            }
        },
        [getExecutionDefinition, getColumnTotals, pushDataGuard, getRowTotals],
    );

    /**
     * Wraps the provided callback function with a guard that checks whether the current table state is the same
     * as the state snapshot at the time of callback creation. If the state differs, the wrapped function WILL NOT
     * be called.
     *
     * @param callback - function to wrap with state guard
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    const stateBoundCallback = useCallback(<T extends Function>(callback: T): T => {
        const forInternalState = internalRef.current;
        return ((...args: any) => {
            if (internalRef.current !== forInternalState) {
                return;
            }
            return callback(...args);
        }) as unknown as T;
    }, []);

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
    const boundAgGridCallbacks = useMemo((): TableAgGridCallbacks => {
        const debouncedGridSizeChanged = debounce(
            stateBoundCallback(onGridSizeChanged),
            AGGRID_ON_RESIZE_TIMEOUT,
        );

        return {
            onGridReady: stateBoundCallback(onGridReady),
            onFirstDataRendered: stateBoundCallback(onFirstDataRendered),
            onBodyScroll: stateBoundCallback(onBodyScroll),
            onModelUpdated: stateBoundCallback(onModelUpdated),
            onGridColumnsChanged: stateBoundCallback(onGridColumnsChanged),
            onGridColumnResized: stateBoundCallback(onGridColumnResized),
            onSortChanged: stateBoundCallback(onSortChanged),
            onGridSizeChanged: debouncedGridSizeChanged,
            onPinnedRowDataChanged: stateBoundCallback(onPinnedRowDataChanged),
        };
    }, [
        stateBoundCallback,
        onGridReady,
        onFirstDataRendered,
        onBodyScroll,
        onModelUpdated,
        onGridColumnsChanged,
        onGridColumnResized,
        onSortChanged,
        onGridSizeChanged,
        onPinnedRowDataChanged,
    ]);

    const getTableMethods = useCallback((): TableMethods => {
        return {
            hasColumnWidths: hasColumnWidths(),

            getExecutionDefinition: getExecutionDefinition,
            getMenuConfig: getMenuConfig,
            getGroupRows: getGroupRows,
            getColumnTotals: getColumnTotals,
            getRowTotals: getRowTotals,
            getColumnHeadersPosition: getColumnHeadersPosition,
            getMeasureGroupDimension: getMeasureGroupDimension,
            getResizingConfig: getResizingConfig,
            onLoadingChanged: onLoadingChangedHandler,
            onError: onErrorHandler,
            onExportReady: onExportReady ?? noop,
            pushData: pushDataGuard,
            onPageLoaded: onPageLoaded,
            onExecutionTransformed: onExecutionTransformed,
            onMenuAggregationClick: onMenuAggregationClick,
            setLastSortedColId: setLastSortedColId,

            ...boundAgGridCallbacks,
        };
    }, [
        hasColumnWidths,
        getExecutionDefinition,
        getMenuConfig,
        getGroupRows,
        getColumnTotals,
        getRowTotals,
        getColumnHeadersPosition,
        getMeasureGroupDimension,
        getResizingConfig,
        onLoadingChangedHandler,
        onErrorHandler,
        onExportReady,
        pushDataGuard,
        onPageLoaded,
        onExecutionTransformed,
        onMenuAggregationClick,
        setLastSortedColId,
        boundAgGridCallbacks,
    ]);

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
        (executionToInit: IPreparedExecution): TableFacadeInitializer => {
            internalRef.current.abandonInitialization();
            refreshAbortController();
            const initializer = new TableFacadeInitializer(
                executionToInit,
                getTableMethods(),
                props,
                getCurrentAbortController,
            );

            initializer.initialize().then((result) => {
                if (!result || internalRef.current.initializer !== result.initializer) {
                    /*
                     * This particular initialization was abandoned.
                     */
                    return;
                }

                internalRef.current.initializer = undefined;
                internalRef.current.table = result.table;
                setRenderState((prevState) => ({ ...prevState, readyToRender: true }));
            });

            return initializer;
        },
        [refreshAbortController, getTableMethods, props, getCurrentAbortController],
    );

    /**
     * Completely re-initializes the table in order to show data for the provided prepared execution. At this point
     * code has determined that the table layout for the other prepared execution differs from what is currently
     * shown and the only reasonable thing to do is to throw everything away and start from scratch.
     *
     * This will reset all React state and non-react state and start table initialization process.
     */
    const reinitialize = useCallback(
        (executionToReinit: IPreparedExecution): void => {
            setRenderState({
                readyToRender: false,
                isLoading: false,
            });

            setDataState({
                columnTotals: cloneDeep(sanitizeDefTotals(executionToReinit.definition)),
                rowTotals: getTotalsForColumnsBucket(executionToReinit.definition),
                tempExecution: executionToReinit,
            });

            setLayoutState({
                desiredHeight: config?.maxHeight,
                resized: false,
            });

            setErrorState({
                error: undefined,
            });

            // Use setTimeout to ensure state update is processed before reinitializing
            setTimeout(() => {
                internalRef.current.destroy();
                internalRef.current = new InternalTableState();
                internalRef.current.initializer = initialize(executionToReinit);
            }, 0);
        },
        [config?.maxHeight, initialize],
    );

    // Update the ref whenever reinitialize changes to break circular dependency
    reinitializeRef.current = reinitialize;

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
    const isReinitNeeded = useCallback(
        (prevProps: ICorePivotTableProps): boolean => {
            const drillingIsSame = isEqual(prevProps.drillableItems, drillableItems);

            const columnHeadersPositionIsSame = isEqual(
                prevProps.config?.columnHeadersPosition,
                config?.columnHeadersPosition,
            );

            if (!drillingIsSame) {
                // eslint-disable-next-line no-console
                console.debug("drilling is different", prevProps.drillableItems, drillableItems);

                return true;
            }

            if (!columnHeadersPositionIsSame) {
                return true;
            }

            if (!internalRef.current.table) {
                // Table is not yet fully initialized. See if the initialization is in progress. If so, see if
                // the init is for same execution or not. Otherwise fall back to compare props vs props.
                if (internalRef.current.initializer) {
                    const initializeForSameExec = internalRef.current.initializer.isSameExecution(execution);

                    if (!initializeForSameExec) {
                        // eslint-disable-next-line no-console
                        console.debug("initializer for different execution", execution, prevProps.execution);
                    }

                    return !initializeForSameExec;
                } else {
                    const prepExecutionSame = execution.fingerprint() === prevProps.execution.fingerprint();

                    if (!prepExecutionSame) {
                        // eslint-disable-next-line no-console
                        console.debug("have to reinit table", execution, prevProps.execution);
                    }

                    return !prepExecutionSame;
                }
            }

            return config?.enableExecutionCancelling
                ? prevProps.execution.fingerprint() !== execution.fingerprint()
                : // this is triggering execution multiple times in some cases which is not good together with enabled execution cancelling
                  // on the other hand, without execution cancelling, fingerprint comparison only may lead to race conditions
                  !internalRef.current.table.isMatchingExecution(execution);
        },
        [drillableItems, config?.columnHeadersPosition, config?.enableExecutionCancelling, execution],
    );

    /**
     * Tests whether ag-grid's refreshHeader should be called. At the moment this is necessary when user
     * turns on/off the aggregation menus through the props. The menus happen to appear in the table column headers
     * so the refresh is essential to show/hide them.
     *
     * @param currentProps - current table props
     * @param prevProps - previous table props
     * @internal
     */
    const shouldRefreshHeader = useCallback(
        (currentProps: ICorePivotTableProps, prevProps: ICorePivotTableProps): boolean => {
            const propsRequiringAgGridRerender: Array<(props: ICorePivotTableProps) => any> = [
                (props) => props?.config?.menu,
            ];
            return propsRequiringAgGridRerender.some(
                (propGetter) => !isEqual(propGetter(currentProps), propGetter(prevProps)),
            );
        },
        [],
    );

    const stopEventWhenResizeHeader = useCallback((e: React.MouseEvent): void => {
        // Do not propagate event when it originates from the table resizer.
        // This means for example that we can resize columns without triggering drag in the application.
        if ((e.target as Element)?.className?.includes?.("ag-header-cell-resize")) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    const renderLoading = useCallback(() => {
        const color =
            props.theme?.table?.loadingIconColor ?? props.theme?.palette?.complementary?.c6 ?? undefined;

        return (
            <div className="s-loading gd-table-loading">
                {LoadingComponent ? <LoadingComponent color={color} /> : null}
            </div>
        );
    }, [props.theme, LoadingComponent]);

    // Use previous props pattern for componentDidUpdate equivalent
    const prevPropsRef = useRef<ICorePivotTableProps>();

    useEffect(() => {
        // componentDidMount equivalent
        if (!prevPropsRef.current) {
            internalRef.current.initializer = initialize(execution);
            prevPropsRef.current = props;
            return;
        }

        const prevProps = prevPropsRef.current;
        prevPropsRef.current = props;

        // componentDidUpdate equivalent
        // reinit in progress
        if (!renderState.readyToRender && renderState.isLoading && !config?.enableExecutionCancelling) {
            return;
        }

        if (isReinitNeeded(prevProps)) {
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
            console.debug("triggering reinit", execution.definition, prevProps.execution.definition);
            reinitialize(execution);
        } else {
            /*
             * When in this branch, the ag-grid instance is up and running and is already showing some data and
             * it _should_ be possible to normally use the ag-grid APIs.
             *
             * The currentResult and visibleData _will_ be available at this point because the component is definitely
             * after a successful execution and initialization.
             */

            if (shouldRefreshHeader(props, prevProps)) {
                internalRef.current.table?.refreshHeader();
            }

            if (isGrowToFitEnabled() && !isGrowToFitEnabled(prevProps)) {
                growToFit();
            }

            const prevColumnWidths = getColumnWidths(prevProps);
            const columnWidths = getColumnWidths(props);

            if (!isEqual(prevColumnWidths, columnWidths)) {
                internalRef.current.table?.applyColumnSizes(getResizingConfig());
            }

            if (config?.maxHeight && !isEqual(config?.maxHeight, prevProps.config?.maxHeight)) {
                updateDesiredHeight();
            }
        }
    }, [
        props,
        execution,
        renderState.readyToRender,
        renderState.isLoading,
        config?.enableExecutionCancelling,
        config?.maxHeight,
        isReinitNeeded,
        reinitialize,
        shouldRefreshHeader,
        isGrowToFitEnabled,
        growToFit,
        getColumnWidths,
        getResizingConfig,
        updateDesiredHeight,
        initialize,
    ]);

    // componentWillUnmount equivalent
    useEffect(() => {
        return () => {
            refreshAbortController();
            if (containerRef.current) {
                containerRef.current.removeEventListener("mousedown", onContainerMouseDown);
            }

            // this ensures any events emitted during the async initialization will be sunk. they are no longer needed.
            internalRef.current.destroy();
        };
    }, [refreshAbortController, onContainerMouseDown]);

    //
    // Render
    //

    const { error } = errorState;

    if (error) {
        const errorProps =
            errorMapRef.current[
                Object.prototype.hasOwnProperty.call(errorMapRef.current, error)
                    ? error
                    : ErrorCodes.UNKNOWN_ERROR
            ];

        return ErrorComponent ? <ErrorComponent code={error} {...errorProps} /> : null;
    }

    const style: React.CSSProperties = {
        height: layoutState.desiredHeight || "100%",
        position: "relative",
        overflow: "hidden",
    };

    if (!renderState.readyToRender) {
        return (
            <div className="gd-table-component" style={style} id={pivotTableIdRef.current}>
                {renderLoading()}
            </div>
        );
    }

    // when table is ready, then the table facade must be set. if this bombs then there is a bug
    // in the initialization logic
    invariant(internalRef.current.table);

    if (!internalRef.current.gridOptions) {
        internalRef.current.gridOptions = createGridOptions(
            internalRef.current.table,
            getTableMethods(),
            props,
        );
    }

    /*
     * Show loading overlay until all the resizing is done. This is because the various resizing operations
     * have to happen asynchronously - they must wait until ag-grid fires onFirstDataRendered, before our code
     * can start reliably interfacing with the autosizing features.
     */
    const shouldRenderLoadingOverlay =
        (isColumnAutoresizeEnabled() || isGrowToFitEnabled()) && !layoutState.resized;

    const classNames = cx("gd-table-component", {
        "gd-table-header-hide":
            config?.columnHeadersPosition === "left" &&
            internalRef.current.table.tableDescriptor.isTransposed(),
    });

    return (
        <div
            className={classNames}
            style={style}
            id={pivotTableIdRef.current}
            onMouseDown={stopEventWhenResizeHeader}
            onDragStart={stopEventWhenResizeHeader}
        >
            <div className="gd-table ag-theme-balham s-pivot-table" style={style} ref={setContainerRef}>
                <AgGridReact {...internalRef.current.gridOptions} modules={[AllCommunityModule]} />
                {shouldRenderLoadingOverlay ? renderLoading() : null}
            </div>
        </div>
    );
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
