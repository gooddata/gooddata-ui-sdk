// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    ChangeAttributeFilterSelection,
    AddAttributeFilter,
    RemoveAttributeFilters,
    MoveAttributeFilter,
    SetAttributeFilterParent,
} from "../../commands/filters";
import { commandRejected } from "../../events/general";
import { filterContextActions } from "../../state/filterContext";
import { selectFilterContextAttributeFilters } from "../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../types/commonTypes";
import { PromiseFnReturnType } from "../../types/sagas";
import { validateAttributeFilterParents } from "./parentFilterValidation";

export function* attributeFilterChangeSelectionCommandHandler(
    _ctx: DashboardContext,
    cmd: ChangeAttributeFilterSelection,
): SagaIterator<void> {
    const { elements, filterLocalId, selectionType } = cmd.payload;
    yield put(
        filterContextActions.updateAttributeFilterSelection({
            elements,
            filterLocalId,
            negativeSelection: selectionType === "NOT_IN",
        }),
    );
}

export function* attributeFilterAddCommandHandler(
    _ctx: DashboardContext,
    cmd: AddAttributeFilter,
): SagaIterator<void> {
    const { displayForm, index, initialIsNegativeSelection, initialSelection, parentFilters } = cmd.payload;

    // TODO: prevent adding filters for display forms already present. what about normalization of refs?

    yield put(
        filterContextActions.addAttributeFilter({
            displayForm,
            index,
            initialIsNegativeSelection,
            initialSelection,
            parentFilters,
        }),
    );
}

export function* attributeFilterRemoveCommandHandler(
    _ctx: DashboardContext,
    cmd: RemoveAttributeFilters,
): SagaIterator<void> {
    const { filterLocalIds } = cmd.payload;
    yield put(
        filterContextActions.removeAttributeFilters({
            filterLocalIds,
        }),
    );
}

export function* attributeFilterMoveCommandHandler(
    _ctx: DashboardContext,
    cmd: MoveAttributeFilter,
): SagaIterator<void> {
    const { filterLocalId, index } = cmd.payload;
    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );
}

export function* attributeFilterSetParentCommandHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterParent,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: IDashboardAttributeFilter[] = yield select(selectFilterContextAttributeFilters);

    const filter = allFilters.find(
        (item) => item.attributeFilter.localIdentifier === cmd.payload.filterLocalId,
    );

    if (!filter) {
        // TODO specialized action here?
        yield put(commandRejected(ctx, cmd.correlationId));
        return;
    }

    const validationResult: PromiseFnReturnType<typeof validateAttributeFilterParents> = yield call(
        validateAttributeFilterParents,
        ctx,
        filter,
        cmd.payload.parentFilters,
        allFilters,
    );

    if (validationResult !== "VALID") {
        // TODO specialized action here?
        yield put(commandRejected(ctx, cmd.correlationId));
        return;
    }

    yield put(
        filterContextActions.setAttributeFilterParent({
            filterLocalId,
            parentFilters,
        }),
    );
}
