// (C) 2024-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { ChangeInsightWidgetIgnoreCrossFiltering } from "../../commands/insight.js";
import {
    DashboardInsightWidgetIgnoreCrossFilteringChanged,
    insightWidgetIgnoreCrossFilteringChanged,
} from "../../events/insight.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
