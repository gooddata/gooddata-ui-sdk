// (C) 2021-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import { uniqWith } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import {
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardTab,
    IDateFilterConfig,
    IFilterContextDefinition,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import { applyDefaultFilterView } from "./common/filterViews.js";
import { insightReferencesFromDashboard } from "./common/insightReferences.js";
import { getMigratedAttributeFilters } from "./common/migratedAttributeFilters.js";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "./common/stateInitializers.js";
import { ResetDashboard } from "../../commands/index.js";
import { dashboardWasReset } from "../../events/dashboard.js";
import { DashboardWasReset } from "../../events/index.js";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors.js";
import {
    selectDateFilterConfig,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectSettings,
} from "../../store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { DEFAULT_TAB_ID, TabState, selectTabs } from "../../store/tabs/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { resolveInsights } from "../../utils/insightResolver.js";

export function* resetDashboardHandler(
    ctx: DashboardContext,
    cmd: ResetDashboard,
): SagaIterator<DashboardWasReset> {
    const data: SagaReturnType<typeof resetDashboardFromPersisted> = yield call(
        resetDashboardFromPersisted,
        ctx,
    );
    yield put(batchActions(data.batch, "@@GDC.DASH/RESET"));
    return dashboardWasReset(ctx, data.persistedDashboard, cmd.correlationId);
}

export function* resetDashboardRuntime(ctx: DashboardContext, cmd: ResetDashboard) {
    const data: SagaReturnType<typeof resetDashboardFromPersisted> = yield call(
        resetDashboardFromPersisted,
        ctx,
    );
    return {
        batch: batchActions(data.batch, "@@GDC.DASH/RESET"),
        reset: dashboardWasReset(ctx, data.persistedDashboard, cmd.correlationId),
    };
}

interface FilterRelatedParamsPerTab {
    migratedAttributeFilters: IDashboardAttributeFilter[];
    effectiveAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    effectiveOriginalFilterContext: IFilterContextDefinition | undefined;
    dateFilterConfig: IDateFilterConfig;
    dateFilterConfigSource: "dashboard" | "workspace";
}

function* getFilterRelatedParamsPerTab(
    persistedTab: Pick<IDashboardTab, "identifier" | "attributeFilterConfigs"> & {
        filterContext?: IDashboardTab["filterContext"];
    },
    currentTab: TabState | undefined,
    isImmediateAttributeFilterMigrationEnabled: boolean,
): SagaIterator<FilterRelatedParamsPerTab> {
    const crossFilteringFiltersLocalIdentifiers: ReturnType<
        typeof selectCrossFilteringFiltersLocalIdentifiers
    > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
    const persistedTabFilters = persistedTab.filterContext?.filters?.filter(isDashboardAttributeFilter) ?? [];
    const currentTabFilters =
        currentTab?.filterContext?.filterContextDefinition?.filters?.filter(isDashboardAttributeFilter) ?? [];

    // Get ad-hoc attribute filter configs for this specific tab from currentTab state
    const adHocAttributeFilterConfigs: IDashboardAttributeFilterConfig[] =
        currentTab?.attributeFilterConfigs?.attributeFilterConfigs ?? [];

    // Get original filter context definition for this specific tab from currentTab state
    const originalFilterContext: IFilterContextDefinition | undefined =
        currentTab?.filterContext?.originalFilterContextDefinition;

    const tabMigratedAttributeFilters = isImmediateAttributeFilterMigrationEnabled
        ? getMigratedAttributeFilters(
              persistedTabFilters,
              currentTabFilters,
              crossFilteringFiltersLocalIdentifiers,
          )
        : [];

    const tabEffectiveAttributeFilterConfigs = isImmediateAttributeFilterMigrationEnabled
        ? mergeDashboardAttributeFilterConfigs(
              persistedTab.attributeFilterConfigs ?? [],
              adHocAttributeFilterConfigs,
              tabMigratedAttributeFilters,
          )
        : (persistedTab.attributeFilterConfigs ?? []);

    const hasUnsavedFilterChanges = tabMigratedAttributeFilters.length > 0;

    const tabsEffectiveOriginalFilterContext =
        isImmediateAttributeFilterMigrationEnabled && hasUnsavedFilterChanges
            ? originalFilterContext
            : undefined;

    // Get dateFilterConfig for this tab
    // Use the current tab's effectiveDateFilterConfig if available, otherwise get it from settings
    const effectiveDateFilterConfig: IDateFilterConfig | undefined =
        currentTab?.dateFilterConfig?.effectiveDateFilterConfig;

    // Fallback: get from settings if not available in tab state
    const fallbackDateFilterConfig: ReturnType<typeof selectDateFilterConfig> =
        yield select(selectDateFilterConfig);

    return {
        migratedAttributeFilters: tabMigratedAttributeFilters,
        effectiveAttributeFilterConfigs: tabEffectiveAttributeFilterConfigs,
        effectiveOriginalFilterContext: tabsEffectiveOriginalFilterContext,
        dateFilterConfig: effectiveDateFilterConfig || fallbackDateFilterConfig,
        dateFilterConfigSource: currentTab?.dateFilterConfig?.isUsingDashboardOverrides
            ? "dashboard"
            : "workspace",
    };
}

function* resetDashboardFromPersisted(ctx: DashboardContext) {
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);

    let batch: Array<PayloadAction<any>> = [];
    if (persistedDashboard) {
        /*
         * For dashboard that is already persisted the insights and effective date filter config can be used
         * as is (date filter config is read-only).
         *
         * The only exception is the insights: thanks to the Reload button in plugins, the dashboard could have been
         * reloaded with a different set of insights, so when resetting, we need to make sure that we still have all
         * the insights needed for the original dashboard shape.
         *
         * The call to create actions to initialize existing dashboard will use all this to set state
         * of filter context, layout and meta based on the contents of persisted dashboard; this is the
         * same logic as what is done during the initialization of the dashboard based on data from backend.
         *
         * Everything else can stay untouched.
         */

        const isImmediateAttributeFilterMigrationEnabled: ReturnType<
            typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
        > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);

        const currentTabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

        const tabsToProcess =
            persistedDashboard.tabs && persistedDashboard.tabs.length > 0
                ? persistedDashboard.tabs
                : [
                      {
                          identifier: DEFAULT_TAB_ID,
                          title: "",
                          filterContext: persistedDashboard.filterContext,
                          attributeFilterConfigs: persistedDashboard.attributeFilterConfigs,
                      },
                  ];

        // Compute migratedAttributeFilters, effectiveAttributeFilterConfigs, and dateFilterConfig for each tab
        const effectiveOriginalFilterContext: Record<string, IFilterContextDefinition | undefined> = {};
        const migratedAttributeFilters: Record<string, IDashboardAttributeFilter[]> = {};
        const effectiveAttributeFilterConfigs: Record<string, IDashboardAttributeFilterConfig[]> = {};
        const dateFilterConfig: Record<string, IDateFilterConfig> = {};
        const tabsDateFilterConfigSource: Record<string, "dashboard" | "workspace"> = {};
        for (const tab of tabsToProcess) {
            const tabId = tab.identifier;
            const currentTab = currentTabs?.find((t) => t.identifier === tabId);

            const filterParams: FilterRelatedParamsPerTab = yield call(
                getFilterRelatedParamsPerTab,
                tab,
                currentTab,
                isImmediateAttributeFilterMigrationEnabled,
            );

            migratedAttributeFilters[tabId] = filterParams.migratedAttributeFilters;
            effectiveAttributeFilterConfigs[tabId] = filterParams.effectiveAttributeFilterConfigs;
            effectiveOriginalFilterContext[tabId] = filterParams.effectiveOriginalFilterContext;
            dateFilterConfig[tabId] = filterParams.dateFilterConfig;
            tabsDateFilterConfigSource[tabId] = filterParams.dateFilterConfigSource;
        }
        // end of ad-hoc migration content

        const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
        const filterViews: ReturnType<typeof selectFilterViews> = yield select(selectFilterViews);
        const dashboardWithUpdatedFilterContext = applyDefaultFilterView(
            persistedDashboard,
            filterViews,
            settings,
        );

        const insightRefsFromWidgets = insightReferencesFromDashboard(dashboardWithUpdatedFilterContext);
        const uniqueInsightRefsFromWidgets = uniqWith(insightRefsFromWidgets, areObjRefsEqual);
        const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
            resolveInsights,
            ctx,
            uniqueInsightRefsFromWidgets,
        );

        const displayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
            selectAllCatalogDisplayFormsMap,
        );
        const resolvedInsightsValues = Array(...resolvedInsights.resolved.values());

        batch = yield call(
            actionsToInitializeExistingDashboard,
            ctx,
            dashboardWithUpdatedFilterContext,
            resolvedInsightsValues,
            settings,
            isImmediateAttributeFilterMigrationEnabled,
            effectiveOriginalFilterContext,
            migratedAttributeFilters,
            effectiveAttributeFilterConfigs,
            dateFilterConfig,
            tabsDateFilterConfigSource,
            displayForms,
        );
    } else {
        const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);

        /*
         * For dashboard that is not persisted, the dashboard component is reset to an 'empty' state.
         */
        const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> =
            yield select(selectDateFilterConfig);

        const displayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
            selectAllCatalogDisplayFormsMap,
        );

        const { initActions }: SagaReturnType<typeof actionsToInitializeNewDashboard> = yield call(
            actionsToInitializeNewDashboard,
            ctx,
            settings,
            dateFilterConfig,
            displayForms,
        );
        batch = initActions;
    }

    return {
        batch,
        persistedDashboard,
    };
}

const mergeDashboardAttributeFilterConfigs = (
    originalConfigs: IDashboardAttributeFilterConfig[] = [],
    overridingConfigs: IDashboardAttributeFilterConfig[] = [],
    migratedAttributeFilters: IDashboardAttributeFilter[],
): IDashboardAttributeFilterConfig[] => {
    const sanitizedOverridingConfigs = overridingConfigs.filter((config) =>
        migratedAttributeFilters.some(
            (filter) => filter.attributeFilter.localIdentifier === config.localIdentifier,
        ),
    );
    const overriddenConfigs = originalConfigs.map((originalConfig) => {
        const overridingConfig = sanitizedOverridingConfigs.find(
            (config) => config.localIdentifier === originalConfig.localIdentifier,
        );
        if (!overridingConfig) {
            return originalConfig;
        }
        return {
            ...originalConfig,
            ...overridingConfig,
        };
    });
    const additionalOverridingConfigs = sanitizedOverridingConfigs.filter(
        (config) =>
            !overriddenConfigs.some(
                (mergedConfig) => mergedConfig.localIdentifier === config.localIdentifier,
            ),
    );
    return [...overriddenConfigs, ...additionalOverridingConfigs];
};
