// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { ChangeInsightWidgetHeader } from "../../commands/index.js";
import { DashboardInsightWidgetHeaderChanged } from "../../events/index.js";
import { insightWidgetHeaderChanged } from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetHeaderHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetHeader,
): SagaIterator<DashboardInsightWidgetHeaderChanged> {
    const {
        payload: { header },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.replaceWidgetHeader({
            ref: insightWidget.ref,
            header,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetHeaderChanged(ctx, insightWidget.ref, header, correlationId);
}
