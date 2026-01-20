// (C) 2024-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingVisualizationSwitcherWidget } from "./validation/widgetValidations.js";
import { type IUpdateVisualizationsFromVisualizationSwitcherWidgetContent } from "../../commands/index.js";
import {
    type IDashboardVisualizationSwitcherWidgetVisualizationsUpdated,
    visualizationSwitcherWidgetVisualizationsUpdated,
} from "../../events/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* updateVisualizationsFromSwticherWidgetContentHandler(
    ctx: DashboardContext,
    cmd: IUpdateVisualizationsFromVisualizationSwitcherWidgetContent,
): SagaIterator<IDashboardVisualizationSwitcherWidgetVisualizationsUpdated> {
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
