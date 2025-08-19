// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { ChangeInsightWidgetVisProperties } from "../../commands/index.js";
import { DashboardInsightWidgetVisPropertiesChanged } from "../../events/index.js";
import { insightWidgetVisPropertiesChanged } from "../../events/insight.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
        layoutActions.replaceInsightWidgetVisProperties({
            ref: insightWidget.ref,
            properties,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetVisPropertiesChanged(ctx, insightWidget.ref, properties, correlationId);
}
