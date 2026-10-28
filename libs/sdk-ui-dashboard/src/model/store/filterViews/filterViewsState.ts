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
export interface IAddFilterView {
    dashboard: ObjRef;
    filterView: IDashboardFilterView;
}

/**
 * @alpha
 */
export interface IRemoveFilterView {
    dashboard: ObjRef;
    ref: ObjRef;
}

/**
 * @alpha
 */
export interface ISetFilterViewAsDefault {
    dashboard: ObjRef;
    ref: ObjRef;
    isDefault: boolean;
}

/**
 * @alpha
 */
export interface IFilterViewsState {
    filterViews: IFilterViews[];
    isLoading: boolean;
    /**
     * Tabs that have taken their default filter view in this session. While filters persist across tabs,
     * a tab takes its own default view only on its first visit.
     * @internal
     */
    defaultFilterViewAppliedTabs?: string[];
}

export const filterViewsInitialState: IFilterViewsState = { filterViews: [], isLoading: false };
