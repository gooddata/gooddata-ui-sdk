// (C) 2007-2025 GoodData Corporation
import { type AgGridEvent } from "ag-grid-community";
import { invariant } from "ts-invariant";

import { type InternalTableState } from "../../tableState.js";

export const WATCHING_TABLE_RENDERED_INTERVAL = 500;

export interface IDataRenderHandlerContext {
    internal: InternalTableState;
    isColumnAutoresizeEnabled: () => boolean;
    isGrowToFitEnabled: () => boolean;
    autoresizeColumns: () => Promise<void>;
    growToFit: () => void;
    updateStickyRow: () => void;
    startWatchingTableRendered: () => void;
}

export class DataRenderHandlers {
    constructor(private context: IDataRenderHandlerContext) {}

    public onFirstDataRendered = async (_event?: AgGridEvent): Promise<void> => {
        const { internal } = this.context;
        invariant(internal.table);

        if (internal.firstDataRendered) {
            console.error("onFirstDataRendered called multiple times");
        }

        internal.firstDataRendered = true;

        // Since issue here is not resolved, https://github.com/ag-grid/ag-grid/issues/3263,
        // work-around by using 'setInterval'
        internal.startWatching(this.context.startWatchingTableRendered, WATCHING_TABLE_RENDERED_INTERVAL);

        /*
         * At this point data from backend is available, some of it is rendered and auto-resize can be done.
         *
         * See: https://www.ag-grid.com/javascript-grid-resizing/#resize-after-data
         *
         * I suspect now that the table life-cycle is somewhat more sane, we can follow the docs. For a good
         * measure, let's throw in a mild timeout. I have observed different results (slightly less space used)
         * when the timeout was not in place.
         */
        if (this.context.isColumnAutoresizeEnabled()) {
            await this.context.autoresizeColumns();
        } else if (this.context.isGrowToFitEnabled()) {
            this.context.growToFit();
        }

        this.context.updateStickyRow();
    };
}
