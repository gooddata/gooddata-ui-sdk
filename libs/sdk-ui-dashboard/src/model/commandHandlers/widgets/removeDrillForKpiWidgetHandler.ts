// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveDrillForKpiWidget } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardKpiWidgetDrillRemoved, kpiWidgetDrillRemoved } from "../../events/kpi.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

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
