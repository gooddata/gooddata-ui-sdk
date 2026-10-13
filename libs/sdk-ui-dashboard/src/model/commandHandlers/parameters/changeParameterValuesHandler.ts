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
import { selectEnablePersistentFiltersAcrossTabs } from "../../store/meta/metaSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectParameterValuesByTab } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * Parameters not present on a written tab are ignored by the reducer. When persistent filters
 * across tabs are on, the same values are written to every tab. A change event is emitted for
 * each tab whose applied values differ from the snapshot, source tab first.
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
    const enablePersistentFiltersAcrossTabs: ReturnType<typeof selectEnablePersistentFiltersAcrossTabs> =
        yield select(selectEnablePersistentFiltersAcrossTabs);
    const valuesBefore: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);

    yield put(
        tabsActions.setParameterRuntimeValues({
            values: cmd.payload.parameters,
            tabLocalIdentifier: cmd.payload.tabLocalIdentifier,
            enablePersistentFiltersAcrossTabs,
        }),
    );

    yield call(dispatchParametersChangedForAffectedTabs, ctx, cmd, valuesBefore, tabId);
}

/**
 * Emits one `GDC.DASH/EVT.PARAMETERS.CHANGED` per tab whose applied values changed. Local parameter
 * state is stored from that event, so every written tab has to emit or its saved value stays stale.
 *
 * @internal
 */
export function* dispatchParametersChangedForAffectedTabs(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    valuesBefore: Record<string, IInsightParameterValue[] | undefined>,
    sourceTabId: string,
): SagaIterator<void> {
    const valuesByTab: ReturnType<typeof selectParameterValuesByTab> =
        yield select(selectParameterValuesByTab);
    const tabIds = [sourceTabId, ...Object.keys(valuesByTab).filter((id) => id !== sourceTabId)];
    for (const tabId of tabIds) {
        yield call(dispatchParametersChanged, ctx, cmd, tabId, valuesBefore[tabId]);
    }
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
