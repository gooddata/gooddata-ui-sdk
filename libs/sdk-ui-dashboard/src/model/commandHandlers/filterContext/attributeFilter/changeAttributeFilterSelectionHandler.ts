// (C) 2021 GoodData Corporation
import { all, call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterSelectionChanged } from "../../../events/filters";
import { ChangeAttributeFilterSelection } from "../../../commands/filters";
import { filterContextActions } from "../../../store/filterContext";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import {
    selectAttributeFilterDescendants,
    selectFilterContextAttributeFilterByLocalId,
} from "../../../store/filterContext/filterContextSelectors";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";

export function* changeAttributeFilterSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const { elements, filterLocalId, selectionType } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

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

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    invariant(changedFilter, "Inconsistent state in attributeFilterChangeSelectionCommandHandler");

    const childFiltersIds: ReturnType<ReturnType<typeof selectAttributeFilterDescendants>> = yield select(
        selectAttributeFilterDescendants(changedFilter.attributeFilter.localIdentifier!),
    );

    yield all(
        childFiltersIds.map((childFilterId) =>
            put(
                filterContextActions.updateAttributeFilterSelection({
                    filterLocalId: childFilterId,
                    elements: {
                        uris: [],
                    },
                    negativeSelection: true,
                }),
            ),
        ),
    );

    yield dispatchDashboardEvent(attributeFilterSelectionChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
