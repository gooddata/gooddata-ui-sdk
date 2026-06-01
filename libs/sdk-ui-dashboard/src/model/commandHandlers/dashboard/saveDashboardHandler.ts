// (C) 2021-2026 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";
import { type BatchAction, batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    type IAccessControlAware,
    type IDashboard,
    type IDashboardDefinition,
    type IDashboardLayout,
    type IDashboardObjectIdentity,
    type IDashboardParameter,
    type IDashboardTab,
    type IFilterContext,
    type IFilterContextDefinition,
    type ITempFilterContext,
    isTempFilterContext,
} from "@gooddata/sdk-model";

import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext.js";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout.js";
import { createListedDashboard } from "../../../_staging/listedDashboard/listedDashboardUtils.js";
import { messages, resolveMessages } from "../../../locales.js";
import { type ISaveDashboard } from "../../commands/dashboard.js";
import { changeRenderMode } from "../../commands/renderMode.js";
import { switchDashboardTab } from "../../commands/tabs.js";
import { type DashboardSaved, dashboardSaved } from "../../events/dashboard.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { accessibleDashboardsActions } from "../../store/accessibleDashboards/index.js";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectLocale } from "../../store/config/configSelectors.js";
import { listedDashboardsActions } from "../../store/listedDashboards/index.js";
import { metaActions } from "../../store/meta/index.js";
import { selectDashboardDescriptor, selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectIsInViewMode } from "../../store/renderMode/renderModeSelectors.js";
import { savingActions } from "../../store/saving/index.js";
import { selectAttributeFilterConfigsOverridesByTab } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectDateFilterConfigOverridesByTab } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverridesByTab } from "../../store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { selectFilterContextStatesByTab } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { filterOutCustomWidgets, selectBasicLayoutByTab } from "../../store/tabs/layout/layoutSelectors.js";
import { selectMeasureValueFilterConfigsOverridesByTab } from "../../store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { selectSmartPersistedTabsParameters } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DEFAULT_TAB_ID, type ITabState } from "../../store/tabs/tabsState.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils.js";
import { generateTabLocalIdentifier } from "../../utils/tabLocalIdentifier.js";
import { changeRenderModeHandler } from "../renderMode/changeRenderModeHandler.js";
import { switchDashboardTabHandler } from "../tabs/switchDashboardTabHandler.js";

type DashboardSaveContext = {
    cmd: ISaveDashboard;
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

    /**
     * When the placeholder tab (DEFAULT_TAB_ID) is saved for the first time, a real UUID is generated
     * here and used in the persisted tabs. After save, state is updated to replace DEFAULT_TAB_ID with
     * this UUID so the identifier is stable for all future references (filter views, drills, etc.).
     */
    defaultTabNewLocalIdentifier?: string;
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
 * @param parametersByTab - Smart-persisted parameters keyed by tab localIdentifier
 * @returns Array of IDashboardTab objects ready for saving to backend
 */
function processExistingTabs(
    tabs: ITabState[],
    parametersByTab: Record<string, IDashboardParameter[]>,
    defaultTabNewLocalIdentifier?: string,
): IDashboardTab[] {
    return tabs.map((tab) => {
        const dateFilterConfig = tab.dateFilterConfig?.dateFilterConfig;

        const dateFilterConfigProp = dateFilterConfig ? { dateFilterConfig } : {};

        const dateFilterConfigs: IDashboardTab["dateFilterConfigs"] =
            tab.dateFilterConfigs?.dateFilterConfigs;

        const dateFilterConfigsProp = dateFilterConfigs?.length ? { dateFilterConfigs } : {};

        const attributeFilterConfigs: IDashboardTab["attributeFilterConfigs"] =
            tab.attributeFilterConfigs?.attributeFilterConfigs;
        const attributeFilterConfigsProp = attributeFilterConfigs?.length ? { attributeFilterConfigs } : {};
        const measureValueFilterConfigs: IDashboardTab["measureValueFilterConfigs"] =
            tab.measureValueFilterConfigs?.measureValueFilterConfigs;
        const measureValueFilterConfigsProp = measureValueFilterConfigs?.length
            ? { measureValueFilterConfigs }
            : {};
        const filterGroupsConfigProp = tab.filterGroupsConfig
            ? {
                  filterGroupsConfig: tab.filterGroupsConfig,
              }
            : {};

        // Get this tab's specific layout from tab.layout.layout
        const tabLayout = tab.layout?.layout;

        const filterContext = tab.filterContext?.filterContextDefinition
            ? ({
                  ...(tab.filterContext?.filterContextIdentity || {}),
                  ...tab.filterContext.filterContextDefinition,
              } as IFilterContext | ITempFilterContext)
            : undefined;

        const tabParameters = parametersByTab[tab.localIdentifier] ?? [];

        const result: IDashboardTab = {
            // explicitly type the result to avoid type errors caused by spread operators
            localIdentifier:
                tab.localIdentifier === DEFAULT_TAB_ID && defaultTabNewLocalIdentifier
                    ? defaultTabNewLocalIdentifier
                    : tab.localIdentifier,
            title: tab.title ?? "",
            // Use each tab's own layout, filter out custom widgets, then process
            layout: tabLayout ? processLayout(filterOutCustomWidgets(tabLayout)) : undefined,
            filterContext,
            ...dateFilterConfigProp,
            ...dateFilterConfigsProp,
            ...attributeFilterConfigsProp,
            ...measureValueFilterConfigsProp,
            ...filterGroupsConfigProp,
            // Always persist `parameters` (incl. `[]`) so V1 root fallback never re-hydrates stale
            // root parameters when every tab has been emptied.
            parameters: tabParameters,
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
    measureValueFilterConfigs: IDashboardDefinition["measureValueFilterConfigs"],
): Partial<
    Pick<IDashboardDefinition, "attributeFilterConfigs" | "dateFilterConfigs" | "measureValueFilterConfigs">
> {
    return {
        ...(attributeFilterConfigs?.length ? { attributeFilterConfigs } : {}),
        ...(dateFilterConfigs?.length ? { dateFilterConfigs } : {}),
        ...(measureValueFilterConfigs?.length ? { measureValueFilterConfigs } : {}),
    };
}

function createDefaultTab(
    layout: IDashboardLayout<ExtendedDashboardWidget> | undefined,
    rootFilterContext: IFilterContext | ITempFilterContext,
    dateFilterConfig: IDashboardDefinition["dateFilterConfig"],
    attributeFilterConfigs: IDashboardDefinition["attributeFilterConfigs"],
    dateFilterConfigs: IDashboardDefinition["dateFilterConfigs"],
    measureValueFilterConfigs: IDashboardDefinition["measureValueFilterConfigs"],
): IDashboardTab[] {
    return [
        {
            localIdentifier: generateTabLocalIdentifier(),
            title: "",
            layout: layout ? processLayout(layout) : undefined,
            filterContext: rootFilterContext,
            dateFilterConfig,
            ...buildOptionalFilterConfigsProps(
                attributeFilterConfigs,
                dateFilterConfigs,
                measureValueFilterConfigs,
            ),
        },
    ];
}

function resolveProcessedTabs(
    tabs: ITabState[] | undefined,
    rootFilterContext: IFilterContext | ITempFilterContext | undefined,
    layout: IDashboardLayout<ExtendedDashboardWidget> | undefined,
    dateFilterConfig: IDashboardDefinition["dateFilterConfig"],
    attributeFilterConfigs: IDashboardDefinition["attributeFilterConfigs"],
    dateFilterConfigs: IDashboardDefinition["dateFilterConfigs"],
    measureValueFilterConfigs: IDashboardDefinition["measureValueFilterConfigs"],
    parametersByTab: Record<string, IDashboardParameter[]>,
    defaultTabNewLocalIdentifier?: string,
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
            measureValueFilterConfigs,
        );
    }

    if (tabs) {
        return processExistingTabs(tabs, parametersByTab, defaultTabNewLocalIdentifier);
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
    cmd: ISaveDashboard,
    isNewDashboard: boolean,
): SagaIterator<DashboardSaveContext> {
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);
    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> =
        yield select(selectDashboardDescriptor);
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

    // Generate a real UUID for the UI placeholder tab (DEFAULT_TAB_ID) only when it has never
    // been persisted. If the backend already owns a tab with that identifier (e.g. set intentionally
    // via API or as-code definition) we must leave it unchanged.
    const hasPersistedDefaultTab = persistedDashboard?.tabs?.some(
        (t) => t.localIdentifier === DEFAULT_TAB_ID,
    );
    const defaultTabNewLocalIdentifier =
        !hasPersistedDefaultTab && tabs?.some((t) => t.localIdentifier === DEFAULT_TAB_ID)
            ? generateTabLocalIdentifier()
            : undefined;

    // Root-level properties must always reflect the first tab, regardless of which tab is active.
    // Using active-tab selectors here would persist the wrong data when saving from a non-first tab.
    const firstTabId = tabs?.[0]?.localIdentifier;
    const filterContextStatesByTab: ReturnType<typeof selectFilterContextStatesByTab> = yield select(
        selectFilterContextStatesByTab,
    );
    const basicLayoutByTab: ReturnType<typeof selectBasicLayoutByTab> = yield select(selectBasicLayoutByTab);
    const dateFilterConfigByTab: ReturnType<typeof selectDateFilterConfigOverridesByTab> = yield select(
        selectDateFilterConfigOverridesByTab,
    );
    const attributeFilterConfigsByTab: ReturnType<typeof selectAttributeFilterConfigsOverridesByTab> =
        yield select(selectAttributeFilterConfigsOverridesByTab);
    const dateFilterConfigsByTab: ReturnType<typeof selectDateFilterConfigsOverridesByTab> = yield select(
        selectDateFilterConfigsOverridesByTab,
    );
    const measureValueFilterConfigsByTab: ReturnType<typeof selectMeasureValueFilterConfigsOverridesByTab> =
        yield select(selectMeasureValueFilterConfigsOverridesByTab);

    const firstTabFilterContextState = firstTabId ? filterContextStatesByTab[firstTabId] : undefined;
    const filterContextDefinition = firstTabFilterContextState?.filterContextDefinition;
    const filterContextIdentity = firstTabFilterContextState?.filterContextIdentity;
    const layout = firstTabId ? basicLayoutByTab[firstTabId] : undefined;
    const dateFilterConfig = firstTabId ? dateFilterConfigByTab[firstTabId] : undefined;
    const attributeFilterConfigs = firstTabId ? attributeFilterConfigsByTab[firstTabId] : undefined;
    const dateFilterConfigs = firstTabId ? dateFilterConfigsByTab[firstTabId] : undefined;
    const measureValueFilterConfigs = firstTabId ? measureValueFilterConfigsByTab[firstTabId] : undefined;
    const parametersByTab: ReturnType<typeof selectSmartPersistedTabsParameters> = yield select(
        selectSmartPersistedTabsParameters,
    );
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
        measureValueFilterConfigs,
        parametersByTab,
        defaultTabNewLocalIdentifier,
    );

    const locale: ReturnType<typeof selectLocale> = yield select(selectLocale);
    const translations: Record<string, string> = yield call(resolveMessages, locale);
    const title = (cmd.payload.title ?? dashboardDescriptor.title) || translations[messages.untitled.id];

    // Note: activeTabLocalIdentifier is NOT saved to dashboard MD - it's app state only
    // Dashboard always opens on first tab by default
    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptor,
        title,
        ...dashboardIdentity,
        filterContext: filterContextDefinition
            ? ({
                  ...filterContextIdentity,
                  ...filterContextDefinition,
              } as IFilterContext | IFilterContextDefinition)
            : undefined,
        layout,
        dateFilterConfig,
        ...buildOptionalFilterConfigsProps(
            attributeFilterConfigs,
            dateFilterConfigs,
            measureValueFilterConfigs,
        ),
        ...(processedTabs ? { tabs: processedTabs } : {}),
        ...pluginsProp,
    };

    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        layout: layout ? dashboardLayoutRemoveIdentity(layout, isTemporaryIdentity) : undefined,
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
        defaultTabNewLocalIdentifier,
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
            // If this tab was the DEFAULT_TAB_ID placeholder being saved for the first time,
            // find the state tab by DEFAULT_TAB_ID (its current state ID) and use it as the tabId
            // for identity updates. resolveDefaultTab (pushed below) will rename it afterwards.
            const isDefaultTabBeingSaved = savedTab.localIdentifier === saveCtx.defaultTabNewLocalIdentifier;
            const stateTab = isDefaultTabBeingSaved
                ? stateTabs?.find((t) => t.localIdentifier === DEFAULT_TAB_ID)
                : stateTabs?.find((t) => t.localIdentifier === savedTab.localIdentifier);
            const tabIdForUpdate = stateTab?.localIdentifier ?? savedTab.localIdentifier;

            // Update filter context identity for this tab
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
                    tabId: tabIdForUpdate,
                    filterContextIdentity,
                }),
            );

            // Update widget identities for this tab if both layouts exist
            if (stateTab?.layout?.layout && savedTab.layout) {
                const stateLayoutWithoutCustomWidgets = filterOutCustomWidgets(stateTab.layout.layout);
                const mapping = dashboardLayoutWidgetIdentityMap(
                    stateLayoutWithoutCustomWidgets,
                    savedTab.layout,
                );
                actions.push(
                    tabsActions.updateWidgetIdentitiesForTab({
                        tabId: tabIdForUpdate,
                        mapping,
                    }),
                );
            }
        });

        // After all identity updates, rename DEFAULT_TAB_ID to its real UUID in state.
        // This makes the identifier stable for filter views, drill targets, and future saves.
        if (saveCtx.defaultTabNewLocalIdentifier) {
            actions.push(
                tabsActions.resolveDefaultTab({
                    newLocalIdentifier: saveCtx.defaultTabNewLocalIdentifier,
                }),
            );
        }
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
    cmd: ISaveDashboard,
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
