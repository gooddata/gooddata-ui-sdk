// (C) 2021 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { SetAttributeFilterParent } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterParentChanged } from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { validateAttributeFilterParents } from "./parentFilterValidation";
import { putCurrentFilterContextChanged } from "../common";
import { getAttributeFilterById } from "./utils";

export function* setAttributeFilterParentHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterParent,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const filter = allFilters.find(
        (item) => item.attributeFilter.localIdentifier === cmd.payload.filterLocalId,
    );

    if (!filter) {
        return yield put(
            invalidArgumentsProvided(
                ctx,
                `Filter with localId ${filterLocalId} was not found.`,
                cmd.correlationId,
            ),
        );
    }

    const validationResult: SagaReturnType<typeof validateAttributeFilterParents> = yield call(
        validateAttributeFilterParents,
        ctx,
        filter,
        cmd.payload.parentFilters,
        allFilters,
    );

    if (validationResult !== "VALID") {
        const message =
            validationResult === "EXTRANEOUS_PARENT"
                ? "Some of the parents provided cannot be used because filters for those are not in the filters collection. " +
                  "Only existing filters can be used as parent filters."
                : "Some of the parents provided cannot be used because the 'over' parameter is invalid for the target filter.";

        return yield put(invalidArgumentsProvided(ctx, message, cmd.correlationId));
    }

    yield put(
        filterContextActions.setAttributeFilterParents({
            filterLocalId,
            parentFilters,
        }),
    );

    const affectedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterById,
        filterLocalId,
    );

    invariant(affectedFilter, "Inconsistent state in attributeFilterSetParentCommandHandler");

    yield put(attributeFilterParentChanged(ctx, affectedFilter, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}
