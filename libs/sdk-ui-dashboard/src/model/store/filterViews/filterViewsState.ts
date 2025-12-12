// (C) 2024-2025 GoodData Corporation

import { type IDashboardFilterView, type ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IFilterViews {
    dashboard: ObjRef;
    filterViews: IDashboardFilterView[];
}

/**
 * @alpha
 */
export interface FilterViewsState {
    filterViews: IFilterViews[];
    isLoading: boolean;
}

export const filterViewsInitialState: FilterViewsState = { filterViews: [], isLoading: false };
