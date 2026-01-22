// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { type IChangeKpiWidgetConfiguration } from "../../commands/kpi.js";
import {
    type IDashboardKpiWidgetConfigurationChanged,
    kpiWidgetConfigurationChanged,
} from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeKpiWidgetConfigurationHandler(
    ctx: DashboardContext,
    cmd: IChangeKpiWidgetConfiguration,
): SagaIterator<IDashboardKpiWidgetConfigurationChanged> {
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
