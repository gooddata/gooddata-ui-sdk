// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ChangeInsightWidgetVisProperties } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetVisPropertiesChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { insightWidgetVisPropertiesChanged } from "../../events/insight";

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
