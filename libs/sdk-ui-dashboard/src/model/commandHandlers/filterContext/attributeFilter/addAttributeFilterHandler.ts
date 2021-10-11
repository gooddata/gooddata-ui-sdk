// (C) 2021 GoodData Corporation
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";
import { objRefToString } from "@gooddata/sdk-model";

import { AddAttributeFilter } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterAdded } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import {
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilters,
} from "../../../store/filterContext/filterContextSelectors";

import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { PromiseFnReturnType } from "../../../types/sagas";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver";
import isEmpty from "lodash/isEmpty";
import { batchActions } from "redux-batched-actions";

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
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Filter for the displayForm ${objRefToString(displayForm)} already exists in the filter context.`,
        );
    }

    const resolvedDisplayForm: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        [displayForm],
    );

    if (!isEmpty(resolvedDisplayForm.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter for a non-existing display form ${objRefToString(displayForm)}.`,
        );
    }

    const displayFormMetadata = resolvedDisplayForm.resolved.get(displayForm);
    invariant(displayFormMetadata);

    yield put(
        batchActions([
            filterContextActions.addAttributeFilter({
                displayForm: displayFormMetadata.ref,
                index,
                initialIsNegativeSelection,
                initialSelection,
                parentFilters,
            }),
            filterContextActions.addAttributeFilterDisplayForm(displayFormMetadata),
        ]),
    );

    const addedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>> =
        yield select(selectFilterContextAttributeFilterByDisplayForm(cmd.payload.displayForm));

    invariant(addedFilter, "Inconsistent state in attributeFilterAddCommandHandler");

    yield dispatchDashboardEvent(
        attributeFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
