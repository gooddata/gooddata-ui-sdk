// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type ISetMeasureValueFilterDimensionality } from "../../../commands/filters.js";
import { measureValueFilterDimensionalityChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilterByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { type ITabSyncSession, beginTabSync, endTabSync, putTabSynced } from "../tabSync/tabSyncSaga.js";

export function* changeMeasureValueFilterDimensionalityHandler(
    ctx: DashboardContext,
    cmd: ISetMeasureValueFilterDimensionality,
): SagaIterator<void> {
    const { localIdentifier, dimensionality } = cmd.payload;

    const existingFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));
    const session: ITabSyncSession = yield call(beginTabSync);

    if (!existingFilter) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to change dimensionality of measure value filter ${localIdentifier} that does not exist on the dashboard.`,
        );
    }

    yield call(putTabSynced, session, [
        tabsActions.setMeasureValueFilterDimensionality({ localIdentifier, dimensionality }),
    ]);

    const updatedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    invariant(updatedFilter, "Inconsistent state in changeMeasureValueFilterDimensionalityHandler");

    yield dispatchDashboardEvent(
        measureValueFilterDimensionalityChanged(
            ctx,
            localIdentifier,
            updatedFilter,
            dimensionality,
            cmd.correlationId,
        ),
    );

    yield call(endTabSync, ctx, cmd, session);
}
