// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterSelectionChanged } from "../../../events/filters";
import { ChangeAttributeFilterSelection } from "../../../commands/filters";
import { filterContextActions } from "../../../state/filterContext";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { makeSelectFilterContextAttributeFilterByLocalId } from "../../../state/filterContext/filterContextSelectors";
import { dispatchDashboardEvent } from "../../../state/_infra/eventDispatcher";

export function* changeAttributeFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const { elements, filterLocalId, selectionType } = cmd.payload;

    const selectFilterByLocalId = makeSelectFilterContextAttributeFilterByLocalId();

    // validate filterLocalId
    const affectedFilter: ReturnType<typeof selectFilterByLocalId> = yield select(
        selectFilterByLocalId,
        cmd.payload.filterLocalId,
    );

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    yield put(
        filterContextActions.updateAttributeFilterSelection({
            elements,
            filterLocalId,
            negativeSelection: selectionType === "NOT_IN",
        }),
    );

    const changedFilter: ReturnType<typeof selectFilterByLocalId> = yield select(
        selectFilterByLocalId,
        cmd.payload.filterLocalId,
    );

    invariant(changedFilter, "Inconsistent state in attributeFilterChangeSelectionCommandHandler");

    yield dispatchDashboardEvent(attributeFilterSelectionChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
