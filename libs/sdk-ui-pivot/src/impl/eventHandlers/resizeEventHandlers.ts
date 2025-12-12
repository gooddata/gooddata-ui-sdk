// (C) 2007-2025 GoodData Corporation
import { type ColumnResizedEvent, type PinnedRowDataChangedEvent } from "ag-grid-community";
import { invariant } from "ts-invariant";

import { type InternalTableState } from "../../tableState.js";
import { isManualResizing } from "../base/agUtils.js";
import { type ColumnResizingConfig } from "../privateTypes.js";

const AGGRID_ON_RESIZE_TIMEOUT = 300;

export interface IResizeEventHandlerContext {
    internal: InternalTableState;
    updateDesiredHeight: () => void;
    autoresizeColumns: (force: boolean) => Promise<void>;
    getResizingConfig: () => ColumnResizingConfig;
}

export class ResizeEventHandlers {
    constructor(private context: IResizeEventHandlerContext) {}

    public onGridSizeChanged = (gridSizeChangedEvent: any): void => {
        const { internal } = this.context;

        if (!internal.firstDataRendered) {
            // ag-grid does emit the grid size changed even before first data gets rendered (i suspect this is
            // to cater for the initial render where it goes from nothing to something that has the headers, and then
            // it starts rendering the data itself)
            //
            // Don't do anything, the resizing will be triggered after the first data is rendered
            return;
        }

        if (!internal.table) {
            return;
        }

        if (internal.table.isResizing()) {
            // don't do anything if the table is already resizing. this copies what we have in v7 line however
            // I think it opens room for racy/timing behavior. if the window is resized _while_ the table is resizing
            // it is likely that it will not respect current window size.
            //
            // keeping it like this for now. if needed, we can enqueue an auto-resize request somewhere and process
            // it after resizing finishes.
            return;
        }

        if (
            internal.checkAndUpdateLastSize(
                gridSizeChangedEvent.clientWidth,
                gridSizeChangedEvent.clientHeight,
            )
        ) {
            this.context.autoresizeColumns(true);
        }
    };

    public onGridColumnResized = async (columnEvent: ColumnResizedEvent): Promise<void> => {
        const { internal, updateDesiredHeight, getResizingConfig } = this.context;
        invariant(internal.table);

        if (!columnEvent.finished) {
            return; // only update the height once the user is done setting the column size
        }

        updateDesiredHeight();

        if (isManualResizing(columnEvent)) {
            internal.table.onManualColumnResize(getResizingConfig(), columnEvent.columns!);
        }
    };

    public onPinnedRowDataChanged = async (event: PinnedRowDataChangedEvent): Promise<void> => {
        if (event?.api.getPinnedBottomRowCount() > 0) {
            await this.context.autoresizeColumns(true);
        }
    };

    public getDebounceTimeout(): number {
        return AGGRID_ON_RESIZE_TIMEOUT;
    }
}
