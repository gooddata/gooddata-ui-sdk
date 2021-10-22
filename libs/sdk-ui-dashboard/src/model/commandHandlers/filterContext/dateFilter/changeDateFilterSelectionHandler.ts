// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import {
    IDashboardDateFilter,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import toNumber from "lodash/toNumber";
import { ChangeDateFilterSelection, DateFilterSelection } from "../../../commands/filters";
import { dateFilterChanged } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import { selectFilterContextDateFilter } from "../../../store/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { canApplyDateFilter, dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { invalidArgumentsProvided } from "../../../events/general";

export function* changeDateFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeDateFilterSelection,
): SagaIterator<void> {
    const isAllTime =
        cmd.payload.type === "relative" &&
        cmd.payload.granularity === "GDC.time.date" &&
        cmd.payload.from === undefined &&
        cmd.payload.to === undefined;

    const canApply: SagaReturnType<typeof canApplyDateFilter> = yield call(
        canApplyDateFilter,
        dateFilterSelectionToDateFilter(cmd.payload),
    );
    if (!canApply) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Cannot apply a date filter that is invalid by the current dateFilterConfig.`,
        );
    }

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

    yield dispatchDashboardEvent(
        dateFilterChanged(ctx, affectedFilter, cmd.payload.dateFilterOptionLocalId, cmd.correlationId),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function dateFilterSelectionToDateFilter(dateFilterSelection: DateFilterSelection): IDashboardDateFilter {
    if (dateFilterSelection.type === "absolute" && dateFilterSelection.from && dateFilterSelection.to) {
        return newAbsoluteDashboardDateFilter(
            dateFilterSelection.from.toString(),
            dateFilterSelection.to.toString(),
        );
    } else if (
        dateFilterSelection.type === "relative" &&
        dateFilterSelection.granularity === "GDC.time.date" &&
        dateFilterSelection.from === undefined &&
        dateFilterSelection.to === undefined
    ) {
        return newAllTimeDashboardDateFilter();
    } else {
        return newRelativeDashboardDateFilter(
            dateFilterSelection.granularity,
            toNumber(dateFilterSelection.from),
            toNumber(dateFilterSelection.to),
        );
    }
}
