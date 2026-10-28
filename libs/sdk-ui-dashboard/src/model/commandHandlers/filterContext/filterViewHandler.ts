// (C) 2024-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type IDashboardAttributeFilterConfig,
    type IDashboardFilterView,
    type IDashboardFilterViewSaveRequest,
    type IFilterContextDefinition,
    type ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { defaultErrorHandler } from "@gooddata/sdk-ui";

import { type IDashboardCommand } from "../../commands/base.js";
import {
    type IApplyFilterView,
    type IDeleteFilterView,
    type ISaveFilterView,
    type ISetFilterViewAsDefault,
    changeFilterContextSelectionByParams,
} from "../../commands/filters.js";
import { changeParameterValues } from "../../commands/parameters.js";
import { type ISwitchDashboardTab } from "../../commands/tabs.js";
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
import { selectCatalogParameters } from "../../store/catalog/catalogSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";
import {
    selectDashboardFilterViews,
    selectDefaultFilterViewAppliedTabs,
    selectFilterViews,
} from "../../store/filterViews/filterViewsReducersSelectors.js";
import { filterViewsActions } from "../../store/filterViews/index.js";
import { selectEnablePersistentFiltersAcrossTabs } from "../../store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../store/renderMode/renderModeSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextDefinition,
    selectWorkingFilterContextDefinition,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import {
    selectDashboardParameterEntries,
    selectFilterViewDisplayParameters,
} from "../../store/tabs/parameters/parametersSelectors.js";
import {
    selectActiveTabLocalIdentifier,
    selectFirstTabLocalIdentifier,
} from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { findTabDefaultFilterView } from "../dashboard/common/filterViews.js";
import { resolveParameterValuesForFilterView } from "../dashboard/common/parameterHydration.js";
import { loadFilterViews } from "../dashboard/initializeDashboardHandler/loadFilterViews.js";
import { changeParameterValuesHandler } from "../parameters/changeParameterValuesHandler.js";

import { changeFilterContextSelectionHandler } from "./changeFilterContextSelectionHandler.js";
import { resetCrossFiltering } from "./common.js";

function createFilterView(
    ctx: DashboardContext,
    filterView: IDashboardFilterViewSaveRequest,
): Promise<IDashboardFilterView> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createFilterView(filterView);
}

export function* saveFilterViewHandler(ctx: DashboardContext, cmd: ISaveFilterView): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
    if (!ctx.dashboardRef) {
        throw Error("Dashboard ref must be provided.");
    }

    // Get active tab ID
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );

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

    const parameters: ReturnType<typeof selectFilterViewDisplayParameters> = yield select(
        selectFilterViewDisplayParameters,
    );

    const filterView: IDashboardFilterViewSaveRequest = {
        name: cmd.payload.name,
        dashboard: ctx.dashboardRef,
        filterContext: sanitizedFilterContext,
        isDefault: cmd.payload.isDefault,
        // Include tabId if there's an active tab
        ...(activeTabLocalIdentifier ? { tabLocalIdentifier: activeTabLocalIdentifier } : {}),
        ...(parameters ? { parameters } : {}),
    };

    try {
        const newFilterView: PromiseFnReturnType<typeof createFilterView> = yield call(
            createFilterView,
            ctx,
            filterView,
        );
        // apply the create response, a list reload may not be consistent yet and would drop the new view
        yield put(
            filterViewsActions.addFilterView({
                dashboard: ctx.dashboardRef,
                filterView: newFilterView,
            }),
        );
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

export function* deleteFilterViewHandler(ctx: DashboardContext, cmd: IDeleteFilterView): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
    try {
        const filterView: PromiseFnReturnType<typeof findFilterView> = yield call(
            findFilterView,
            cmd.payload.ref,
        );

        yield call(deleteFilterView, ctx, cmd.payload.ref);
        // no response body, so drop the view locally instead of re-reading a possibly stale list
        yield put(
            filterViewsActions.removeFilterView({
                dashboard: ctx.dashboardRef!,
                ref: cmd.payload.ref,
            }),
        );
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

export function* applyFilterViewHandler(ctx: DashboardContext, cmd: IApplyFilterView): SagaIterator<void> {
    const filterView: PromiseFnReturnType<typeof findFilterView> = yield call(
        findFilterView,
        cmd.payload.ref,
    );

    if (filterView) {
        yield call(applyFilterViewSelection, ctx, cmd, filterView);
        yield put(filterViewApplicationSucceeded(ctx, filterView, cmd.correlationId));
    } else {
        yield put(filterViewApplicationFailed(ctx));
    }
}

/**
 * Applies the filters and parameters of `filterView` to the active tab. While filters persist across
 * tabs, the filter and parameter handlers mirror the values to every other tab, so the view sets the
 * shared state.
 */
function* applyFilterViewSelection(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    filterView: IDashboardFilterView,
    options?: { adoptAsOriginal?: boolean },
): SagaIterator<void> {
    const attributeFilterConfigs: IDashboardAttributeFilterConfig[] = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    yield call(resetCrossFiltering, cmd);
    const isApplyAllAtOnceEnabledAndSet: ReturnType<typeof selectIsApplyFiltersAllAtOnceEnabledAndSet> =
        yield select(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    if (isApplyAllAtOnceEnabledAndSet) {
        yield put(tabsActions.resetWorkingSelection());
    }
    const parameterEntries: ReturnType<typeof selectDashboardParameterEntries> = yield select(
        selectDashboardParameterEntries,
    );
    const workspaceParameters: ReturnType<typeof selectCatalogParameters> =
        yield select(selectCatalogParameters);
    yield call(
        changeParameterValuesHandler,
        ctx,
        changeParameterValues({
            parameters: resolveParameterValuesForFilterView(
                parameterEntries,
                filterView.parameters ?? [],
                workspaceParameters,
            ),
            correlationId: cmd.correlationId,
            adoptAsOriginal: options?.adoptAsOriginal,
        }),
    );
    // inline, so the view is applied before the caller continues: a queued command would run after
    // the caller's own filter changes (e.g. automation filters after a tab switch) and overwrite them
    yield call(
        changeFilterContextSelectionHandler,
        ctx,
        changeFilterContextSelectionByParams({
            filters: filterView.filterContext.filters,
            attributeFilterConfigs,
            resetOthers: true,
            correlationId: cmd.correlationId,
            // a default view initializes the shared state, so the applied values are what a reset restores
            adoptAsOriginal: options?.adoptAsOriginal,
            // a filter view snapshots this dashboard's own filter context, so its localIdentifiers
            // are authoritative; display form matching alone cannot tell apart filters that share
            // a display form
            matchByLocalIdentifier: true,
        }),
    );
}

/**
 * While filters persist across tabs, the dashboard opens with the default view of its active tab as
 * the shared state. Every other tab applies its own default view, to all tabs, on its first visit in
 * the session. Later visits keep the shared state. A drill to the tab sets the shared state itself, so
 * it counts as the first visit without applying the view.
 *
 * @internal
 */
export function* applyDefaultFilterViewOnFirstTabVisit(
    ctx: DashboardContext,
    cmd: ISwitchDashboardTab,
    tabLocalIdentifier: string,
): SagaIterator<void> {
    const persistFiltersAcrossTabs: ReturnType<typeof selectEnablePersistentFiltersAcrossTabs> = yield select(
        selectEnablePersistentFiltersAcrossTabs,
    );
    // edit mode starts from the saved filters, same as on load
    const isInEditMode: ReturnType<typeof selectIsInEditMode> = yield select(selectIsInEditMode);
    if (!persistFiltersAcrossTabs || isInEditMode) {
        return;
    }

    const appliedTabs: ReturnType<typeof selectDefaultFilterViewAppliedTabs> = yield select(
        selectDefaultFilterViewAppliedTabs,
    );
    if (appliedTabs.includes(tabLocalIdentifier)) {
        return;
    }
    if (cmd.payload.source === "drillToSelf") {
        yield put(filterViewsActions.markDefaultFilterViewApplied(tabLocalIdentifier));
        return;
    }

    const filterViews: ReturnType<typeof selectDashboardFilterViews> =
        yield select(selectDashboardFilterViews);
    const firstTabLocalIdentifier: ReturnType<typeof selectFirstTabLocalIdentifier> = yield select(
        selectFirstTabLocalIdentifier,
    );
    const defaultFilterView = findTabDefaultFilterView(
        filterViews,
        tabLocalIdentifier,
        tabLocalIdentifier === firstTabLocalIdentifier,
    );
    // A failed view must not fail the caller (the tab is already switched, a save already persisted).
    // The tab stays unmarked, so its next visit retries the view.
    try {
        if (defaultFilterView) {
            yield call(applyFilterViewSelection, ctx, cmd, defaultFilterView, { adoptAsOriginal: true });
        }
        yield put(filterViewsActions.markDefaultFilterViewApplied(tabLocalIdentifier));
    } catch (error) {
        defaultErrorHandler(error);
    }
}

function setFilterViewAsDefault(ctx: DashboardContext, ref: ObjRef, isDefault: boolean): Promise<void> {
    return ctx.backend.workspace(ctx.workspace).dashboards().setFilterViewAsDefault(ref, isDefault);
}

export function* setFilterViewAsDefaultHandler(
    ctx: DashboardContext,
    cmd: ISetFilterViewAsDefault,
): SagaIterator<void> {
    yield put(filterViewsActions.setFilterLoading(true));
    const filterView = yield call(findFilterView, cmd.payload.ref);
    const updatedFilterView: IDashboardFilterView = {
        ...filterView,
        isDefault: !filterView.isDefault,
    };
    try {
        yield call(setFilterViewAsDefault, ctx, cmd.payload.ref, cmd.payload.isDefault);
        // same as delete - no response body, so apply the requested state locally
        yield put(
            filterViewsActions.setFilterViewAsDefault({
                dashboard: ctx.dashboardRef!,
                ref: cmd.payload.ref,
                isDefault: cmd.payload.isDefault,
            }),
        );
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
