// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetDescription } from "../../commands/index.js";
import { DashboardKpiWidgetDescriptionChanged } from "../../events/index.js";
import { kpiWidgetDescriptionChanged } from "../../events/kpi.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
