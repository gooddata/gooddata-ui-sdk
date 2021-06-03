// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { ChangeDateFilterSelection } from "../../commands/filters";
import { dateFilterChanged, filterContextChanged } from "../../events/filters";
import { filterContextActions } from "../../state/filterContext";
import {
    selectFilterContext,
    selectFilterContextDateFilter,
} from "../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../types/commonTypes";

export function* dateFilterChangeSelectionCommandHandler(
    ctx: DashboardContext,
    cmd: ChangeDateFilterSelection,
): SagaIterator<void> {
    const isAllTime =
        cmd.payload.type === "relative" &&
        cmd.payload.granularity === "GDC.time.date" &&
        cmd.payload.from === undefined &&
        cmd.payload.to === undefined;

    yield put(
        filterContextActions.upsertDateFilter(
            isAllTime
                ? { type: "allTime" }
                : {
                      type: cmd.payload.type,
                      granularity: cmd.payload.granularity,
                      from: cmd.payload.from,
                      to: cmd.payload.to,
                  },
        ),
    );

    const affectedFilter: ReturnType<typeof selectFilterContextDateFilter> = yield select(
        selectFilterContextDateFilter,
    );

    yield put(
        dateFilterChanged(
            ctx,
            // TODO we need to decide how to externally represent All Time date filter and unify this
            affectedFilter ?? { dateFilter: { granularity: "GDC.time.date", type: "relative" } },
        ),
    );

    const filterContext: ReturnType<typeof selectFilterContext> = yield select(selectFilterContext);
    yield put(filterContextChanged(ctx, filterContext, cmd.correlationId));
}
