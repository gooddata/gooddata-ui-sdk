// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";

import { type QueryWidgetBrokenAlerts } from "../queries/widgets.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { type IBrokenAlertFilterBasicInfo } from "../types/alertTypes.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryWidgetBrokenAlertService = createQueryService(
    "GDC.DASH/QUERY.WIDGET.BROKEN_ALERTS",
    queryService,
);

// eslint-disable-next-line require-yield
function* queryService(
    _ctx: DashboardContext,
    _query: QueryWidgetBrokenAlerts,
): SagaIterator<IBrokenAlertFilterBasicInfo[]> {
    return [];
}
