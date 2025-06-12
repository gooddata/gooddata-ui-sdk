// (C) 2023 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

import { dispatchFilterContextChanged } from "../common.js";

import { SetAttributeFilterSelectionMode } from "../../../commands/filters.js";
import { attributeSelectionModeChanged } from "../../../events/filters.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { invalidArgumentsProvided } from "../../../events/general.js";

export function* changeAttributeSelectionModeHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterSelectionMode,
): SagaIterator<void> {
    const { filterLocalId, selectionMode } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    yield put(
        filterContextActions.changeSelectionMode({
            filterLocalId,
            selectionMode,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeSelectionModeHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(attributeSelectionModeChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
