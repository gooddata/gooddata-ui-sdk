// (C) 2025 GoodData Corporation
import { put } from "redux-saga/effects";
import { setShowWidgetAsTable } from "../../commands/showWidgetAsTable.js";
import { addWidgetToShowAsTable, removeWidgetToShowAsTable } from "../../store/showWidgetAsTable/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { showWidgetAsTableSet } from "../../events/showWidgetAsTable.js";

export function* handleSetWidgetToShowAsTable(
    ctx: DashboardContext,
    cmd: ReturnType<typeof setShowWidgetAsTable>,
) {
    const { ref, showAsTable } = cmd.payload;
    if (showAsTable) {
        yield put(addWidgetToShowAsTable(ref));
    } else {
        yield put(removeWidgetToShowAsTable(ref));
    }

    // Emit event with context, correlationId, and widget reference
    yield put(showWidgetAsTableSet(ctx, ref, showAsTable, cmd.correlationId));
}
