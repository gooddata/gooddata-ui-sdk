// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeKpiWidgetDescription } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardKpiWidgetDescriptionChanged } from "../../events";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateExistingKpiWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../store/layout";
import { kpiWidgetDescriptionChanged } from "../../events/kpi";

export function* changeKpiWidgetDescriptionHandler(
    ctx: DashboardContext,
    cmd: ChangeKpiWidgetDescription,
): SagaIterator<DashboardKpiWidgetDescriptionChanged> {
    const {
        payload: { description },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    yield put(
        layoutActions.replaceWidgetDescription({
            ref: kpiWidget.ref,
            description,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDescriptionChanged(ctx, kpiWidget.ref, description, correlationId);
}
