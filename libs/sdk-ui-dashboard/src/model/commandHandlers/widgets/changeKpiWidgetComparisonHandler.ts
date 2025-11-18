// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { IKpiWidget } from "@gooddata/sdk-model";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetComparison } from "../../commands/index.js";
import { DashboardKpiWidgetComparisonChanged } from "../../events/index.js";
import { kpiWidgetComparisonChanged } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeKpiWidgetComparisonHandler(
    ctx: DashboardContext,
    cmd: ChangeKpiWidgetComparison,
): SagaIterator<DashboardKpiWidgetComparisonChanged> {
    const {
        payload: {
            comparison: { comparisonType, comparisonDirection },
        },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    const resolvedComparisonType = comparisonType ?? "none";
    const resolvedComparisonDirection =
        resolvedComparisonType === "none" ? undefined : (comparisonDirection ?? "growIsGood");

    yield put(
        tabsActions.replaceKpiWidgetComparison({
            ref: kpiWidget.ref,
            comparisonType: resolvedComparisonType,
            comparisonDirection: resolvedComparisonDirection,
            undo: {
                cmd,
            },
        }),
    );

    const updatedWidgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const updatedKpiWidget = updatedWidgets.get(kpiWidget.ref) as IKpiWidget;

    return kpiWidgetComparisonChanged(ctx, kpiWidget.ref, updatedKpiWidget.kpi, correlationId);
}
