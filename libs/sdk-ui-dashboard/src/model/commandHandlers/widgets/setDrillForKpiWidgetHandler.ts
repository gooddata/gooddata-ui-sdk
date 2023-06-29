// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { SetDrillForKpiWidget } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { DashboardKpiWidgetDrillSet, kpiWidgetDrillSet } from "../../events/kpi.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { KpiDrillDefinition } from "@gooddata/sdk-model";
import { validateKpiDrill } from "./validation/kpiDrillValidation.js";

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

    yield call(validateKpiDrill, drill, ctx, cmd);

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
