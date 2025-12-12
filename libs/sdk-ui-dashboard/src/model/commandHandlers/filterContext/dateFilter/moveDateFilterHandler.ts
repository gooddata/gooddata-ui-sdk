// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type MoveDateFilter } from "../../../commands/filters.js";
import { dateFilterMoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDraggableFilterIndexByRef,
    selectFilterContextFilters,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* moveDateFilterHandler(ctx: DashboardContext, cmd: MoveDateFilter): SagaIterator<void> {
    const { dataSet, index } = cmd.payload;

    // validate dataSet
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
        yield select(selectFilterContextDateFilterByDataSet(dataSet));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with dataSet ${dataSet} not found.`);
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
        yield select(selectFilterContextDraggableFilterIndexByRef(dataSet));

    yield put(
        tabsActions.moveDateFilter({
            dataSet,
            index,
        }),
    );

    const finalIndex: ReturnType<ReturnType<typeof selectFilterContextDraggableFilterIndexByRef>> =
        yield select(selectFilterContextDraggableFilterIndexByRef(dataSet));

    yield dispatchDashboardEvent(
        dateFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
