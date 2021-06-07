// (C) 2021 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";
import { objRefToString } from "@gooddata/sdk-model";

import { AddAttributeFilter } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterAdded } from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";

import { DashboardContext } from "../../../types/commonTypes";
import { putCurrentFilterContextChanged } from "../common";
import { getAttributeFilterByDisplayForm } from "./utils";
import { PromiseFnReturnType } from "../../../types/sagas";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation";

export function* addAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: AddAttributeFilter,
): SagaIterator<void> {
    const { displayForm, index, initialIsNegativeSelection, initialSelection, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const canBeAdded: PromiseFnReturnType<typeof canFilterBeAdded> = yield call(
        canFilterBeAdded,
        ctx,
        displayForm,
        allFilters,
    );

    if (!canBeAdded) {
        return yield put(
            invalidArgumentsProvided(
                ctx,
                `Filter for the displayForm ${objRefToString(
                    displayForm,
                )} already exists in the filter context.`,
                cmd.correlationId,
            ),
        );
    }

    yield put(
        filterContextActions.addAttributeFilter({
            displayForm,
            index,
            initialIsNegativeSelection,
            initialSelection,
            parentFilters,
        }),
    );

    const addedFilter: SagaReturnType<typeof getAttributeFilterByDisplayForm> = yield call(
        getAttributeFilterByDisplayForm,
        cmd.payload.displayForm,
    );

    invariant(addedFilter, "Inconsistent state in attributeFilterAddCommandHandler");

    yield put(attributeFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}
