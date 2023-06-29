// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeInsightWidgetVisConfiguration } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetVisConfigurationChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightWidgetVisConfigurationChanged } from "../../events/insight.js";

export function* changeInsightWidgetVisConfigurationHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetVisConfiguration,
): SagaIterator<DashboardInsightWidgetVisConfigurationChanged> {
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

    return insightWidgetVisConfigurationChanged(
        ctx,
        insightWidget.ref,
        config,
        insightWidget.configuration,
        correlationId,
    );
}
