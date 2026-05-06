// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type IChangeMeasureValueFilterCondition } from "../../../commands/filters.js";
import { measureValueFilterConditionChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilterByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* changeMeasureValueFilterConditionHandler(
    ctx: DashboardContext,
    cmd: IChangeMeasureValueFilterCondition,
): SagaIterator<void> {
    const { localIdentifier, conditions } = cmd.payload;

    const existingFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    if (!existingFilter) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to change condition of measure value filter ${localIdentifier} that does not exist on the dashboard.`,
        );
    }

    yield put(
        tabsActions.changeMeasureValueFilterCondition({
            localIdentifier,
            conditions,
        }),
    );

    const updatedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    invariant(updatedFilter, "Inconsistent state in changeMeasureValueFilterConditionHandler");

    yield dispatchDashboardEvent(
        measureValueFilterConditionChanged(
            ctx,
            localIdentifier,
            updatedFilter,
            conditions,
            cmd.correlationId,
        ),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
