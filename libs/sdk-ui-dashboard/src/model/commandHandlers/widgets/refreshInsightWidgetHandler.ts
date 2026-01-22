// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { objRefToString } from "@gooddata/sdk-model";

import { loadInsight } from "./common/loadInsight.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IRefreshInsightWidget } from "../../commands/insight.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type IDashboardInsightWidgetRefreshed, insightWidgetRefreshed } from "../../events/insight.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* refreshInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: IRefreshInsightWidget,
): SagaIterator<IDashboardInsightWidgetRefreshed> {
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
