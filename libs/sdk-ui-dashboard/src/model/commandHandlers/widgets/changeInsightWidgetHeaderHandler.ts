// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeInsightWidgetHeader } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetHeaderChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightWidgetHeaderChanged } from "../../events/insight.js";

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
        layoutActions.replaceWidgetHeader({
            ref: insightWidget.ref,
            header,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetHeaderChanged(ctx, insightWidget.ref, header, correlationId);
}
