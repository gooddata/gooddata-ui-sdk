// (C) 2007-2025 GoodData Corporation
import { ITotal } from "@gooddata/sdk-model";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { TableFacadeInitializer } from "./impl/tableFacadeInitializer.js";
import { TableFacade } from "./impl/tableFacade.js";
import { ICustomGridOptions } from "./impl/privateTypes.js";
import { IScrollPosition } from "./impl/stickyRowHandler.js";

/**
 * Separated state interfaces for better performance and maintainability
 *
 * ## Why Separate State?
 *
 * The previous monolithic state caused unnecessary re-renders when unrelated
 * properties changed. This separation provides:
 *
 * ### Performance Benefits:
 * - **Reduced re-renders**: Components only re-render when relevant state changes
 * - **Better memoization**: useCallback/useMemo dependencies are more granular
 * - **Selective updates**: Update only the state slice that actually changed
 *
 * ### Maintainability Benefits:
 * - **Clear separation of concerns**: Each state slice has a single responsibility
 * - **Easier debugging**: State changes are isolated by domain
 * - **Better testability**: Individual state slices can be tested in isolation
 *
 * ### Usage Guidelines:
 * - Use `ITableRenderState` for initialization, loading, and render control
 * - Use `ITableDataState` for data-related changes (totals, execution)
 * - Use `ITableLayoutState` for UI layout and sizing changes
 * - Use `ITableErrorState` for error handling
 */

/**
 * Controls table rendering and initialization lifecycle
 *
 * This state should be updated when:
 * - Table initialization starts/completes
 * - Loading state changes
 * - Render readiness changes
 */
export interface ITableRenderState {
    readyToRender: boolean;
    isLoading: boolean;
}

/**
 * Manages data-related state including totals and execution
 *
 * This state should be updated when:
 * - Column or row totals change
 * - Execution definition changes
 * - Data transformation occurs
 */
export interface ITableDataState {
    columnTotals: ITotal[];
    rowTotals: ITotal[];
    tempExecution: IPreparedExecution;
}

/**
 * Manages UI layout and sizing state
 *
 * This state should be updated when:
 * - Table height changes
 * - Column resizing occurs
 * - Layout recalculation happens
 */
export interface ITableLayoutState {
    desiredHeight: number | undefined;
    resized: boolean;
}

/**
 * Manages error state
 *
 * This state should be updated when:
 * - Errors occur during execution
 * - Error state needs to be cleared
 */
export interface ITableErrorState {
    error?: string;
}

/**
 * @deprecated Use separated states instead
 * Legacy interface kept for backward compatibility during migration
 *
 * This monolithic state interface caused performance issues due to:
 * - Unnecessary re-renders when unrelated properties changed
 * - Complex state updates affecting multiple concerns
 * - Difficult dependency tracking in useCallback/useMemo
 */
export interface ICorePivotTableState {
    readyToRender: boolean;
    columnTotals: ITotal[];
    rowTotals: ITotal[];
    desiredHeight: number | undefined;
    resized: boolean;
    tempExecution: IPreparedExecution;
    isLoading: boolean;
    error?: string;
}

/**
 * Because the ag-grid is not a true React component, a lot of the state related to operations
 * and interactions with ag-grid should be and are treated in 'typical' fashion, outside of the
 * usual React state.
 */
export class InternalTableState {
    public initializer?: TableFacadeInitializer;
    public table?: TableFacade;
    public gridOptions?: ICustomGridOptions;

    public firstDataRendered: boolean = false;
    public lastScrollPosition: IScrollPosition = {
        top: 0,
        left: 0,
    };
    public isMetaOrCtrlKeyPressed: boolean = false;
    public isAltKeyPressed: boolean = false;
    public lastResizedWidth = 0;
    public lastResizedHeight = 0;
    public lastSortedColId: string | null = null;

    private watchingIntervalId?: number;

    public destroy = (): void => {
        this.abandonInitialization();
        this.stopWatching();
        this.table?.destroy();
    };

    /**
     * Abandon current table initialization (if any). This will not cancel any in-flight requests but will
     * make sure that when they complete they are noop - dead work.
     */
    public abandonInitialization = (): void => {
        if (this.initializer) {
            this.initializer.abandon();
        }

        this.initializer = undefined;
    };

    public stopWatching = (): void => {
        if (this.watchingIntervalId) {
            clearInterval(this.watchingIntervalId);
            this.watchingIntervalId = undefined;
        }
    };

    public startWatching = (handler: TimerHandler, timeout?: number): void => {
        if (this.watchingIntervalId) {
            return;
        }

        this.watchingIntervalId = window.setInterval(handler, timeout);
    };

    /**
     * Checks if the last size on record for this table is same as the provided sizes. If it is, don't
     * do anything and return false. If the sizes differ, they will be updated and true is returned.
     *
     * @param width - width to test & update if needed
     * @param height - height to test & update if needed
     */
    public checkAndUpdateLastSize = (width: number, height: number): boolean => {
        if (this.lastResizedWidth !== width || this.lastResizedHeight !== height) {
            this.lastResizedWidth = width;
            this.lastResizedHeight = height;

            return true;
        }

        return false;
    };
}
