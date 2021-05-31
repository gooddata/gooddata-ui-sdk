// (C) 2021 GoodData Corporation
import { put } from "redux-saga/effects";
import { ChangeDateFilterSelection } from "../../commands/filters";
import { filterContextActions } from "../../state/filterContext";
import { DashboardContext } from "../../types/commonTypes";

export function* dateFilterChangeSelectionCommandHandler(
    _ctx: DashboardContext,
    cmd: ChangeDateFilterSelection,
) {
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
}
