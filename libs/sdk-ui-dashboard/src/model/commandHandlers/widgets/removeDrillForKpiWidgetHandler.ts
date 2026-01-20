// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { type IRemoveDrillForKpiWidget } from "../../commands/index.js";
import { type IDashboardKpiWidgetDrillRemoved, kpiWidgetDrillRemoved } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* removeDrillForKpiWidgetHandler(
    ctx: DashboardContext,
    cmd: IRemoveDrillForKpiWidget,
): SagaIterator<IDashboardKpiWidgetDrillRemoved> {
    const { correlationId } = cmd;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);
    const { ref: widgetRef } = kpiWidget;

    yield put(
        tabsActions.replaceKpiWidgetDrill({
            ref: widgetRef,
            drill: undefined,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDrillRemoved(ctx, widgetRef, correlationId);
}
