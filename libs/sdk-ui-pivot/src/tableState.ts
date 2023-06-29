// (C) 2007-2021 GoodData Corporation
import { ITotal } from "@gooddata/sdk-model";
import { TableFacadeInitializer } from "./impl/tableFacadeInitializer.js";
import { TableFacade } from "./impl/tableFacade.js";
import { ICustomGridOptions } from "./impl/privateTypes.js";
import { IScrollPosition } from "./impl/stickyRowHandler.js";

export interface ICorePivotTableState {
    readyToRender: boolean;
    columnTotals: ITotal[];
    rowTotals: ITotal[];
    desiredHeight: number | undefined;
    error?: string;
    resized: boolean;
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
