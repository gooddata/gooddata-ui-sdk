// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeKpiWidgetHeader } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardKpiWidgetHeaderChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingKpiWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { kpiWidgetHeaderChanged } from "../../events/kpi";

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
