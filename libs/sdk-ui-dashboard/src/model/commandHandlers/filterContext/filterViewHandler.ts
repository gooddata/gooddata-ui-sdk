// (C) 2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, select, put } from "redux-saga/effects";
import {
    IDashboardFilterViewSaveRequest,
    IDashboardFilterView,
    ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { defaultErrorHandler } from "@gooddata/sdk-ui";

import { DashboardContext } from "../../types/commonTypes.js";
import {
    SaveFilterView,
    DeleteFilterView,
    ApplyFilterView,
    SetFilterViewAsDefault,
    changeFilterContextSelectionByParams,
    reloadFilterViews,
} from "../../commands/index.js";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors.js";
import { selectFilterViews, filterViewsActions } from "../../store/filterViews/index.js";
import {
    filterViewCreationSucceeded,
    filterViewCreationFailed,
    filterViewDeletionFailed,
    filterViewApplicationFailed,
    filterViewSetAsDefaultFailed,
    filterViewDeletionSucceeded,
    filterViewApplicationSucceeded,
    filterViewSetAsDefaultSucceeded,
} from "../../events/filters.js";
import { loadFilterViews } from "../dashboard/initializeDashboardHandler/loadFilterViews.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function createFilterView(
    ctx: DashboardContext,
    filterView: IDashboardFilterViewSaveRequest,
): Promise<IDashboardFilterView> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createFilterView(filterView);
}

export function* saveFilterViewHandler(ctx: DashboardContext, cmd: SaveFilterView): SagaIterator<void> {
    if (!ctx.dashboardRef) {
        throw Error("Dashboard ref must be provided.");
    }

    const filterContext: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );

    const filterView: IDashboardFilterViewSaveRequest = {
        name: cmd.payload.name,
        dashboard: ctx.dashboardRef,
        filterContext,
        isDefault: cmd.payload.isDefault,
    };

    try {
        const newFilterView: PromiseFnReturnType<typeof createFilterView> = yield call(
            createFilterView,
            ctx,
            filterView,
        );
        yield put(reloadFilterViews());
        yield put(filterViewCreationSucceeded(ctx, newFilterView, cmd.correlationId));
    } catch (error) {
        defaultErrorHandler(error);
        yield put(filterViewCreationFailed(ctx));
    }
}

function deleteFilterView(ctx: DashboardContext, ref: ObjRef): Promise<void> {
    return ctx.backend.workspace(ctx.workspace).dashboards().deleteFilterView(ref);
}

export function* deleteFilterViewHandler(ctx: DashboardContext, cmd: DeleteFilterView): SagaIterator<void> {
    try {
        const filterView: PromiseFnReturnType<typeof findFilterView> = yield call(
            findFilterView,
            cmd.payload.ref,
        );

        yield call(deleteFilterView, ctx, cmd.payload.ref);
        yield put(reloadFilterViews());
        yield put(filterViewDeletionSucceeded(ctx, filterView, cmd.correlationId));
    } catch (error) {
        defaultErrorHandler(error);
        yield put(filterViewDeletionFailed(ctx));
    }
}

function* findFilterView(ref: ObjRef) {
    const filterViews: ReturnType<typeof selectFilterViews> = yield select(selectFilterViews);
    return filterViews.find((filterView) => areObjRefsEqual(filterView.ref, ref));
}

export function* applyFilterViewHandler(ctx: DashboardContext, cmd: ApplyFilterView): SagaIterator<void> {
    const filterView: PromiseFnReturnType<typeof findFilterView> = yield call(
        findFilterView,
        cmd.payload.ref,
    );

    if (filterView) {
        yield put(
            changeFilterContextSelectionByParams({
                filters: filterView.filterContext.filters,
                correlationId: cmd.correlationId,
            }),
        );
        yield put(filterViewApplicationSucceeded(ctx, filterView, cmd.correlationId));
    } else {
        yield put(filterViewApplicationFailed(ctx));
    }
}

function setFilterViewAsDefault(ctx: DashboardContext, ref: ObjRef, isDefault: boolean): Promise<void> {
    return ctx.backend.workspace(ctx.workspace).dashboards().setFilterViewAsDefault(ref, isDefault);
}

export function* setFilterViewAsDefaultHandler(
    ctx: DashboardContext,
    cmd: SetFilterViewAsDefault,
): SagaIterator<void> {
    try {
        const filterView = yield call(findFilterView, cmd.payload.ref);
        yield call(setFilterViewAsDefault, ctx, cmd.payload.ref, cmd.payload.isDefault);
        yield put(reloadFilterViews());
        yield put(filterViewSetAsDefaultSucceeded(ctx, filterView, cmd.correlationId));
    } catch (error) {
        defaultErrorHandler(error);
        yield put(filterViewSetAsDefaultFailed(ctx));
    }
}

export function* reloadFilterViewsHandler(ctx: DashboardContext): SagaIterator<void> {
    const filterViews: PromiseFnReturnType<typeof loadFilterViews> = yield call(loadFilterViews, ctx);
    yield put(
        filterViewsActions.setFilterViews({
            dashboard: ctx.dashboardRef!, // should be defined already
            filterViews,
        }),
    );
}
