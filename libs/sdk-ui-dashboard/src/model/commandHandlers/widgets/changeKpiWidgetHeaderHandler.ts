// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetHeader } from "../../commands/index.js";
import { DashboardKpiWidgetHeaderChanged } from "../../events/index.js";
import { kpiWidgetHeaderChanged } from "../../events/kpi.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
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
        layoutActions.replaceWidgetHeader({
            ref: kpiWidget.ref,
            header,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetHeaderChanged(ctx, kpiWidget.ref, header, correlationId);
}
