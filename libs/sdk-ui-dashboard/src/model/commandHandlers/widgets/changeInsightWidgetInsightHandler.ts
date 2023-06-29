// (C) 2021-2023 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeInsightWidgetInsight } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { batchActions } from "redux-batched-actions";
import { invariant } from "ts-invariant";
import { DashboardInsightWidgetInsightSwitched } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightWidgetInsightChanged } from "../../events/insight.js";
import { insightTitle, serializeObjRef, widgetTitle } from "@gooddata/sdk-model";
import { invalidArgumentsProvided } from "../../events/general.js";
import { insightsActions } from "../../store/insights/index.js";
import { uiActions } from "../../store/ui/index.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { loadInsight } from "./common/loadInsight.js";

export function* changeInsightWidgetInsightHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetInsight,
): SagaIterator<DashboardInsightWidgetInsightSwitched> {
    const {
        payload: { ref, insightRef, visualizationProperties },
        correlationId,
    } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);

    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const originalInsight: ReturnType<ReturnType<typeof selectInsightByRef>> = yield select(
        selectInsightByRef(insightWidget.insight),
    );
    invariant(originalInsight, "inconsistent store, original insight not already in store");

    const originalInsightTitle = insightTitle(originalInsight);

    // always load the insight in case it changed since we loaded the insight list
    let insight: SagaReturnType<typeof loadInsight>;
    try {
        insight = yield call(loadInsight, ctx, insightRef);
    } catch {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `The insight with ref: ${serializeObjRef(insightRef)} was not found.`,
        );
    }

    const hasCustomName = widgetTitle(insightWidget) !== originalInsightTitle;
    const isTitleDifferent = insightTitle(insight) !== originalInsightTitle;

    const shouldChangeTitle = !hasCustomName && isTitleDifferent;
    const newSize = getSizeInfo({ enableKDWidgetCustomHeight: true }, "insight", insight);

    yield put(
        batchActions([
            // upsert the internal insight list
            insightsActions.upsertInsight(insight),
            // refresh the visual insight list
            uiActions.requestInsightListUpdate(),
            /**
             * Change the widget:
             * - insight
             * - properties if set
             * - title if appropriate
             */
            layoutActions.replaceInsightWidgetInsight({
                ref,
                insightRef,
                properties: visualizationProperties,
                header: shouldChangeTitle
                    ? {
                          title: insightTitle(insight),
                      }
                    : undefined,
                newSize,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    return insightWidgetInsightChanged(ctx, ref, insight, correlationId);
}
