// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { type ChangeKpiWidgetConfiguration } from "../../commands/index.js";
import { type DashboardKpiWidgetConfigurationChanged } from "../../events/index.js";
import { kpiWidgetConfigurationChanged } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

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
        tabsActions.replaceKpiWidgetConfiguration({
            ref: kpiWidget.ref,
            config,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetConfigurationChanged(ctx, kpiWidget.ref, config, correlationId);
}
