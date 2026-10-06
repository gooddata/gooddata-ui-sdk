// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { uniqWith } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";

import { type IDashboardReferences } from "@gooddata/sdk-backend-spi";
import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardTab,
    type IDateFilterConfig,
    type IFilterContextDefinition,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { deriveAbsoluteFormGranularitiesFromRelativeForm } from "../../../_staging/dateFilterConfig/merge.js";
import { type IChangeDashboardDefinition } from "../../commands/dashboard.js";
import { type IDashboardDefinitionChanged, dashboardDefinitionChanged } from "../../events/dashboard.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectCatalogParameters,
} from "../../store/catalog/catalogSelectors.js";
import {
    selectDateFilterConfig,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
    selectSettings,
} from "../../store/config/configSelectors.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { DEFAULT_TAB_ID } from "../../store/tabs/tabsState.js";
import { unavailableObjectsActions } from "../../store/unavailableObjects/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { resolveInsights } from "../../utils/insightResolver.js";

import { insightReferencesFromDashboard } from "./common/insightReferences.js";
import { actionsToInitializeExistingDashboard } from "./common/stateInitializers.js";
import { loadUnavailableReferences } from "./initializeDashboardHandler/loadUnavailableReferences.js";
import {
    type IDateFilterMergeResult,
    mergeDateFilterConfigWithOverrides,
} from "./initializeDashboardHandler/mergeDateFilterConfigs.js";

interface IFilterRelatedParamsPerTab {
    migratedAttributeFilters: IDashboardAttributeFilter[];
    effectiveAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    effectiveOriginalFilterContext: IFilterContextDefinition | undefined;
    dateFilterConfig: IDateFilterConfig;
    tabsDateFilterConfigSource: "dashboard" | "workspace";
}

function* getFilterRelatedParamsPerTab(
    tab: Pick<IDashboardTab, "localIdentifier" | "attributeFilterConfigs"> & {
        filterContext?: IDashboardTab["filterContext"];
        dateFilterConfig?: IDashboardTab["dateFilterConfig"];
    },
    options: {
        ctx: DashboardContext;
        cmd: IChangeDashboardDefinition;
        workspaceDateFilterConfig: IDateFilterConfig;
    },
): SagaIterator<IFilterRelatedParamsPerTab> {
    const { ctx, cmd, workspaceDateFilterConfig } = options;

    const effectiveDateFilterConfigResult: IDateFilterMergeResult = yield call(
        mergeDateFilterConfigWithOverrides,
        ctx,
        cmd,
        workspaceDateFilterConfig,
        tab.dateFilterConfig,
    );

    return {
        migratedAttributeFilters: [],
        effectiveAttributeFilterConfigs: tab.attributeFilterConfigs ?? [],
        effectiveOriginalFilterContext: undefined,
        dateFilterConfig: effectiveDateFilterConfigResult.config,
        tabsDateFilterConfigSource: effectiveDateFilterConfigResult.source,
    };
}

export function* changeDashboardDefinitionHandler(
    ctx: DashboardContext,
    cmd: IChangeDashboardDefinition,
): SagaIterator<IDashboardDefinitionChanged> {
    const { dashboard, references: providedReferences, insights: payloadInsights } = cmd.payload;

    const effectiveReferences: Partial<IDashboardReferences> =
        providedReferences ?? (payloadInsights ? { insights: [...payloadInsights] } : {});

    const providedInsights = effectiveReferences.insights ?? [];

    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);

    const unavailableReferences: SagaReturnType<typeof loadUnavailableReferences> = yield call(
        loadUnavailableReferences,
        ctx,
        dashboard,
        effectiveReferences.unavailable,
        Boolean(settings?.enableDashboardPartialRendering),
        !!persistedDashboard,
    );

    const displayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );
    const isImmediateAttributeFilterMigrationEnabled: ReturnType<
        typeof selectEnableImmediateAttributeFilterDisplayAsLabelMigration
    > = yield select(selectEnableImmediateAttributeFilterDisplayAsLabelMigration);
    const currentActiveTabId: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );
    const workspaceParameters: ReturnType<typeof selectCatalogParameters> =
        yield select(selectCatalogParameters);

    const insightRefsFromWidgets = insightReferencesFromDashboard(dashboard);
    const uniqueInsightRefsFromWidgets = uniqWith(insightRefsFromWidgets, areObjRefsEqual);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        uniqueInsightRefsFromWidgets,
    );
    const resolvedInsightsValues = resolvedInsights?.resolved ? [...resolvedInsights.resolved.values()] : [];

    const allInsights = uniqWith([...providedInsights, ...resolvedInsightsValues], (a, b) =>
        areObjRefsEqual(a.insight.ref, b.insight.ref),
    );

    const tabsToProcess =
        dashboard.tabs && dashboard.tabs.length > 0
            ? dashboard.tabs
            : [
                  {
                      localIdentifier: DEFAULT_TAB_ID,
                      title: "",
                      filterContext: dashboard.filterContext,
                      dateFilterConfig: dashboard.dateFilterConfig,
                      attributeFilterConfigs: dashboard.attributeFilterConfigs,
                      layout: dashboard.layout,
                  },
              ];

    const effectiveOriginalFilterContext: Record<string, IFilterContextDefinition | undefined> = {};
    const migratedAttributeFilters: Record<string, IDashboardAttributeFilter[]> = {};
    const effectiveAttributeFilterConfigs: Record<string, IDashboardAttributeFilterConfig[]> = {};
    const dateFilterConfig: Record<string, IDateFilterConfig> = {};
    const tabsDateFilterConfigSource: Record<string, "dashboard" | "workspace"> = {};

    const rawDateFilterConfig: ReturnType<typeof selectDateFilterConfig> =
        yield select(selectDateFilterConfig);
    const workspaceDateFilterConfig = deriveAbsoluteFormGranularitiesFromRelativeForm(
        rawDateFilterConfig,
        !!settings.enableAbsoluteDateFilterGranularity,
    );

    for (const tab of tabsToProcess) {
        const tabId = tab.localIdentifier;

        const filterParams = yield* getFilterRelatedParamsPerTab(tab, {
            ctx,
            cmd,
            workspaceDateFilterConfig,
        });

        migratedAttributeFilters[tabId] = filterParams.migratedAttributeFilters;
        effectiveAttributeFilterConfigs[tabId] = filterParams.effectiveAttributeFilterConfigs;
        effectiveOriginalFilterContext[tabId] = filterParams.effectiveOriginalFilterContext;
        dateFilterConfig[tabId] = filterParams.dateFilterConfig;
        tabsDateFilterConfigSource[tabId] = filterParams.tabsDateFilterConfigSource;
    }

    const activeTabExistsInNewDashboard = dashboard.tabs?.some(
        (tab) => tab.localIdentifier === currentActiveTabId,
    );
    const effectiveActiveTabId = activeTabExistsInNewDashboard
        ? currentActiveTabId
        : (dashboard.tabs?.[0]?.localIdentifier ?? DEFAULT_TAB_ID);

    const batch: Array<PayloadAction<any>> = yield call(
        actionsToInitializeExistingDashboard,
        ctx,
        dashboard,
        allInsights,
        settings,
        isImmediateAttributeFilterMigrationEnabled,
        effectiveOriginalFilterContext,
        migratedAttributeFilters,
        effectiveAttributeFilterConfigs,
        dateFilterConfig,
        tabsDateFilterConfigSource,
        displayForms,
        persistedDashboard ?? dashboard,
        effectiveActiveTabId,
        workspaceParameters,
        unavailableReferences,
    );

    batch.push(unavailableObjectsActions.setUnavailableObjects(unavailableReferences));

    yield put(batchActions(batch, "@@GDC.DASH/CHANGE_DEFINITION"));

    const finalReferences: Partial<IDashboardReferences> = {
        ...effectiveReferences,
        insights: allInsights,
        unavailable: unavailableReferences,
    };

    return dashboardDefinitionChanged(ctx, dashboard, finalReferences, cmd.correlationId);
}
