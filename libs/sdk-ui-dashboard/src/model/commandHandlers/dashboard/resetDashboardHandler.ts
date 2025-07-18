// (C) 2021-2025 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { ResetDashboard } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardWasReset } from "../../events/index.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { dashboardWasReset } from "../../events/dashboard.js";
import { selectEffectiveDateFilterConfig } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { PayloadAction } from "@reduxjs/toolkit";
import {
    selectDateFilterConfig,
    selectSettings,
    selectEnableImmediateAttributeFilterDisplayAsLabelMigration,
} from "../../store/config/configSelectors.js";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "./common/stateInitializers.js";
import { batchActions } from "redux-batched-actions";
import uniqWith from "lodash/uniqWith.js";
import {
    areObjRefsEqual,
    IDashboardAttributeFilterConfig,
    isDashboardAttributeFilter,
    IDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { resolveInsights } from "../../utils/insightResolver.js";
import { insightReferences } from "./common/insightReferences.js";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors.js";
import { applyDefaultFilterView } from "./common/filterViews.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectOriginalFilterContextDefinition,
} from "../../store/filterContext/filterContextSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { getMigratedAttributeFilters } from "./common/migratedAttributeFilters.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../store/drill/drillSelectors.js";

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

        const currentFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
            selectFilterContextAttributeFilters,
        );
        const crossFilteringFiltersLocalIdentifiers: ReturnType<
            typeof selectCrossFilteringFiltersLocalIdentifiers
        > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
        const migratedAttributeFilters = isImmediateAttributeFilterMigrationEnabled
            ? getMigratedAttributeFilters(
                  persistedDashboard.filterContext?.filters.filter(isDashboardAttributeFilter),
                  currentFilters,
                  crossFilteringFiltersLocalIdentifiers,
              )
            : [];

        // Attribute filter configs created in view mode by ad-hoc attribute filter displayAsLabel migration.
        // The config must be preserved when mode is changed from view to edit (when this saga is called) so the
        // user can save the dashboard changes, including the config that would get lost otherwise.
        const adHocAttributeFilterConfigs: IDashboardAttributeFilterConfig[] = yield select(
            selectAttributeFilterConfigsOverrides,
        );
        const effectiveAttributeFilterConfigs = isImmediateAttributeFilterMigrationEnabled
            ? mergeDashboardAttributeFilterConfigs(
                  persistedDashboard.attributeFilterConfigs,
                  adHocAttributeFilterConfigs,
                  migratedAttributeFilters,
              )
            : persistedDashboard.attributeFilterConfigs;

        const originalFilterContext: ReturnType<typeof selectOriginalFilterContextDefinition> = yield select(
            selectOriginalFilterContextDefinition,
        );

        const hasUnsavedFilterChanges = migratedAttributeFilters.length > 0;
        const effectiveOriginalFilterContext =
            isImmediateAttributeFilterMigrationEnabled && hasUnsavedFilterChanges
                ? originalFilterContext
                : undefined;
        // end of ad-hoc migration content

        const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
        const filterViews: ReturnType<typeof selectFilterViews> = yield select(selectFilterViews);
        const dashboardWithUpdatedFilterContext = applyDefaultFilterView(
            persistedDashboard,
            filterViews,
            settings,
        );

        const insightRefsFromWidgets = insightReferences(dashboardWithUpdatedFilterContext.layout);
        const uniqueInsightRefsFromWidgets = uniqWith(insightRefsFromWidgets, areObjRefsEqual);
        const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
            resolveInsights,
            ctx,
            uniqueInsightRefsFromWidgets,
        );

        const effectiveDateFilterConfig: ReturnType<typeof selectEffectiveDateFilterConfig> = yield select(
            selectEffectiveDateFilterConfig,
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
            effectiveDateFilterConfig,
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
