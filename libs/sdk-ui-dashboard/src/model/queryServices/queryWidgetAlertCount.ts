// (C) 2021-2022 GoodData Corporation
import { objRefToString, isKpiWidget } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { select, call, SagaReturnType } from "redux-saga/effects";

import { invalidQueryArguments } from "../events/general";
import { QueryWidgetAlertCount } from "../queries/widgets";
import { selectWidgetByRef } from "../store/layout/layoutSelectors";
import { createQueryService } from "../store/_infra/queryService";
import { DashboardContext } from "../types/commonTypes";

export const QueryWidgetAlertCountService = createQueryService(
    "GDC.DASH/QUERY.WIDGET.ALERT_COUNT",
    queryService,
);

function* queryService(ctx: DashboardContext, query: QueryWidgetAlertCount): SagaIterator<number> {
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

    if (!isKpiWidget(widget)) {
        return 0;
    }

    const resultLoader = ctx.backend.workspace(ctx.workspace).dashboards();
    const [result]: SagaReturnType<typeof resultLoader.getWidgetAlertsCountForWidgets> = yield call(
        [resultLoader, resultLoader.getWidgetAlertsCountForWidgets],
        [widgetRef],
    );

    return result.alertCount;
}
