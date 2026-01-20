// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { type IChangeKpiWidgetDescription } from "../../commands/index.js";
import { type IDashboardKpiWidgetDescriptionChanged } from "../../events/index.js";
import { kpiWidgetDescriptionChanged } from "../../events/kpi.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeKpiWidgetDescriptionHandler(
    ctx: DashboardContext,
    cmd: IChangeKpiWidgetDescription,
): SagaIterator<IDashboardKpiWidgetDescriptionChanged> {
    const {
        payload: { description },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.replaceWidgetDescription({
            ref: kpiWidget.ref,
            description,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetDescriptionChanged(ctx, kpiWidget.ref, description, correlationId);
}
