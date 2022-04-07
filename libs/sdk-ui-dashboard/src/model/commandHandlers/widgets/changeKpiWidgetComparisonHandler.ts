// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeKpiWidgetComparison } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardKpiWidgetComparisonChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingKpiWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { kpiWidgetComparisonChanged } from "../../events/kpi";
import { IKpiWidget } from "@gooddata/sdk-model";

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
        resolvedComparisonType !== "none" ? comparisonDirection ?? "growIsGood" : undefined;

    yield put(
        layoutActions.replaceKpiWidgetComparison({
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
