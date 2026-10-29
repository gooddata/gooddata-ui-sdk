// (C) 2007-2026 GoodData Corporation

import { type ITotal } from "@gooddata/sdk-model";
import { BucketNames, type IPushData } from "@gooddata/sdk-ui";

import { type InternalTableState } from "../../tableState.js";
import { type IMenuAggregationClickConfig } from "../privateTypes.js";
import { getUpdatedColumnOrRowTotals } from "../structure/headers/aggregationsMenuHelper.js";

export interface IAggregationEventHandlerContext {
    internal: InternalTableState;
    getColumnTotals: () => ITotal[];
    getRowTotals: () => ITotal[];
    pushDataGuard: (data: IPushData) => void;
    setState: (state: any, callback?: () => void) => void;
}

export class AggregationEventHandlers {
    constructor(private context: IAggregationEventHandlerContext) {}

    public onMenuAggregationClick = (menuAggregationClickConfig: IMenuAggregationClickConfig): void => {
        const { internal, getColumnTotals, getRowTotals, pushDataGuard, setState } = this.context;

        const { isColumn } = menuAggregationClickConfig;

        if (isColumn) {
            const newColumnTotals = getUpdatedColumnOrRowTotals(
                getColumnTotals(),
                menuAggregationClickConfig,
            );

            pushDataGuard({
                properties: {
                    totals: newColumnTotals,
                    bucketType: BucketNames.ATTRIBUTE,
                },
            });

            setState({ columnTotals: newColumnTotals }, () => {
                internal.table?.refreshData();
            });
        } else {
            const newRowTotals = getUpdatedColumnOrRowTotals(getRowTotals(), menuAggregationClickConfig);

            setState({ rowTotals: newRowTotals }, () => {
                internal.table?.refreshData();
            });

            pushDataGuard({
                properties: {
                    totals: newRowTotals,
                    bucketType: BucketNames.COLUMNS,
                },
            });
        }
    };
}
