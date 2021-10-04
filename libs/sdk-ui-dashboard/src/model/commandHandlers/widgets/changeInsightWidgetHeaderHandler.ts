// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeInsightWidgetHeader } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetHeaderChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { insightWidgetHeaderChanged } from "../../events/insight";

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
