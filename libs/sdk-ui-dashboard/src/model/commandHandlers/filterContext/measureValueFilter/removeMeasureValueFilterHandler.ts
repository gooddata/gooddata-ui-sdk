// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { dashboardFilterObjRef } from "@gooddata/sdk-model";

import { type IRemoveMeasureValueFilter } from "../../../commands/filters.js";
import { measureValueFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextMeasureValueFilterByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeMeasureValueFilterHandler(
    ctx: DashboardContext,
    cmd: IRemoveMeasureValueFilter,
): SagaIterator<void> {
    const { localIdentifier } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextMeasureValueFilterByLocalId>> =
        yield select(selectFilterContextMeasureValueFilterByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    const removedMeasureRef = dashboardFilterObjRef(affectedFilter);

    yield put(tabsActions.removeMeasureValueFilter({ localIdentifier }));
    yield put(tabsActions.removeMeasureValueFilterConfig(localIdentifier));
    if (removedMeasureRef) {
        yield put(
            tabsActions.removeIgnoredMeasureValueFilter({
                measureRefs: [removedMeasureRef],
            }),
        );
    }

    yield dispatchDashboardEvent(measureValueFilterRemoved(ctx, affectedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
