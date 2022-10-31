// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ChangeInsightWidgetVisConfiguration } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetVisPropertiesChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { insightWidgetVisPropertiesChanged } from "../../events/insight";

export function* changeInsightWidgetVisConfigurationHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetVisConfiguration,
): SagaIterator<DashboardInsightWidgetVisPropertiesChanged> {
    const {
        payload: { config },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.replaceInsightWidgetVisConfiguration({
            ref: insightWidget.ref,
            config,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetVisPropertiesChanged(ctx, insightWidget.ref, config, correlationId);
}
