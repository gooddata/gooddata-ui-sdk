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
import { selectDateFilterConfig, selectSettings } from "../../store/config/configSelectors.js";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "./common/stateInitializers.js";
import { batchActions } from "redux-batched-actions";
import uniqWith from "lodash/uniqWith.js";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { resolveInsights } from "../../utils/insightResolver.js";
import { insightReferences } from "./common/insightReferences.js";
import {
    selectCatalogDateDatasets,
    selectAllCatalogDisplayFormsMap,
} from "../../store/catalog/catalogSelectors.js";
import { applyDefaultFilterView } from "./common/filterViews.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";

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
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

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

        const effectiveConfig: ReturnType<typeof selectEffectiveDateFilterConfig> = yield select(
            selectEffectiveDateFilterConfig,
        );
        const dateDataSets: ReturnType<typeof selectCatalogDateDatasets> = yield select(
            selectCatalogDateDatasets,
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
            effectiveConfig,
            dateDataSets,
            displayForms,
        );
    } else {
        const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);

        /*
         * For dashboard that is not persisted, the dashboard component is reset to an 'empty' state.
         */
        const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(
            selectDateFilterConfig,
        );

        const dateDataSets: ReturnType<typeof selectCatalogDateDatasets> = yield select(
            selectCatalogDateDatasets,
        );

        const displayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
            selectAllCatalogDisplayFormsMap,
        );

        const { initActions }: SagaReturnType<typeof actionsToInitializeNewDashboard> = yield call(
            actionsToInitializeNewDashboard,
            ctx,
            settings,
            dateFilterConfig,
            dateDataSets,
            displayForms,
        );
        batch = initActions;
    }

    return {
        batch,
        persistedDashboard,
    };
}
