// (C) 2021-2025 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type BatchAction, batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";
import { v4 as uuid } from "uuid";

import {
    type IAccessControlAware,
    type IDashboard,
    type IDashboardDefinition,
    type IDashboardLayout,
    type IDashboardObjectIdentity,
    type IDashboardTab,
    type IFilterContext,
    type ITempFilterContext,
    isTempFilterContext,
} from "@gooddata/sdk-model";

import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext.js";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout.js";
import { createListedDashboard } from "../../../_staging/listedDashboard/listedDashboardUtils.js";
import { type SaveDashboard, changeRenderMode, switchDashboardTab } from "../../commands/index.js";
import { type DashboardSaved, dashboardSaved } from "../../events/dashboard.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { accessibleDashboardsActions } from "../../store/accessibleDashboards/index.js";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { listedDashboardsActions } from "../../store/listedDashboards/index.js";
import { metaActions } from "../../store/meta/index.js";
import { selectDashboardDescriptor, selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectIsInViewMode } from "../../store/renderMode/renderModeSelectors.js";
import { savingActions } from "../../store/saving/index.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectDateFilterConfigOverrides } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { filterOutCustomWidgets, selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type TabState } from "../../store/tabs/tabsState.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils.js";
import { changeRenderModeHandler } from "../renderMode/changeRenderModeHandler.js";
import { switchDashboardTabHandler } from "../tabs/switchDashboardTabHandler.js";

type DashboardSaveContext = {
    cmd: SaveDashboard;
    /**
     * This contains definition of dashboard that reflects the current state.
     */
    dashboardFromState: IDashboardDefinition;

    /**
     * This contains definition that should be used during save. This is based on the `dashboardFromState` but
     * has one distinction: there will be no widgets that have the temporary identity assigned. All such
     * widgets will have the identity cleared up; this is essential for the backend SPI create/updateDashboard
     * methods to know which widgets are new.
     */
    dashboardToSave: IDashboardDefinition;

    /**
     * Dashboard as it is saved on the backend.
     *
     * This will be undefined if a dashboard is not yet saved.
     */
    persistedDashboard?: IDashboard;
};

type DashboardSaveResult = {
    batch: BatchAction;
    dashboard: IDashboard;
};

type DashboardSaveFn = (ctx: DashboardContext, saveCtx: DashboardSaveContext) => Promise<IDashboard>;

function createDashboard(ctx: DashboardContext, saveCtx: DashboardSaveContext): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createDashboard(saveCtx.dashboardToSave);
}

function updateDashboard(ctx: DashboardContext, saveCtx: DashboardSaveContext): Promise<IDashboard> {
    const { persistedDashboard, dashboardToSave } = saveCtx;
    invariant(persistedDashboard);

    return ctx.backend
        .workspace(ctx.workspace)
        .dashboards()
        .updateDashboard(persistedDashboard, dashboardToSave);
}

export function getDashboardWithSharing(
    dashboard: IDashboardDefinition,
    sharingSupported: boolean = true,
    isNewDashboard: boolean,
): IDashboardDefinition {
    let shareProp: Partial<IAccessControlAware> = {};
    if (isNewDashboard) {
        const { isUnderStrictControl: _unusedIsUnderStrictControl, ...dashboardRest } = dashboard;
        shareProp = sharingSupported
            ? {
                  shareStatus: "private",
                  isUnderStrictControl: true,
              }
            : {
                  shareStatus: "public",
              };
        return {
            ...dashboardRest,
            ...shareProp,
        };
    }
    return dashboard;
}

/**
 * Converts TabState[] from the dashboard state into IDashboardTab[] for saving.
 *
 * @param tabs - Array of TabState objects from the dashboard state
 * @returns Array of IDashboardTab objects ready for saving to backend
 */
function processExistingTabs(tabs: TabState[]): IDashboardTab[] {
    return tabs.map((tab) => {
        const dateFilterConfig = tab.dateFilterConfig?.dateFilterConfig;

        const dateFilterConfigProp = dateFilterConfig ? { dateFilterConfig } : {};

        const dateFilterConfigs: IDashboardTab["dateFilterConfigs"] =
            tab.dateFilterConfigs?.dateFilterConfigs;

        const dateFilterConfigsProp = dateFilterConfigs?.length ? { dateFilterConfigs } : {};

        const attributeFilterConfigs: IDashboardTab["attributeFilterConfigs"] =
            tab.attributeFilterConfigs?.attributeFilterConfigs;
        const attributeFilterConfigsProp = attributeFilterConfigs?.length ? { attributeFilterConfigs } : {};
        // Get this tab's specific layout from tab.layout.layout
        const tabLayout = tab.layout?.layout;

        const filterContext = tab.filterContext?.filterContextDefinition
            ? ({
                  ...(tab.filterContext?.filterContextIdentity || {}),
                  ...tab.filterContext.filterContextDefinition,
              } as IFilterContext | ITempFilterContext)
            : undefined;

        const result: IDashboardTab = {
            // explicitly type the result to avoid type errors caused by spread operators
            localIdentifier: tab.localIdentifier,
            title: tab.title ?? "",
            // Use each tab's own layout, filter out custom widgets, then process
            layout: tabLayout ? processLayout(filterOutCustomWidgets(tabLayout)) : undefined,
            filterContext,
            ...dateFilterConfigProp,
            ...dateFilterConfigsProp,
            ...attributeFilterConfigsProp,
        };
        return result;
    });
}

export function processLayout(layout: IDashboardLayout<ExtendedDashboardWidget>): IDashboardLayout {
    return dashboardLayoutRemoveIdentity(layout as IDashboardLayout, isTemporaryIdentity);
}

function buildOptionalFilterConfigsProps(
    attributeFilterConfigs: IDashboardDefinition["attributeFilterConfigs"],
    dateFilterConfigs: IDashboardDefinition["dateFilterConfigs"],
): Partial<Pick<IDashboardDefinition, "attributeFilterConfigs" | "dateFilterConfigs">> {
    return {
        ...(attributeFilterConfigs?.length ? { attributeFilterConfigs } : {}),
        ...(dateFilterConfigs?.length ? { dateFilterConfigs } : {}),
    };
}

function createDefaultTab(
    layout: IDashboardLayout<ExtendedDashboardWidget> | undefined,
    rootFilterContext: IFilterContext | ITempFilterContext,
    dateFilterConfig: IDashboardDefinition["dateFilterConfig"],
    attributeFilterConfigs: IDashboardDefinition["attributeFilterConfigs"],
    dateFilterConfigs: IDashboardDefinition["dateFilterConfigs"],
): IDashboardTab[] {
    return [
        {
            localIdentifier: uuid(),
            title: "",
            layout: layout ? processLayout(layout) : undefined,
            filterContext: rootFilterContext,
            dateFilterConfig,
            ...buildOptionalFilterConfigsProps(attributeFilterConfigs, dateFilterConfigs),
        },
    ];
}

function resolveProcessedTabs(
    tabs: TabState[] | undefined,
    rootFilterContext: IFilterContext | ITempFilterContext | undefined,
    layout: IDashboardLayout<ExtendedDashboardWidget> | undefined,
    dateFilterConfig: IDashboardDefinition["dateFilterConfig"],
    attributeFilterConfigs: IDashboardDefinition["attributeFilterConfigs"],
    dateFilterConfigs: IDashboardDefinition["dateFilterConfigs"],
): IDashboardTab[] | undefined {
    // If no tabs exist, create a default tab with root-level properties
    const shouldCreateDefaultTab = !tabs || tabs.length === 0;

    if (shouldCreateDefaultTab && rootFilterContext) {
        return createDefaultTab(
            layout,
            rootFilterContext,
            dateFilterConfig,
            attributeFilterConfigs,
            dateFilterConfigs,
        );
    }

    if (tabs) {
        return processExistingTabs(tabs);
    }

    return undefined;
}

/*
 * TODO: custom widget persistence; we need a new backend capability that indicates whether the
 *  backend can persist custom widget content (tiger can already, bear cannot). Based on that
 *  capability, this code should use either the selectBasicLayout (that strips any custom widgets) or
 *  selectLayout (that keeps custom widgets).
 */
function* createDashboardSaveContext(
    cmd: SaveDashboard,
    isNewDashboard: boolean,
): SagaIterator<DashboardSaveContext> {
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);
    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> =
        yield select(selectDashboardDescriptor);
    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const filterContextIdentity: ReturnType<typeof selectFilterContextIdentity> =
        yield select(selectFilterContextIdentity);
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

    /*
     * When updating an existing dashboard, the services expect that the dashboard definition to use for
     * updating contains the identity of the existing dashboard.
     *
     * It's ok to have no identity when creating a new dashboard - it will be assigned during the save.
     */
    const dashboardIdentity: Partial<IDashboardObjectIdentity> = {
        ref: persistedDashboard?.ref,
        uri: persistedDashboard?.uri,
        identifier: persistedDashboard?.identifier,
    };

    const pluginsProp = persistedDashboard?.plugins ? { plugins: persistedDashboard.plugins } : {};

    const rootFilterContext = filterContextDefinition
        ? ({
              ...filterContextIdentity,
              ...filterContextDefinition,
          } as IFilterContext | ITempFilterContext)
        : undefined;

    const processedTabs = resolveProcessedTabs(
        tabs,
        rootFilterContext,
        layout,
        dateFilterConfig,
        attributeFilterConfigs,
        dateFilterConfigs,
    );

    // Note: activeTabLocalIdentifier is NOT saved to dashboard MD - it's app state only
    // Dashboard always opens on first tab by default
    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptor,
        title: cmd.payload.title ?? dashboardDescriptor.title,
        ...dashboardIdentity,
        filterContext: {
            ...filterContextIdentity,
            ...filterContextDefinition,
        },
        layout,
        dateFilterConfig,
        ...buildOptionalFilterConfigsProps(attributeFilterConfigs, dateFilterConfigs),
        ...(processedTabs ? { tabs: processedTabs } : {}),
        ...pluginsProp,
    };

    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        layout: dashboardLayoutRemoveIdentity(layout, isTemporaryIdentity),
    };

    return {
        cmd,
        persistedDashboard,
        dashboardFromState,
        dashboardToSave: getDashboardWithSharing(
            dashboardToSave,
            capabilities.supportsAccessControl,
            isNewDashboard,
        ),
    };
}

function* save(
    ctx: DashboardContext,
    saveCtx: DashboardSaveContext,
    saveFn: DashboardSaveFn,
    saveActionName: string,
): SagaIterator<DashboardSaveResult> {
    const dashboard: PromiseFnReturnType<typeof saveFn> = yield call(saveFn, ctx, saveCtx);

    /*
     * The crucial thing to do after the save is to update the identities of different objects that are stored
     * in the dashboard state and either:
     *
     * 1.  have no identity (such as dashboard itself or filter context in case of new dashboards)
     * 2.  or have temporary identity (such as KPI and Insight widgets in case of any dashboard that gets
     *     modified with new content).
     *
     * The first task is easy. The second requires additional processing to identify mapping between
     * temporary identity and persistent identity and then update the layout state accordingly.
     *
     * For dashboards with tabs, we need to update identities for ALL tabs, not just the active one.
     */
    const actions: AnyAction[] = [metaActions.setMeta({ dashboard })];

    if (dashboard.tabs && dashboard.tabs.length > 0) {
        const stateTabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

        // For each tab in the saved dashboard, update its widget identities and filter context identity
        dashboard.tabs.forEach((savedTab) => {
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
            saveCtx.dashboardFromState.layout!,
            dashboard.layout!,
        );

        actions.push(
            tabsActions.updateFilterContextIdentity({
                filterContextIdentity: dashboardFilterContextIdentity(dashboard),
            }),
            tabsActions.updateWidgetIdentities(identityMapping),
        );
    }

    actions.push(tabsActions.clearLayoutHistory());

    if (saveCtx.persistedDashboard === undefined) {
        const listedDashboard = createListedDashboard(dashboard);
        actions.push(
            listedDashboardsActions.addListedDashboard(listedDashboard),
            accessibleDashboardsActions.addAccessibleDashboard(listedDashboard),
        );
    }

    const batch = batchActions(actions, saveActionName);

    return {
        batch,
        dashboard,
    };
}

export function* saveDashboardHandler(
    ctx: DashboardContext,
    cmd: SaveDashboard,
): SagaIterator<DashboardSaved> {
    try {
        yield put(savingActions.setSavingStart());

        const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
            yield select(selectPersistedDashboard);

        const isNewDashboard = persistedDashboard === undefined;

        const saveCtx: SagaReturnType<typeof createDashboardSaveContext> = yield call(
            createDashboardSaveContext,
            cmd,
            isNewDashboard,
        );
        let result: DashboardSaveResult;

        if (isNewDashboard) {
            result = yield call(save, ctx, saveCtx, createDashboard, "@@GDC.DASH.SAVE_NEW");
        } else {
            result = yield call(save, ctx, saveCtx, updateDashboard, "@@GDC.DASH.SAVE_EXISTING");
        }

        const { dashboard, batch } = result;

        yield put(batch);

        if (isNewDashboard) {
            /*
             * We must do this by mutating the context object, the setContext effect changes the context only
             * for the current saga and its children. See https://github.com/redux-saga/redux-saga/issues/1798#issuecomment-468054586
             */
            ctx.dashboardRef = dashboard.ref;
        }

        const isInViewMode: ReturnType<typeof selectIsInViewMode> = yield select(selectIsInViewMode);
        if (!isInViewMode) {
            yield call(changeRenderModeHandler, ctx, changeRenderMode("view", undefined, cmd.correlationId));
        }

        // After save, reset to first tab - activeTabLocalIdentifier is not persisted in dashboard MD
        const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
        const firstTabId = tabs?.[0]?.localIdentifier;
        if (firstTabId) {
            const switchTabCmd = switchDashboardTab(firstTabId);
            const switchedEvent = yield call(switchDashboardTabHandler, ctx, switchTabCmd);
            yield dispatchDashboardEvent(switchedEvent);
        }

        yield put(savingActions.setSavingSuccess());
        return dashboardSaved(ctx, dashboard, isNewDashboard, cmd.correlationId);
    } catch (e: any) {
        yield put(savingActions.setSavingError(e));
        throw e;
    }
}
