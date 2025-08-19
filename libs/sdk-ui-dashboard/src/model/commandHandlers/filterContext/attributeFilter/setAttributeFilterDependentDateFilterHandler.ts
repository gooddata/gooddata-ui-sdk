// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { SetAttributeFilterDependentDateFilters } from "../../../commands/filters.js";
import { attributeFilterParentChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* setAttributeFilterDependentDateFiltersHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterDependentDateFilters,
): SagaIterator<void> {
    const { filterLocalId, dependentDateFilters } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localId ${filterLocalId} was not found.`);
    }

    yield put(
        filterContextActions.setAttributeFilterDependentDateFilters({
            filterLocalId,
            dependentDateFilters,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(changedFilter, "Inconsistent state in attributeFilterSetParentCommandHandler");

    yield dispatchDashboardEvent(attributeFilterParentChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
