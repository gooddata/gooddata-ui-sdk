// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IChangeParameterValues } from "../../commands/parameters.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * Parameters not present on the active tab are ignored by the reducer.
 *
 * @internal
 */
export function* changeParameterValuesHandler(
    _ctx: DashboardContext,
    cmd: IChangeParameterValues,
): SagaIterator<void> {
    yield put(tabsActions.setParameterRuntimeValues({ values: cmd.payload.parameters }));
}
