// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type ChangeInsightWidgetVisConfiguration } from "../../commands/insight.js";
import {
    type IDashboardInsightWidgetVisConfigurationChanged,
    insightWidgetVisConfigurationChanged,
} from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetVisConfigurationHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetVisConfiguration,
): SagaIterator<IDashboardInsightWidgetVisConfigurationChanged> {
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
