// (C) 2024 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveVisualizationFromVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetRemoveVisualization,
    visualizationSwitcherWidgetRemoveVisualization,
} from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

export function* removeVisualizationFromSwticherWidgetContentHandler(
    ctx: DashboardContext,
    cmd: RemoveVisualizationFromVisualizationSwitcherWidgetContent,
): SagaIterator<DashboardVisualizationSwitcherWidgetRemoveVisualization> {
    const {
        payload: { visualization },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const visualizationSwitcherWidget = validateExistingVisualizationSwitcherWidget(widgets, cmd, ctx);

    // TODO

    yield put(
        layoutActions.removeVisualizationSwitcherWidgetVisualization({
            ref: visualizationSwitcherWidget.ref,
            visualization,
            undo: {
                cmd,
            },
        }),
    );

    return visualizationSwitcherWidgetRemoveVisualization(
        ctx,
        visualizationSwitcherWidget.ref,
        visualization,
        correlationId,
    );
}
