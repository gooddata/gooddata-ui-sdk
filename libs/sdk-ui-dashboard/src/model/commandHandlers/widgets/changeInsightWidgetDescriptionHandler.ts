// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeInsightWidgetDescription } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetDescriptionChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { insightWidgetDescriptionChanged } from "../../events/insight";

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
