// (C) 2021-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type BatchAction, batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";

import {
    type IAccessControlAware,
    type IDashboard,
    type IDashboardDefinition,
    type IDashboardTab,
    type IFilterContext,
    type ITempFilterContext,
    isDashboardAttributeFilter,
    isTempFilterContext,
} from "@gooddata/sdk-model";

import {
    getMigratedAttributeFilters,
    mergedMigratedAttributeFilters,
} from "./common/migratedAttributeFilters.js";
import { processLayout } from "./saveDashboardHandler.js";
import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext.js";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout.js";
import { createListedDashboard } from "../../../_staging/listedDashboard/listedDashboardUtils.js";
import { type SaveDashboardAs } from "../../commands/dashboard.js";
import { changeRenderMode } from "../../commands/renderMode.js";
import { type DashboardCopySaved, dashboardCopySaved } from "../../events/dashboard.js";
import { accessibleDashboardsActions } from "../../store/accessibleDashboards/index.js";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectEnableImmediateAttributeFilterDisplayAsLabelMigration } from "../../store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";
import { listedDashboardsActions } from "../../store/listedDashboards/index.js";
import { metaActions } from "../../store/meta/index.js";
import {
    selectDashboardDescriptor,
    selectPersistedDashboard,
    selectPersistedDashboardFilterContextAsFilterContextDefinition,
} from "../../store/meta/metaSelectors.js";
import { selectIsInViewMode } from "../../store/renderMode/renderModeSelectors.js";
import { savingActions } from "../../store/saving/index.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectDateFilterConfigOverrides } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDefinition,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { filterOutCustomWidgets, selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type ITabState } from "../../store/tabs/tabsState.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { changeRenderModeHandler } from "../renderMode/changeRenderModeHandler.js";

type DashboardSaveAsContext = {
    cmd: SaveDashboardAs;

    /**
     * This contains definition of dashboard that reflects the current state.
     */
    dashboardFromState: IDashboardDefinition;

    /**
     * This contains definition that should be used during save as. This is based on the `dashboardFromState` but
     * has few distinctions:
     *
     * -  all widgets will have their identity cleared up; this is to ensure that new widgets will be created
     *    during `createDashboard` call
     * -  the title passed from command will be used here
     */
    dashboardToSave: IDashboardDefinition;
};

type DashboardSaveAsResult = {
    batch?: BatchAction;
    dashboard: IDashboard;
};

function createDashboard(ctx: DashboardContext, saveAsCtx: DashboardSaveAsContext): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createDashboard(saveAsCtx.dashboardToSave);
}

/**
 * Converts TabState[] from the dashboard state into IDashboardTab[] for saving.
 * Removes widget identities from all tab layouts to ensure new widgets are created.
 *
 * @param tabs - Array of TabState objects from the dashboard state
 * @returns Array of IDashboardTab objects ready for saving to backend
 */
function processExistingTabsForSaveAs(
    tabs: ITabState[],
    useOriginalFilterContext?: boolean,
): IDashboardTab[] {
    return tabs.map((tab) => {
        const dateFilterConfig = tab.dateFilterConfig?.dateFilterConfig;

        const dateFilterConfigs: IDashboardTab["dateFilterConfigs"] =
            tab.dateFilterConfigs?.dateFilterConfigs;

        const dateFilterConfigsProp = dateFilterConfigs?.length ? { dateFilterConfigs } : {};

        const attributeFilterConfigs: IDashboardTab["attributeFilterConfigs"] =
            tab.attributeFilterConfigs?.attributeFilterConfigs;
        const attributeFilterConfigsProp = attributeFilterConfigs?.length ? { attributeFilterConfigs } : {};
        // Get this tab's specific layout, filter out custom widgets, then process
        const tabLayout = tab.layout?.layout
            ? processLayout(filterOutCustomWidgets(tab.layout.layout))
            : undefined;

        const filterContext = tab.filterContext?.filterContextDefinition
            ? ({
                  ...(useOriginalFilterContext
                      ? tab.filterContext.originalFilterContextDefinition
                      : tab.filterContext.filterContextDefinition),
              } as IFilterContext | ITempFilterContext)
            : undefined;

        const result: IDashboardTab = {
            // explicitly type the result to avoid type errors caused by spread operators
            localIdentifier: tab.localIdentifier,
            title: tab.title ?? "",
            // Remove widget identifies from tab layout to ensure new widgets are created
            layout: tabLayout ? dashboardLayoutRemoveIdentity(tabLayout, () => true) : undefined,
            filterContext,
            ...(dateFilterConfig ? { dateFilterConfig } : {}),
            ...dateFilterConfigsProp,
            ...attributeFilterConfigsProp,
        };

        return result;
    });
}

/*
 * TODO: custom widget persistence; we need a new backend capability that indicates whether the
 *  backend can persist custom widget content (tiger can already, bear cannot). Based on that
 *  capability, this code should use either the selectBasicLayout (that strips any custom widgets) or
 *  selectLayout (that keeps custom widgets).
 */
function* createDashboardSaveAsContext(cmd: SaveDashboardAs): SagaIterator<DashboardSaveAsContext> {
    const { title, useOriginalFilterContext } = cmd.payload;
    const titleProp = title ? { title } : {};

    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);

    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> =
        yield select(selectDashboardDescriptor);

    const originalPersistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);

    const isImmediateAttributeFilterMigrationEnabled: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    const currentFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const crossFilteringFiltersLocalIdentifiers: ReturnType<
        typeof selectCrossFilteringFiltersLocalIdentifiers
    > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
    const migratedAttributeFilters = isImmediateAttributeFilterMigrationEnabled
        ? getMigratedAttributeFilters(
              originalPersistedDashboard?.filterContext?.filters.filter(isDashboardAttributeFilter),
              currentFilters,
              crossFilteringFiltersLocalIdentifiers,
          )
        : [];
    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        !useOriginalFilterContext || !originalPersistedDashboard
            ? selectFilterContextDefinition
            : selectPersistedDashboardFilterContextAsFilterContextDefinition,
    );
    // merge migrated filters only in view mode (useOriginalFilterContext), edit mode filter context is
    // selected from state where it is already migrated
    const migratedFilterContext =
        isImmediateAttributeFilterMigrationEnabled && useOriginalFilterContext
            ? mergedMigratedAttributeFilters(filterContextDefinition, migratedAttributeFilters)
            : filterContextDefinition;

    const layout: ReturnType<typeof selectBasicLayout> = yield select(selectBasicLayout);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
        selectDateFilterConfigOverrides,
    );
    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> = yield select(
        selectAttributeFilterConfigsOverrides,
    );
    const dateFilterConfigs: ReturnType<typeof selectDateFilterConfigsOverrides> = yield select(
        selectDateFilterConfigsOverrides,
    );

    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

    const capabilities: ReturnType<typeof selectBackendCapabilities> =
        yield select(selectBackendCapabilities);

    const { isUnderStrictControl: _unusedProp, ...dashboardDescriptorRest } = dashboardDescriptor;

    // Process tabs if tabs exist
    const processedTabs: IDashboardTab[] | undefined =
        tabs && tabs.length > 0 ? processExistingTabsForSaveAs(tabs, useOriginalFilterContext) : undefined;

    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptorRest,
        filterContext: {
            ...migratedFilterContext,
        },
        layout,
        dateFilterConfig,
        ...(attributeFilterConfigs?.length ? { attributeFilterConfigs } : {}),
        ...(dateFilterConfigs?.length ? { dateFilterConfigs } : {}),
        ...(processedTabs ? { tabs: processedTabs } : {}),
    };

    const pluginsProp = persistedDashboard?.plugins ? { plugins: persistedDashboard.plugins } : {};

    const shareProp: Partial<IAccessControlAware> = capabilities.supportsAccessControl
        ? {
              isLocked: false,
              shareStatus: "private",
              isUnderStrictControl: true,
          }
        : {
              isLocked: false,
              shareStatus: "public",
          };

    // remove widget identity from all widgets; according to the SPI contract, this will result in
    // creation of new widgets
    // Note: processedTabs already have widget identities removed in processExistingTabsForSaveAs
    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        ...titleProp,
        layout: dashboardLayoutRemoveIdentity(layout, () => true),
        ...shareProp,
        ...pluginsProp,
    };

    return {
        cmd,
        dashboardFromState,
        dashboardToSave,
    };
}

function* saveAs(
    ctx: DashboardContext,
    saveAsCtx: DashboardSaveAsContext,
): SagaIterator<DashboardSaveAsResult> {
    const dashboard: PromiseFnReturnType<typeof createDashboard> = yield call(
        createDashboard,
        ctx,
        saveAsCtx,
    );

    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    // we need to set createdBy manually, because conversion userRef -> IUser in createDashboard call needs UserMap for this,
    // but to get a UserMap is expensive and we know who created the dashboard.
    const dashboardWithUser = { ...dashboard, createdBy: user };

    if (!saveAsCtx.cmd.payload.switchToCopy) {
        return {
            dashboard: dashboardWithUser,
        };
    }

    /*
     * For dashboards with tabs, we need to update identities for ALL tabs, not just the active one.
     * Each tab has its own layout that may contain widgets that need identity updates.
     */
    const actions: AnyAction[] = [metaActions.setMeta({ dashboard: dashboardWithUser })];

    if (dashboardWithUser.tabs && dashboardWithUser.tabs.length > 0) {
        const stateTabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

        // For each tab in the saved dashboard, update its widget identities and filter context identity
        dashboardWithUser.tabs.forEach((savedTab) => {
            const stateTab = stateTabs?.find((t) => t.localIdentifier === savedTab.localIdentifier);

            // Update filter context identity for this tab
            // Extract identity directly from the filter context
            const filterContext = savedTab.filterContext;
            const filterContextIdentity =
                filterContext && !isTempFilterContext(filterContext) && filterContext.ref
                    ? {
                          ref: filterContext.ref,
                          uri: filterContext.uri,
                          identifier: filterContext.identifier,
                      }
                    : undefined;
            actions.push(
                tabsActions.updateFilterContextIdentityForTab({
                    tabId: savedTab.localIdentifier,
                    filterContextIdentity,
                }),
            );

            // Update widget identities for this tab if both layouts exist
            if (stateTab?.layout?.layout && savedTab.layout) {
                // Filter out custom widgets from state layout to match the saved layout structure
                const stateLayoutWithoutCustomWidgets = filterOutCustomWidgets(stateTab.layout.layout);
                const mapping = dashboardLayoutWidgetIdentityMap(
                    stateLayoutWithoutCustomWidgets,
                    savedTab.layout,
                );
                actions.push(
                    tabsActions.updateWidgetIdentitiesForTab({
                        tabId: savedTab.localIdentifier,
                        mapping,
                    }),
                );
            }
        });
    } else {
        // For dashboards without tabs, use the original approach with active tab actions
        const identityMapping = dashboardLayoutWidgetIdentityMap(
            saveAsCtx.dashboardFromState.layout!,
            dashboardWithUser.layout!,
        );

        actions.push(
            tabsActions.updateFilterContextIdentity({
                filterContextIdentity: dashboardFilterContextIdentity(dashboardWithUser),
            }),
            tabsActions.updateWidgetIdentities(identityMapping),
        );
    }

    actions.push(tabsActions.clearLayoutHistory());

    const batch = batchActions(actions, "@@GDC.DASH.SAVE_AS");

    return {
        batch,
        dashboard: dashboardWithUser,
    };
}

export function* saveAsDashboardHandler(
    ctx: DashboardContext,
    cmd: SaveDashboardAs,
): SagaIterator<DashboardCopySaved> {
    try {
        yield put(savingActions.setSavingStart());
        const saveAsCtx: SagaReturnType<typeof createDashboardSaveAsContext> = yield call(
            createDashboardSaveAsContext,
            cmd,
        );
        const {
            payload: { switchToCopy },
        } = cmd;
        const result: SagaReturnType<typeof saveAs> = yield call(saveAs, ctx, saveAsCtx);
        const { dashboard, batch } = result;

        if (batch) {
            yield put(batch);
        }

        if (switchToCopy) {
            /*
             * We must do this by mutating the context object, the setContext effect changes the context only
             * for the current saga and its children. See https://github.com/redux-saga/redux-saga/issues/1798#issuecomment-468054586
             */
            ctx.dashboardRef = dashboard.ref;
        }

        const listedDashboard = createListedDashboard(dashboard);
        yield put(listedDashboardsActions.addListedDashboard(listedDashboard));
        yield put(accessibleDashboardsActions.addAccessibleDashboard(listedDashboard));

        const isInViewMode: ReturnType<typeof selectIsInViewMode> = yield select(selectIsInViewMode);
        if (!isInViewMode) {
            yield call(changeRenderModeHandler, ctx, changeRenderMode("view", undefined, cmd.correlationId));
        }

        yield put(savingActions.setSavingSuccess());

        const isOriginalDashboardLocked = saveAsCtx.dashboardFromState.isLocked ?? false;

        return dashboardCopySaved(ctx, dashboard, isOriginalDashboardLocked, cmd.correlationId);
    } catch (e: any) {
        yield put(savingActions.setSavingError(e));
        throw e;
    }
}
