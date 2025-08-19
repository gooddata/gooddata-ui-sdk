// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { MoveAttributeFilter } from "../../../commands/filters.js";
import { attributeFilterMoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextDraggableFilterIndexByRef,
    selectFilterContextFilters,
} from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* moveAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: MoveAttributeFilter,
): SagaIterator<void> {
    const { filterLocalId, index } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    // validate target index
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
        yield select(selectFilterContextDraggableFilterIndexByRef(filterLocalId));

    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );

    const finalIndex: ReturnType<ReturnType<typeof selectFilterContextDraggableFilterIndexByRef>> =
        yield select(selectFilterContextDraggableFilterIndexByRef(filterLocalId));

    yield dispatchDashboardEvent(
        attributeFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
