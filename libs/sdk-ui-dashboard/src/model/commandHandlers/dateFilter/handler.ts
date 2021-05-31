// (C) 2021 GoodData Corporation
import { put } from "redux-saga/effects";
import { ChangeDateFilterSelection } from "../../commands/filters";
import { filterContextActions } from "../../state/filterContext";
import { DashboardContext } from "../../types/commonTypes";

export function* dateFilterChangeSelectionCommandHandler(
    _ctx: DashboardContext,
    cmd: ChangeDateFilterSelection,
) {
    yield put(
        filterContextActions.upsertDateFilter({
            dateFilter: {
                granularity: cmd.payload.granularity,
                from: cmd.payload.from,
                to: cmd.payload.to,
                type: cmd.payload.type,
            },
        }),
    );
}
