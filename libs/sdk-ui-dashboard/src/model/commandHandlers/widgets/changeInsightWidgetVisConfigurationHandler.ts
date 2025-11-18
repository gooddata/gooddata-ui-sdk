// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { ChangeInsightWidgetVisConfiguration } from "../../commands/index.js";
import { DashboardInsightWidgetVisConfigurationChanged } from "../../events/index.js";
import { insightWidgetVisConfigurationChanged } from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
        tabsActions.replaceInsightWidgetVisConfiguration({
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
