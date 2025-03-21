// (C) 2024-2025 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import {
    DashboardInsightWidgetIgnoreCrossFilteringChanged,
    insightWidgetIgnoreCrossFilteringChanged,
} from "../../events/insight.js";
import { ChangeInsightWidgetIgnoreCrossFiltering } from "../../commands/insight.js";

export function* changeInsightWidgetIgnoreCrossFilteringHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetIgnoreCrossFiltering,
): SagaIterator<DashboardInsightWidgetIgnoreCrossFilteringChanged> {
    const {
        payload: { ignoreCrossFiltering },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.changeWidgetIgnoreCrossFiltering({
            ref: insightWidget.ref,
            ignoreCrossFiltering,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetIgnoreCrossFilteringChanged(
        ctx,
        insightWidget.ref,
        ignoreCrossFiltering,
        correlationId,
    );
}
