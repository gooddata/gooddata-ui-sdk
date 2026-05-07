// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type ISetDashboardMeasureValueFilterConfigMode } from "../../commands/dashboard.js";
import { dashboardMeasureValueFilterConfigModeChanged } from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilterByLocalId } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeMeasureValueFilterModeHandler(
    ctx: DashboardContext,
    cmd: ISetDashboardMeasureValueFilterConfigMode,
): SagaIterator<void> {
    const { localIdentifier } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    yield put(tabsActions.changeMeasureValueFilterConfigMode(cmd.payload));

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    invariant(
        changedFilter,
        "Inconsistent state in changeMeasureValueFilterModeHandler, cannot update measure value filter for given local identifier.",
    );

    yield dispatchDashboardEvent(
        dashboardMeasureValueFilterConfigModeChanged(ctx, changedFilter, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
