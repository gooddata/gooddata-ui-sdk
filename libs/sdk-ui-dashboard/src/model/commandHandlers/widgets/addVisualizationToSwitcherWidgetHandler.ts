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
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { selectSettings } from "../../store/config/configSelectors.js";

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
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);

    const newSize = getSizeInfo(settings, "insight", insight);

    yield put(
        batchActions([
            insightsActions.upsertInsight(insight),
            layoutActions.addVisualizationSwitcherWidgetVisualization({
                ref: visualizationSwitcherWidget.ref,
                visualization,
                newSize,
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
