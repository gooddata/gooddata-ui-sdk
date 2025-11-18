// (C) 2024-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { UpdateVisualizationsFromVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    DashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "../../events/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
        tabsActions.updateVisualizationSwitcherWidgetVisualizations({
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
