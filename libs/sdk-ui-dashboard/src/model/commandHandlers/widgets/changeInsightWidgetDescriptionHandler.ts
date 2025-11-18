// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { ChangeInsightWidgetDescription } from "../../commands/index.js";
import { DashboardInsightWidgetDescriptionChanged } from "../../events/index.js";
import { insightWidgetDescriptionChanged } from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
        tabsActions.replaceWidgetDescription({
            ref: insightWidget.ref,
            description,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetDescriptionChanged(ctx, insightWidget.ref, description, correlationId);
}
