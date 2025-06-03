// (C) 2025 GoodData Corporation
import { put } from "redux-saga/effects";
import { setWidgetToShowAsTable } from "../../commands/widgetsToShowAsTable.js";
import {
    addWidgetToShowAsTable,
    removeWidgetToShowAsTable,
} from "../../store/widgetsToShowAsTable/widgetsToShowAsTableState.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* handleSetWidgetToShowAsTable(
    _ctx: DashboardContext,
    cmd: ReturnType<typeof setWidgetToShowAsTable>,
) {
    const { ref, showAsTable } = cmd.payload;
    if (showAsTable) {
        yield put(addWidgetToShowAsTable(ref));
    } else {
        yield put(removeWidgetToShowAsTable(ref));
    }
}
