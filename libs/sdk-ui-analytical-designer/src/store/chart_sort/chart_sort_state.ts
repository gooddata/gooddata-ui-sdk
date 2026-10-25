// (C) 2022-2026 GoodData Corporation

import { type ISortItem } from "@gooddata/sdk-model";
import { type ISortConfig } from "@gooddata/sdk-ui-ext/internal";

/**
 * appState keeps appliedSort explicitly outside of sortConfig
 * as it is modified also from sort dialog
 */
export type ChartSortStateConfig = Omit<ISortConfig, "appliedSort">;

export interface IChartSortState {
    readonly appliedSort: ISortItem[];
    readonly sortConfig: ChartSortStateConfig;
}

export const defaultChartSortState: IChartSortState = {
    appliedSort: [],
    sortConfig: {
        defaultSort: [],
        availableSorts: [],
        supported: false,
        disabled: false,
    },
};
