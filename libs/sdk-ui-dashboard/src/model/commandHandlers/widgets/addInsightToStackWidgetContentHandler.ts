// (C) 2021-2024 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { AddInsightToStackWidgetContent } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardStackWidgetAddInsight, stackWidgetAddInsight } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingStackWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { IInsightWidget, insightRef, insightTitle } from "@gooddata/sdk-model";

export function* addInsightToStackWidgetContentHandler(
    ctx: DashboardContext,
    cmd: AddInsightToStackWidgetContent,
): SagaIterator<DashboardStackWidgetAddInsight> {
    const {
        payload: { insight, selectedInsight },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const stackWidget = validateExistingStackWidget(widgets, cmd, ctx);

    const widget: IInsightWidget = {
        type: "insight",
        insight: insightRef(insight),
        ignoreDashboardFilters: [],
        drills: [],
        title: insightTitle(insight),
        description: "",
        identifier: "paco",
        ref: {
            identifier: "paco",
            uri: "paco",
        },
        uri: "paco",
    };

    yield put(
        layoutActions.addStackWidgetInsight({
            ref: stackWidget.ref,
            widget,
            insight,
            selectedInsight,
            undo: {
                cmd,
            },
        }),
    );

    return stackWidgetAddInsight(ctx, stackWidget.ref, insight, selectedInsight, correlationId);
}
