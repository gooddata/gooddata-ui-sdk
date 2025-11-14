// (C) 2022-2025 GoodData Corporation

import { put } from "redux-saga/effects";

import { DateFilterValidationResult } from "../../../../types.js";
import { dateFilterValidationFailed } from "../../../events/dashboard.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export function* onDateFilterConfigValidationError(
    ctx: DashboardContext,
    validationResult: DateFilterValidationResult,
    correlationId?: string,
) {
    yield dispatchDashboardEvent(dateFilterValidationFailed(ctx, validationResult, correlationId));
    yield put(tabsActions.addDateFilterConfigValidationWarning(validationResult));
}
