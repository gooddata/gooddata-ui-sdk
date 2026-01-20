// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import { isKpiWidget, objRefToString } from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { type IQueryWidgetAlertCount } from "../queries/widgets.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { selectWidgetByRef } from "../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../types/commonTypes.js";
import { isTemporaryIdentity } from "../utils/dashboardItemUtils.js";

export const QueryWidgetAlertCountService = createQueryService(
    "GDC.DASH/QUERY.WIDGET.ALERT_COUNT",
    queryService,
);

function* queryService(ctx: DashboardContext, query: IQueryWidgetAlertCount): SagaIterator<number> {
    const {
        payload: { widgetRef },
        correlationId,
    } = query;

    const widget = yield select(selectWidgetByRef(widgetRef));
    if (!widget) {
        throw invalidQueryArguments(
            ctx,
            `Widget with ref ${objRefToString(widgetRef)} does not exist on the dashboard`,
            correlationId,
        );
    }

    // just added KPIs with temporary identity cannot have alerts, do not try to load their count, it will fail
    if (!isKpiWidget(widget) || isTemporaryIdentity(widget)) {
        return 0;
    }

    const resultLoader = ctx.backend.workspace(ctx.workspace).dashboards();
    const [result]: SagaReturnType<typeof resultLoader.getWidgetAlertsCountForWidgets> = yield call(
        [resultLoader, resultLoader.getWidgetAlertsCountForWidgets],
        [widgetRef],
    );

    return result.alertCount;
}
