// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type IMoveMeasureValueFilter } from "../../../commands/filters.js";
import { measureValueFilterMoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextDraggableFilterIndexByRef,
    selectFilterContextFilters,
    selectFilterContextMeasureValueFilterByLocalId,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* moveMeasureValueFilterHandler(
    ctx: DashboardContext,
    cmd: IMoveMeasureValueFilter,
): SagaIterator<void> {
    const { localIdentifier, index } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    const allFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const maximalTargetIndex = allFilters.length - 1;

    if (index > maximalTargetIndex || index < -1) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid index (${index}) provided, it must be between -1 and ${maximalTargetIndex}`,
        );
    }

    const originalIndex: ReturnType<ReturnType<typeof selectFilterContextDraggableFilterIndexByRef>> =
        yield select(selectFilterContextDraggableFilterIndexByRef(localIdentifier));

    yield put(
        tabsActions.moveMeasureValueFilter({
            localIdentifier,
            index,
        }),
    );

    const finalIndex: ReturnType<ReturnType<typeof selectFilterContextDraggableFilterIndexByRef>> =
        yield select(selectFilterContextDraggableFilterIndexByRef(localIdentifier));

    yield dispatchDashboardEvent(
        measureValueFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
