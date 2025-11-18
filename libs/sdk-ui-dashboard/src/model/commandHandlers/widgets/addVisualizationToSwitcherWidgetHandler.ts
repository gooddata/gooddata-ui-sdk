// (C) 2024-2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { AddVisualizationToVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetVisualizationAdded,
    visualizationSwitcherWidgetVisualizationAdded,
} from "../../events/index.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { insightsActions } from "../../store/insights/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
            tabsActions.addVisualizationSwitcherWidgetVisualization({
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
