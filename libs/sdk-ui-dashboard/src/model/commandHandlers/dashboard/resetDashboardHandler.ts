// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ResetDashboard } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardWasReset } from "../../events";
import { selectPersistedDashboard } from "../../state/meta/metaSelectors";
import { put, select } from "redux-saga/effects";
import { dashboardWasReset } from "../../events/dashboard";
import { selectInsights } from "../../state/insights/insightsSelectors";
import { selectEffectiveDateFilterConfig } from "../../state/dateFilterConfig/dateFilterConfigSelectors";
import { PayloadAction } from "@reduxjs/toolkit";
import { selectDateFilterConfig, selectSettings } from "../../state/config/configSelectors";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "./common/stateInitializers";
import { batchActions } from "redux-batched-actions";

export function* resetDashboardHandler(
    ctx: DashboardContext,
    cmd: ResetDashboard,
): SagaIterator<DashboardWasReset> {
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

    let batch: Array<PayloadAction<any>> = [];
    if (persistedDashboard) {
        /*
         * For dashboard that is already persisted the insights and effective date filter config can be used
         * as is (insights are just accumulated - no problem if there are more insights than what is on the
         * persisted dashboard, date filter config is read-only).
         *
         * The call to create actions to initialize existing dashboard will use all this to set state
         * of filter context, layout and meta based on the contents of persisted dashboard; this is the
         * same logic as what is done during the initialization of the dashboard based on data from backend.
         *
         * Everything else can stay untouched.
         */
        const insights: ReturnType<typeof selectInsights> = yield select(selectInsights);
        const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
        const effectiveConfig: ReturnType<typeof selectEffectiveDateFilterConfig> = yield select(
            selectEffectiveDateFilterConfig,
        );

        batch = actionsToInitializeExistingDashboard(persistedDashboard, insights, settings, effectiveConfig);
    } else {
        /*
         * For dashboard that is not persisted, the dashboard component is reset to an 'empty' state.
         */
        const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(
            selectDateFilterConfig,
        );

        batch = actionsToInitializeNewDashboard(dateFilterConfig);
    }

    yield put(batchActions(batch, "@@GDC.DASH/RESET"));

    return dashboardWasReset(ctx, persistedDashboard, cmd.correlationId);
}
