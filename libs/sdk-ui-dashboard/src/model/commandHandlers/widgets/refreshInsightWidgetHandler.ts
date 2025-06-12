// (C) 2022 GoodData Corporation
import { objRefToString } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { RefreshInsightWidget } from "../../commands/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { insightsActions } from "../../store/insights/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardInsightWidgetRefreshed, insightWidgetRefreshed } from "../../events/insight.js";
import { loadInsight } from "./common/loadInsight.js";

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
