// (C) 2024-2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IDashboardFilterView, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    type IAddFilterView,
    type IFilterViews,
    type IFilterViewsState,
    type IRemoveFilterView,
    type ISetFilterViewAsDefault,
} from "./filterViewsState.js";

type FilterViewsReducer<A extends Action> = CaseReducer<IFilterViewsState, A>;

/** Replaces the dashboard's views and clears the loading flag. */
function replaceBucket(state: IFilterViewsState, dashboard: ObjRef, filterViews: IDashboardFilterView[]) {
    state.filterViews = [
        ...state.filterViews.filter((item) => !areObjRefsEqual(item.dashboard, dashboard)),
        { dashboard, filterViews },
    ];
    state.isLoading = false;
}

function bucketOf(state: IFilterViewsState, dashboard: ObjRef): IDashboardFilterView[] {
    return state.filterViews.find((item) => areObjRefsEqual(item.dashboard, dashboard))?.filterViews ?? [];
}

const setFilterViews: FilterViewsReducer<PayloadAction<IFilterViews>> = (state, action) => {
    state.filterViews = [
        ...state.filterViews.filter((item) => !areObjRefsEqual(item.dashboard, action.payload.dashboard)),
        action.payload,
    ];
    state.isLoading = false;
};

/** Upserts a single view, applying the create response without re-reading the list. */
const addFilterView: FilterViewsReducer<PayloadAction<IAddFilterView>> = (state, action) => {
    const { dashboard, filterView } = action.payload;
    const otherFilterViews = bucketOf(state, dashboard).filter(
        (item) => !areObjRefsEqual(item.ref, filterView.ref),
    );
    // creating a new default view resets the flag on the others, same as the backend does
    const updatedFilterViews = filterView.isDefault
        ? otherFilterViews.map((item) => (item.isDefault ? { ...item, isDefault: false } : item))
        : otherFilterViews;

    // the list is sorted by name when loaded, keep the new view in place instead of appending it
    replaceBucket(
        state,
        dashboard,
        [...updatedFilterViews, filterView].sort((a, b) => a.name.localeCompare(b.name)),
    );
};

/** Drops a view, dispatched only after the delete succeeded. */
const removeFilterView: FilterViewsReducer<PayloadAction<IRemoveFilterView>> = (state, action) => {
    const { dashboard, ref } = action.payload;
    replaceBucket(
        state,
        dashboard,
        bucketOf(state, dashboard).filter((item) => !areObjRefsEqual(item.ref, ref)),
    );
};

/** Moves the default flag onto the given view, clearing it on the others as the backend does. */
const setFilterViewAsDefault: FilterViewsReducer<PayloadAction<ISetFilterViewAsDefault>> = (
    state,
    action,
) => {
    const { dashboard, ref, isDefault } = action.payload;
    const filterViews = bucketOf(state, dashboard);
    // nothing to move the flag to, keep the current defaults as they are
    if (!filterViews.some((item) => areObjRefsEqual(item.ref, ref))) {
        state.isLoading = false;
        return;
    }
    replaceBucket(
        state,
        dashboard,
        filterViews.map((item) => {
            const target = areObjRefsEqual(item.ref, ref);
            // only the target may become default; setting it clears the flag everywhere else
            const nextIsDefault = target ? isDefault : isDefault ? false : item.isDefault;
            return item.isDefault === nextIsDefault ? item : { ...item, isDefault: nextIsDefault };
        }),
    );
};

const setFilterLoading: FilterViewsReducer<PayloadAction<boolean>> = (state, action) => {
    state.isLoading = action.payload;
};

export const filterViewsReducers = {
    setFilterViews,
    addFilterView,
    removeFilterView,
    setFilterViewAsDefault,
    setFilterLoading,
};
