// (C) 2007-2026 GoodData Corporation

import { type SortChangedEvent } from "ag-grid-community";

import { type ITotal } from "@gooddata/sdk-model";
import { BucketNames, type IPushData } from "@gooddata/sdk-ui";

import { type InternalTableState } from "../../tableState.js";

export interface ISortingEventHandlerContext {
    internal: InternalTableState;
    getColumnTotals: () => ITotal[];
    pushDataGuard: (data: IPushData) => void;
    setState: (state: any, callback?: () => void) => void;
}

export class SortingEventHandlers {
    constructor(private context: ISortingEventHandlerContext) {}

    public onSortChanged = (event: SortChangedEvent): void => {
        const { internal, getColumnTotals, pushDataGuard, setState } = this.context;

        if (!internal.table) {
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortItems = internal.table.createSortItems(event.api.getAllGridColumns());

        // Sorting changes subtotal visibility, but must preserve the current selection.
        const totals = getColumnTotals();

        // oxlint-disable-next-line eslint-js/no-console
        console.debug("onSortChanged", sortItems);

        pushDataGuard({
            properties: {
                sortItems,
                totals,
                bucketType: BucketNames.ATTRIBUTE,
            },
        });

        setState({ columnTotals: totals }, () => {
            internal.table?.refreshData();
        });
    };
}
