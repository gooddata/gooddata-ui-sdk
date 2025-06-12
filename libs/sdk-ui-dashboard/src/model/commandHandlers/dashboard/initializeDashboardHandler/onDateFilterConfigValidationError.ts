// (C) 2022 GoodData Corporation
import { put } from "redux-saga/effects";

import { dateFilterValidationFailed } from "../../../events/dashboard.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import { DateFilterValidationResult } from "../../../../types.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export function* onDateFilterConfigValidationError(
    ctx: DashboardContext,
    validationResult: DateFilterValidationResult,
    correlationId?: string,
) {
    yield dispatchDashboardEvent(dateFilterValidationFailed(ctx, validationResult, correlationId));
    yield put(dateFilterConfigActions.addDateFilterConfigValidationWarning(validationResult));
}
