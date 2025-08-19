// (C) 2024-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    IDashboardAttributeFilterConfig,
    IDashboardFilterView,
    IDashboardFilterViewSaveRequest,
    IFilterContextDefinition,
    ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { defaultErrorHandler } from "@gooddata/sdk-ui";

import { resetCrossFiltering } from "./common.js";
import {
    ApplyFilterView,
    DeleteFilterView,
    SaveFilterView,
    SetFilterViewAsDefault,
    changeFilterContextSelectionByParams,
    reloadFilterViews,
} from "../../commands/index.js";
import {
    filterViewApplicationFailed,
    filterViewApplicationSucceeded,
    filterViewCreationFailed,
    filterViewCreationSucceeded,
    filterViewDefaultStatusChangeFailed,
    filterViewDefaultStatusChangeSucceeded,
    filterViewDeletionFailed,
    filterViewDeletionSucceeded,
} from "../../events/filters.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";
import {
    selectFilterContextDefinition,
    selectWorkingFilterContextDefinition,
} from "../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import { filterViewsActions, selectFilterViews } from "../../store/filterViews/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { loadFilterViews } from "../dashboard/initializeDashboardHandler/loadFilterViews.js";

function createFilterView(
    ctx: DashboardContext,
    filterView: IDashboardFilterViewSaveRequest,
): Promise<IDashboardFilterView> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createFilterView(filterView);
}

export function* saveFilterViewHandler(ctx: DashboardContext, cmd: SaveFilterView): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
    if (!ctx.dashboardRef) {
        throw Error("Dashboard ref must be provided.");
    }

    const appliedFilterContext: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const workingFilterContext: ReturnType<typeof selectWorkingFilterContextDefinition> = yield select(
        selectWorkingFilterContextDefinition,
    );
    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const filterContext = isApplyAllAtOnceEnabledAndSet ? workingFilterContext : appliedFilterContext;

    const virtualFilters: ReturnType<typeof selectCrossFilteringFiltersLocalIdentifiers> = yield select(
        selectCrossFilteringFiltersLocalIdentifiers,
    );

    const sanitizedFilterContext: IFilterContextDefinition = {
        ...filterContext,
        // accept date filters, unknown filters (will probably always be true), non-virtual filters
        filters: filterContext.filters.filter(
            (filter) =>
                !isDashboardAttributeFilter(filter) ||
                !filter.attributeFilter.localIdentifier ||
                !virtualFilters.includes(filter.attributeFilter.localIdentifier),
        ),
    };

    const filterView: IDashboardFilterViewSaveRequest = {
        name: cmd.payload.name,
        dashboard: ctx.dashboardRef,
        filterContext: sanitizedFilterContext,
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
        yield put(filterViewsActions.setFilterLoading(false));
    }
}

function deleteFilterView(ctx: DashboardContext, ref: ObjRef): Promise<void> {
    return ctx.backend.workspace(ctx.workspace).dashboards().deleteFilterView(ref);
}

export function* deleteFilterViewHandler(ctx: DashboardContext, cmd: DeleteFilterView): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
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
        yield put(filterViewsActions.setFilterLoading(false));
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

    const attributeFilterConfigs: IDashboardAttributeFilterConfig[] = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    if (filterView) {
        yield call(resetCrossFiltering, cmd);
        const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
            yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
        if (isApplyAllAtOnceEnabledAndSet) {
            yield put(filterContextActions.resetWorkingSelection());
        }
        yield put(
            changeFilterContextSelectionByParams({
                filters: filterView.filterContext.filters,
                attributeFilterConfigs,
                resetOthers: true,
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
    yield put(filterViewsActions.setFilterLoading(true));
    const filterView = yield call(findFilterView, cmd.payload.ref);
    const updatedFilterView: IDashboardFilterView = {
        ...filterView,
        isDefault: !filterView.isDefault,
    };
    try {
        yield call(setFilterViewAsDefault, ctx, cmd.payload.ref, cmd.payload.isDefault);
        yield put(reloadFilterViews());
        yield put(filterViewDefaultStatusChangeSucceeded(ctx, updatedFilterView, cmd.correlationId));
    } catch (error) {
        defaultErrorHandler(error);
        yield put(filterViewDefaultStatusChangeFailed(ctx, updatedFilterView));
        yield put(filterViewsActions.setFilterLoading(false));
    }
}

export function* reloadFilterViewsHandler(ctx: DashboardContext): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
    try {
        const filterViews: PromiseFnReturnType<typeof loadFilterViews> = yield call(loadFilterViews, ctx);
        yield put(
            filterViewsActions.setFilterViews({
                dashboard: ctx.dashboardRef!, // should be defined already
                filterViews,
            }),
        );
    } catch (error) {
        defaultErrorHandler(error);
        yield put(filterViewsActions.setFilterLoading(false));
    }
}
