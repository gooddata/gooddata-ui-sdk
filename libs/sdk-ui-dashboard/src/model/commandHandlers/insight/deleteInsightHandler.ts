// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { objRefToString } from "@gooddata/sdk-model";

import { type IDeleteInsight } from "../../commands/insightDelete.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardInsightDeleted, insightDeleted } from "../../events/insightDelete.js";
import { selectIsInsightUsedByDashboard } from "../../store/insights/insightUsageSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* deleteInsightHandler(
    ctx: DashboardContext,
    cmd: IDeleteInsight,
): SagaIterator<IDashboardInsightDeleted> {
    const { ref } = cmd.payload;

    const usedByDashboard: boolean = yield select(selectIsInsightUsedByDashboard(ref));
    if (usedByDashboard) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The dashboard being edited uses the insight ${objRefToString(ref)}. Remove it from the dashboard first.`,
        );
    }

    yield call(() => ctx.backend.workspace(ctx.workspace).insights().deleteInsight(ref));
    yield put(uiActions.requestInsightListUpdate());

    return insightDeleted(ctx, ref, cmd.correlationId);
}
