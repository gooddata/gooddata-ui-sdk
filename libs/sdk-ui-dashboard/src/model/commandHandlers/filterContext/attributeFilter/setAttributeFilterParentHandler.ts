// (C) 2021 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { SetAttributeFilterParent } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterParentChanged } from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import {
    makeSelectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilters,
} from "../../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { validateAttributeFilterParents } from "./validation/parentFiltersValidation";
import { dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../state/_infra/eventDispatcher";

export function* setAttributeFilterParentHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterParent,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const selectFilterByLocalId = makeSelectFilterContextAttributeFilterByLocalId();

    const affectedFilter: ReturnType<typeof selectFilterByLocalId> = yield select(
        selectFilterByLocalId,
        filterLocalId,
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
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "EXTRANEOUS_PARENT"
                ? "Some of the parents provided cannot be used because filters for those are not in the filters collection. " +
                  "Only existing filters can be used as parent filters."
                : "Some of the parents provided cannot be used because the 'over' parameter is invalid for the target filter.";

        throw invalidArgumentsProvided(ctx, cmd, message);
    }

    yield put(
        filterContextActions.setAttributeFilterParents({
            filterLocalId,
            parentFilters,
        }),
    );

    const changedFilter: ReturnType<typeof selectFilterByLocalId> = yield select(
        selectFilterByLocalId,
        filterLocalId,
    );

    invariant(changedFilter, "Inconsistent state in attributeFilterSetParentCommandHandler");

    yield dispatchDashboardEvent(attributeFilterParentChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
