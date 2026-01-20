// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type KpiDrillDefinition } from "@gooddata/sdk-model";

import { validateKpiDrill } from "./validation/kpiDrillValidation.js";
import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { type ISetDrillForKpiWidget } from "../../commands/index.js";
import { type IDashboardKpiWidgetDrillSet, kpiWidgetDrillSet } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* setDrillForKpiWidgetHandler(
    ctx: DashboardContext,
    cmd: ISetDrillForKpiWidget,
): SagaIterator<IDashboardKpiWidgetDrillSet> {
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
        tabsActions.replaceKpiWidgetDrill({
            ref: widgetRef,
            drill,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDrillSet(ctx, widgetRef, drill, correlationId);
}
