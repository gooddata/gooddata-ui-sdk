// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { type IInsightParameterValue } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "../../commands/base.js";
import { type IChangeParameterValues } from "../../commands/parameters.js";
import { parametersChanged } from "../../events/parameters.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectEnableParameters } from "../../store/config/configSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectParameterValuesByTab } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * Parameters not present on the target tab are ignored by the reducer. The event is emitted only
 * when at least one applied value of the tab changes.
 *
 * @internal
 */
export function* changeParameterValuesHandler(
    ctx: DashboardContext,
    cmd: IChangeParameterValues,
): SagaIterator<void> {
    const enableParameters: ReturnType<typeof selectEnableParameters> = yield select(selectEnableParameters);
    if (!enableParameters) {
        return;
    }

    const tabId: string =
        cmd.payload.tabLocalIdentifier ?? (yield select(selectActiveOrDefaultTabLocalIdentifier));
    const valuesBefore: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);

    yield put(
        tabsActions.setParameterRuntimeValues({
            values: cmd.payload.parameters,
            tabLocalIdentifier: cmd.payload.tabLocalIdentifier,
        }),
    );

    yield call(dispatchParametersChanged, ctx, cmd, tabId, valuesBefore[tabId]);
}

/**
 * Emits `GDC.DASH/EVT.PARAMETERS.CHANGED` only when the tab's applied values differ from the snapshot.
 * Emits nothing when the tab does not exist.
 *
 * @internal
 */
export function* dispatchParametersChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    tabLocalIdentifier: string,
    valuesBefore: IInsightParameterValue[] | undefined,
): SagaIterator<void> {
    const valuesByTab: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const values = valuesByTab[tabLocalIdentifier];
    if (values === undefined || isEqual(valuesBefore, values)) {
        return;
    }

    yield dispatchDashboardEvent(parametersChanged(ctx, values, tabLocalIdentifier, cmd.correlationId));
}
