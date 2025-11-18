// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetHeader } from "../../commands/index.js";
import { DashboardKpiWidgetHeaderChanged } from "../../events/index.js";
import { kpiWidgetHeaderChanged } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* changeKpiWidgetHeaderHandler(
    ctx: DashboardContext,
    cmd: ChangeKpiWidgetHeader,
): SagaIterator<DashboardKpiWidgetHeaderChanged> {
    const {
        payload: { header },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.replaceWidgetHeader({
            ref: kpiWidget.ref,
            header,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetHeaderChanged(ctx, kpiWidget.ref, header, correlationId);
}
