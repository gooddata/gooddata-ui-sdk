// (C) 2022 GoodData Corporation
import { put } from "redux-saga/effects";

import { dateFilterValidationFailed } from "../../../events/dashboard";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig";
import { DateFilterValidationResult } from "../../../../types";
import { DashboardContext } from "../../../types/commonTypes";

export function* onDateFilterConfigValidationError(
    ctx: DashboardContext,
    validationResult: DateFilterValidationResult,
    correlationId?: string,
) {
    yield dispatchDashboardEvent(dateFilterValidationFailed(ctx, validationResult, correlationId));
    yield put(dateFilterConfigActions.addDateFilterConfigValidationWarning(validationResult));
}
