// (C) 2007-2026 GoodData Corporation

import { type SortChangedEvent } from "ag-grid-community";

import { type IExecutionDefinition } from "@gooddata/sdk-model";
import { BucketNames, type IPushData } from "@gooddata/sdk-ui";

import { type InternalTableState } from "../../tableState.js";
import { sanitizeDefTotals } from "../utils.js";

export interface ISortingEventHandlerContext {
    internal: InternalTableState;
    getExecutionDefinition: () => IExecutionDefinition;
    pushDataGuard: (data: IPushData) => void;
    setState: (state: any, callback?: () => void) => void;
}

export class SortingEventHandlers {
    constructor(private context: ISortingEventHandlerContext) {}

    public onSortChanged = (event: SortChangedEvent): void => {
        const { internal, getExecutionDefinition, pushDataGuard, setState } = this.context;

        if (!internal.table) {
            console.warn("changing sorts without prior execution cannot work");
            return;
        }

        const sortItems = internal.table.createSortItems(event.api.getAllGridColumns());

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

        setState({ columnTotals: totals }, () => {
            internal.table?.refreshData();
        });
    };
}
