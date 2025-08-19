// (C) 2021-2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    ObjRef,
    areObjRefsEqual,
    insightTitle,
    isVisualizationSwitcherWidget,
    serializeObjRef,
    widgetTitle,
} from "@gooddata/sdk-model";

import { loadInsight } from "./common/loadInsight.js";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { ChangeInsightWidgetInsight } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardInsightWidgetInsightSwitched } from "../../events/index.js";
import { insightWidgetInsightChanged } from "../../events/insight.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgets, selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetInsightHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetInsight,
): SagaIterator<DashboardInsightWidgetInsightSwitched> {
    const {
        payload: { ref, insightRef, visualizationProperties },
        correlationId,
    } = cmd;

    const widgetsMap: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const widgets: ReturnType<typeof selectWidgets> = yield select(selectWidgets);
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);

    // Find if changed insight is part of Vis. Switcher
    let visSwitcherRef: ObjRef | undefined;
    widgets.forEach((widget) => {
        if (isVisualizationSwitcherWidget(widget)) {
            const isInsightPartOfVisSwitcher = widget.visualizations.find((visualization) => {
                return (
                    areObjRefsEqual(visualization.ref, ref) ||
                    areObjRefsEqual(visualization.insight, insightRef)
                );
            });

            if (isInsightPartOfVisSwitcher) {
                visSwitcherRef = widget.ref;
            }
        }
    });

    const insightWidget = validateExistingInsightWidget(widgetsMap, cmd, ctx);
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
    const newSize = getSizeInfo(settings, "insight", insight);

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

    // Resize Vis. Switcher
    if (visSwitcherRef) {
        yield put(
            layoutActions.resizeVisualizationSwitcherOnInsightChanged({
                ref: visSwitcherRef,
                newSize,
                undo: {
                    cmd,
                },
            }),
        );
    }

    return insightWidgetInsightChanged(ctx, ref, insight, correlationId);
}
