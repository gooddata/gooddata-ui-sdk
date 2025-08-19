// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetConfiguration } from "../../commands/index.js";
import { DashboardKpiWidgetConfigurationChanged } from "../../events/index.js";
import { kpiWidgetConfigurationChanged } from "../../events/kpi.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeKpiWidgetConfigurationHandler(
    ctx: DashboardContext,
    cmd: ChangeKpiWidgetConfiguration,
): SagaIterator<DashboardKpiWidgetConfigurationChanged> {
    const {
        payload: { config },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.replaceKpiWidgetConfiguration({
            ref: kpiWidget.ref,
            config,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetConfigurationChanged(ctx, kpiWidget.ref, config, correlationId);
}
