// (C) 2021 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { IDashboardCommand } from "../../commands/base";
import { filterContextChanged } from "../../events/filters";
import { selectFilterContext } from "../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../types/commonTypes";

export function* putCurrentFilterContextChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): SagaIterator<void> {
    const filterContext: ReturnType<typeof selectFilterContext> = yield select(selectFilterContext);
    yield put(filterContextChanged(ctx, filterContext, cmd.correlationId));
}
