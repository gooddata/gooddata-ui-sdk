// (C) 2022 GoodData Corporation
import { objRefToString } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { RefreshInsightWidget } from "../../commands";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { selectInsightByRef } from "../../store/insights/insightsSelectors";
import { DashboardContext } from "../../types/commonTypes";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { insightsActions } from "../../store/insights";
import { invalidArgumentsProvided } from "../../events/general";
import { DashboardInsightWidgetRefreshed, insightWidgetRefreshed } from "../../events/insight";
import { loadInsight } from "./common/loadInsight";

export function* refreshInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: RefreshInsightWidget,
): SagaIterator<DashboardInsightWidgetRefreshed> {
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { insight: insightRef } = insightWidget;

    const insight: ReturnType<typeof selectInsightByRef> = yield select(selectInsightByRef(insightRef));
    if (!insight) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Insight with ref ${objRefToString(insightRef)} was not found in the store.`,
        );
    }

    const newInsight = yield call(loadInsight, ctx, insightRef);

    yield put(insightsActions.upsertInsight(newInsight));

    return insightWidgetRefreshed(ctx, newInsight, cmd.correlationId);
}
