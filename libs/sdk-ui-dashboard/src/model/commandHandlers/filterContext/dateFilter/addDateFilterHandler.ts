// (C) 2023 GoodData Corporation

import { call, put } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { dispatchFilterContextChanged } from "../common.js";
// import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { filterContextActions } from "../../../store/filterContext/index.js";

import { AddDateFilter } from "../../../commands/filters.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export function* addDateFilterHandler(ctx: DashboardContext, cmd: AddDateFilter): SagaIterator<void> {
    const { index, dateDataset } = cmd.payload;

    // TODO INE: check filter bar limit, validation, sanitization, ...

    yield put(
        filterContextActions.addDateFilter({
            index,
            dateDataset,
        }),
    );

    // TODO INE: propagate as event to KD
    // yield dispatchDashboardEvent(dateFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId));

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
