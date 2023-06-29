// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeInsightWidgetDescription } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetDescriptionChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightWidgetDescriptionChanged } from "../../events/insight.js";

export function* changeInsightWidgetDescriptionHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetDescription,
): SagaIterator<DashboardInsightWidgetDescriptionChanged> {
    const {
        payload: { description },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.replaceWidgetDescription({
            ref: insightWidget.ref,
            description,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDescriptionChanged(ctx, insightWidget.ref, description, correlationId);
}
