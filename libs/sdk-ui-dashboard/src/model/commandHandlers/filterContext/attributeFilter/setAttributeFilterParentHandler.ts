// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { validateAttributeFilterParents } from "./validation/parentFiltersValidation.js";
import { SetAttributeFilterParents } from "../../../commands/filters.js";
import { attributeFilterParentChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilters,
} from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* setAttributeFilterParentsHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterParents,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    const displayFormsMap: ReturnType<typeof selectAttributeFilterDisplayFormsMap> = yield select(
        selectAttributeFilterDisplayFormsMap,
    );

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localId ${filterLocalId} was not found.`);
    }

    const validationResult: SagaReturnType<typeof validateAttributeFilterParents> = yield call(
        validateAttributeFilterParents,
        ctx,
        affectedFilter,
        [...parentFilters],
        allFilters,
        displayFormsMap,
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "EXTRANEOUS_PARENT"
                ? "Some of the parents provided cannot be used because filters for those are not in the filters collection. " +
                  "Only existing filters can be used as parent filters."
                : validationResult === "INVALID_METADATA"
                  ? "Some of the parents provided cannot be used because the 'metadata' for parent filter are missing."
                  : "Some of the parents provided cannot be used because the 'over' parameter is invalid for the target filter.";

        throw invalidArgumentsProvided(ctx, cmd, message);
    }

    yield put(
        filterContextActions.setAttributeFilterParents({
            filterLocalId,
            parentFilters,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(changedFilter, "Inconsistent state in attributeFilterSetParentCommandHandler");

    yield dispatchDashboardEvent(attributeFilterParentChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
