// (C) 2007-2025 GoodData Corporation
import { AgGridEvent, GridReadyEvent } from "ag-grid-community";
import { invariant } from "ts-invariant";

import { ICorePivotTableProps } from "../../publicTypes.js";
import { InternalTableState } from "../../tableState.js";

export interface IGridEventHandlerContext {
    internal: InternalTableState;
    props: ICorePivotTableProps;
    updateDesiredHeight: () => void;
    onFirstDataRendered: () => Promise<void>;
    updateStickyRow: () => void;
    getGroupRows: () => boolean;
    getLastSortedColId: () => string | null;
    setLastSortedColId: (colId: string | null) => void;
}

export class GridEventHandlers {
    constructor(private context: IGridEventHandlerContext) {}

    public onGridReady = (event: GridReadyEvent): void => {
        const { internal, updateDesiredHeight, getGroupRows } = this.context;
        invariant(internal.table);

        internal.table.finishInitialization(event.api, event.api);
        updateDesiredHeight();

        if (getGroupRows()) {
            internal.table.initializeStickyRow();
        }

        internal.table.setTooltipFields();

        // when table contains only headers, the onFirstDataRendered
        // is not triggered; trigger it manually
        if (internal.table.isEmpty()) {
            this.context.onFirstDataRendered();
        }
    };

    public onModelUpdated = (event: AgGridEvent): void => {
        const { internal, updateStickyRow, getLastSortedColId, setLastSortedColId } = this.context;

        updateStickyRow();

        if (internal.table?.isPivotTableReady()) {
            const lastSortedColId = getLastSortedColId();
            // Restore focus to the header cell
            if (lastSortedColId && event.api) {
                event.api.setFocusedHeader(lastSortedColId);
                setLastSortedColId(null);
            }
        }
    };

    public onGridColumnsChanged = (): void => {
        this.context.updateStickyRow();
    };
}
