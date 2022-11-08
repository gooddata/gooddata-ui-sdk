// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ChangeKpiWidgetConfiguration } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardKpiWidgetConfigurationChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingKpiWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { kpiWidgetConfigurationChanged } from "../../events/kpi";

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
