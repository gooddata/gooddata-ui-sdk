// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type ChangeInsightWidgetVisProperties } from "../../commands/index.js";
import { type DashboardInsightWidgetVisPropertiesChanged } from "../../events/index.js";
import { insightWidgetVisPropertiesChanged } from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetVisPropertiesHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetVisProperties,
): SagaIterator<DashboardInsightWidgetVisPropertiesChanged> {
    const {
        payload: { properties },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.replaceInsightWidgetVisProperties({
            ref: insightWidget.ref,
            properties,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetVisPropertiesChanged(ctx, insightWidget.ref, properties, correlationId);
}
