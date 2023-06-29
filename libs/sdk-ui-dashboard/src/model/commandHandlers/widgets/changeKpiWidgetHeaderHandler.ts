// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeKpiWidgetHeader } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardKpiWidgetHeaderChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { kpiWidgetHeaderChanged } from "../../events/kpi.js";

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
