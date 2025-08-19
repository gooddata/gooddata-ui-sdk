// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { RemoveDrillForKpiWidget } from "../../commands/index.js";
import { DashboardKpiWidgetDrillRemoved, kpiWidgetDrillRemoved } from "../../events/kpi.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* removeDrillForKpiWidgetHandler(
    ctx: DashboardContext,
    cmd: RemoveDrillForKpiWidget,
): SagaIterator<DashboardKpiWidgetDrillRemoved> {
    const { correlationId } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);
    const { ref: widgetRef } = kpiWidget;

    yield put(
        layoutActions.replaceKpiWidgetDrill({
            ref: widgetRef,
            drill: undefined,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDrillRemoved(ctx, widgetRef, correlationId);
}
