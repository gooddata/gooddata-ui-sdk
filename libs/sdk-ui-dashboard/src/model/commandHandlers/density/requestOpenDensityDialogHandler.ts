// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { type IRequestOpenDensityDialog } from "../../commands/density.js";
import { selectIsInEditMode } from "../../store/renderMode/renderModeSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* requestOpenDensityDialogHandler(
    _ctx: DashboardContext,
    _cmd: IRequestOpenDensityDialog,
): SagaIterator<void> {
    const isInEditMode: boolean = yield select(selectIsInEditMode);
    if (isInEditMode) {
        return;
    }

    yield put(uiActions.openDensityDialog());
}
