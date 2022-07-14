// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { SetDrillForKpiWidget } from "../../commands";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { DashboardKpiWidgetDrillSet, kpiWidgetDrillSet } from "../../events/kpi";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { validateExistingKpiWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { KpiDrillDefinition } from "@gooddata/sdk-model";

export function* setDrillForKpiWidgetHandler(
    ctx: DashboardContext,
    cmd: SetDrillForKpiWidget,
): SagaIterator<DashboardKpiWidgetDrillSet> {
    const { correlationId } = cmd;
    const { legacyDashboardTabIdentifier, legacyDashboardRef } = cmd.payload;

    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);
    const { ref: widgetRef } = kpiWidget;

    const drill: KpiDrillDefinition = {
        tab: legacyDashboardTabIdentifier,
        target: legacyDashboardRef,
        origin: {
            type: "drillFromMeasure",
            measure: kpiWidget.kpi.metric,
        },
        type: "drillToLegacyDashboard",
        transition: "in-place",
    };

    // TODO validate the drill targets?

    yield put(
        layoutActions.replaceKpiWidgetDrill({
            ref: widgetRef,
            drill,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDrillSet(ctx, widgetRef, drill, correlationId);
}
