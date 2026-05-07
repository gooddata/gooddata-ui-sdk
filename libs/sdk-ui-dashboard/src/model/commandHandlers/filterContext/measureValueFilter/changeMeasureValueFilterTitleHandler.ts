// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type ISetMeasureValueFilterTitle } from "../../../commands/filters.js";
import { dashboardMeasureValueFilterTitleChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilterByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* changeMeasureValueFilterTitleHandler(
    ctx: DashboardContext,
    cmd: ISetMeasureValueFilterTitle,
): SagaIterator<void> {
    const { filterLocalId, title } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    yield put(
        tabsActions.changeMeasureValueFilterTitle({
            filterLocalId,
            title,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeMeasureValueFilterTitleHandler, cannot update measure value filter for given local identifier.",
    );

    yield dispatchDashboardEvent(
        dashboardMeasureValueFilterTitleChanged(ctx, changedFilter, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
