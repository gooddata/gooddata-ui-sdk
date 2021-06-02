// (C) 2021 GoodData Corporation
import { put } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import {
    ChangeAttributeFilterSelection,
    AddAttributeFilter,
    RemoveAttributeFilters,
    MoveAttributeFilter,
} from "../../commands/filters";
import { filterContextActions } from "../../state/filterContext";
import { DashboardContext } from "../../types/commonTypes";

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

export function* attributeFilterMoveCommandHandler(_ctx: DashboardContext, cmd: MoveAttributeFilter) {
    const { filterLocalId, index } = cmd.payload;
    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );
}
