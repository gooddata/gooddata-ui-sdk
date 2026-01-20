// (C) 2024-2026 GoodData Corporation

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
export interface IFilterViewsState {
    filterViews: IFilterViews[];
    isLoading: boolean;
}

export const filterViewsInitialState: IFilterViewsState = { filterViews: [], isLoading: false };
