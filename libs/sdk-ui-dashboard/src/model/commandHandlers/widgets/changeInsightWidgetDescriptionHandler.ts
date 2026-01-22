// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IChangeInsightWidgetDescription } from "../../commands/insight.js";
import {
    type IDashboardInsightWidgetDescriptionChanged,
    insightWidgetDescriptionChanged,
} from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetDescriptionHandler(
    ctx: DashboardContext,
    cmd: IChangeInsightWidgetDescription,
): SagaIterator<IDashboardInsightWidgetDescriptionChanged> {
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
