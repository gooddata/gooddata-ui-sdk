// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { QueryWidgetBrokenAlerts } from "../queries/widgets.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { IBrokenAlertFilterBasicInfo } from "../types/alertTypes.js";
import { DashboardContext } from "../types/commonTypes.js";

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
