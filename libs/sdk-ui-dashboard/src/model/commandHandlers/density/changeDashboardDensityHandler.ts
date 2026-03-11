// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IChangeDashboardDensity } from "../../commands/density.js";
import { selectIsInEditMode } from "../../store/renderMode/renderModeSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export const DASHBOARD_DENSITY_LOCAL_STORAGE_KEY = "dashboardDensityUserSetting";

export function* changeDashboardDensityHandler(
    _ctx: DashboardContext,
    cmd: IChangeDashboardDensity,
): SagaIterator<void> {
    const isInEditMode: boolean = yield select(selectIsInEditMode);
    const density = isInEditMode ? "comfortable" : cmd.payload.density;

    try {
        localStorage.setItem(DASHBOARD_DENSITY_LOCAL_STORAGE_KEY, density);
    } catch {
        // Ignore localStorage errors (e.g. private browsing mode)
    }

    yield put(uiActions.setDensity(density));
}
