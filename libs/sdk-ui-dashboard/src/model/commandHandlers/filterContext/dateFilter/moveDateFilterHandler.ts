// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { MoveDateFilter } from "../../../commands/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import {
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDraggableFilterIndexByRef,
    selectFilterContextFilters,
} from "../../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { dateFilterMoved } from "../../../events/filters.js";

export function* moveDateFilterHandler(ctx: DashboardContext, cmd: MoveDateFilter): SagaIterator<void> {
    const { dataSet, index } = cmd.payload;

    // validate dataSet
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
        yield select(selectFilterContextDateFilterByDataSet(dataSet));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with dataSet ${dataSet} not found.`);
    }

    // validate target index
    const allFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );

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
        filterContextActions.moveDateFilter({
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
