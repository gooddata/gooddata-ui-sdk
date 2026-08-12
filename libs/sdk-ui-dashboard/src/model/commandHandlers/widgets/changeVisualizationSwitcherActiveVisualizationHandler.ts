// (C) 2024-2026 GoodData Corporation

import type { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import type { IChangeVisualizationSwitcherActiveVisualization } from "../../commands/visualizationSwitcher.js";
import {
    type IDashboardVisualizationSwitcherWidgetActiveVisualizationChanged,
    visualizationSwitcherWidgetActiveVisualizationChanged,
} from "../../events/visualizationSwitcher.js";
import { uiActions } from "../../store/ui/index.js";
import type { DashboardContext } from "../../types/commonTypes.js";

export function* changeVisualizationSwitcherActiveVisualizationHandler(
    ctx: DashboardContext,
    cmd: IChangeVisualizationSwitcherActiveVisualization,
): SagaIterator<IDashboardVisualizationSwitcherWidgetActiveVisualizationChanged> {
    const {
        payload: { ref, activeVisualizationIdentifier },
        correlationId,
    } = cmd;

    yield put(
        uiActions.setVisualizationSwitcherActiveVisualization({
            widgetRef: ref,
            activeVisualizationIdentifier,
        }),
    );

    return visualizationSwitcherWidgetActiveVisualizationChanged(
        ctx,
        ref,
        activeVisualizationIdentifier,
        correlationId,
    );
}
