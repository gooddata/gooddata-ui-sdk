// (C) 2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";

import { DashboardContext } from "../../types/commonTypes.js";
import { AddVisualizationToVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
} from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightsActions } from "../../store/insights/index.js";

export function* addVisualizationToSwticherWidgetContentHandler(
    ctx: DashboardContext,
    cmd: AddVisualizationToVisualizationSwitcherWidgetContent,
): SagaIterator<DashboardVisualizationSwitcherWidgetVisualizationAdded> {
    const {
        payload: { visualization, insight },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const visualizationSwitcherWidget = validateExistingVisualizationSwitcherWidget(widgets, cmd, ctx);

    // TODO INE - resize: selectLayout - get sectionIndex, itemIndex from selected vis. switcher
    // layoutActions.changeItemWidth & layoutActions.changeItemHeight. Postponed for now waiting for UX

    yield put(
        batchActions([
            insightsActions.upsertInsight(insight),
            layoutActions.addVisualizationSwitcherWidgetVisualization({
                ref: visualizationSwitcherWidget.ref,
                visualization,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    return visualizationSwitcherWidgetVisualizationAdded(
        ctx,
        visualizationSwitcherWidget.ref,
        visualization,
        correlationId,
    );
}
