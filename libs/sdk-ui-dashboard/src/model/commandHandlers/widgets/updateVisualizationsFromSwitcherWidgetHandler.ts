// (C) 2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { UpdateVisualizationsFromVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

export function* updateVisualizationsFromSwticherWidgetContentHandler(
    ctx: DashboardContext,
    cmd: UpdateVisualizationsFromVisualizationSwitcherWidgetContent,
): SagaIterator<DashboardVisualizationSwitcherWidgetVisualizationsUpdated> {
    const {
        payload: { visualizations },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const visualizationSwitcherWidget = validateExistingVisualizationSwitcherWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.updateVisualizationSwitcherWidgetVisualizations({
            ref: visualizationSwitcherWidget.ref,
            visualizations,
            undo: {
                cmd,
            },
        }),
    );

    return visualizationSwitcherWidgetVisualizationsUpdated(
        ctx,
        visualizationSwitcherWidget.ref,
        visualizations,
        correlationId,
    );
}
