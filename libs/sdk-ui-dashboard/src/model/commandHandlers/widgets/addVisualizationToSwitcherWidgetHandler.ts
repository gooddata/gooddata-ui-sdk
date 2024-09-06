// (C) 2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { AddVisualizationToVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetAddVisualization,
    visualizationSwitcherWidgetAddVisualization,
} from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

export function* addVisualizationToSwticherWidgetContentHandler(
    ctx: DashboardContext,
    cmd: AddVisualizationToVisualizationSwitcherWidgetContent,
): SagaIterator<DashboardVisualizationSwitcherWidgetAddVisualization> {
    const {
        payload: { visualization },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const visualizationSwitcherWidget = validateExistingVisualizationSwitcherWidget(widgets, cmd, ctx);

    // TODO

    yield put(
        layoutActions.addVisualizationSwitcherWidgetVisualization({
            ref: visualizationSwitcherWidget.ref,
            visualization,
            undo: {
                cmd,
            },
        }),
    );

    return visualizationSwitcherWidgetAddVisualization(
        ctx,
        visualizationSwitcherWidget.ref,
        visualization,
        correlationId,
    );
}
