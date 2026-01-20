// (C) 2024-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IChangeInsightWidgetIgnoreCrossFiltering } from "../../commands/insight.js";
import {
    type IDashboardInsightWidgetIgnoreCrossFilteringChanged,
    insightWidgetIgnoreCrossFilteringChanged,
} from "../../events/insight.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeInsightWidgetIgnoreCrossFilteringHandler(
    ctx: DashboardContext,
    cmd: IChangeInsightWidgetIgnoreCrossFiltering,
): SagaIterator<IDashboardInsightWidgetIgnoreCrossFilteringChanged> {
    const {
        payload: { ignoreCrossFiltering },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.changeWidgetIgnoreCrossFiltering({
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
