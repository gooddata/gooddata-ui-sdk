// (C) 2021 GoodData Corporation
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { IDashboardAttributeFilter } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import {
    ChangeAttributeFilterSelection,
    AddAttributeFilter,
    RemoveAttributeFilters,
    MoveAttributeFilter,
    SetAttributeFilterParent,
} from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import {
    attributeFilterAdded,
    attributeFilterMoved,
    attributeFilterParentChanged,
    attributeFilterRemoved,
    attributeFilterSelectionChanged,
} from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import { selectFilterContextAttributeFilters } from "../../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { validateAttributeFilterParents } from "./parentFilterValidation";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { putCurrentFilterContextChanged } from "../common";
import partition from "lodash/partition";

function* getAttributeFilterById(filterLocalId: string): SagaIterator<IDashboardAttributeFilter | undefined> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.find((filter) => filter.attributeFilter.localIdentifier === filterLocalId);
}

function* getAttributeFilterIndexById(filterLocalId: string): SagaIterator<number> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === filterLocalId);
}

function* getAttributeFilterByDisplayForm(
    displayForm: ObjRef,
): SagaIterator<IDashboardAttributeFilter | undefined> {
    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    return allFilters.find((filter) => areObjRefsEqual(filter.attributeFilter.displayForm, displayForm));
}

export function* attributeFilterChangeSelectionCommandHandler(
    ctx: DashboardContext,
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

    const affectedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterById,
        cmd.payload.filterLocalId,
    );

    invariant(affectedFilter, "Inconsistent state in attributeFilterChangeSelectionCommandHandler");

    yield put(attributeFilterSelectionChanged(ctx, affectedFilter, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}

export function* attributeFilterAddCommandHandler(
    ctx: DashboardContext,
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

    const affectedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterByDisplayForm,
        cmd.payload.displayForm,
    );

    invariant(affectedFilter, "Inconsistent state in attributeFilterAddCommandHandler");

    yield put(attributeFilterAdded(ctx, affectedFilter, cmd.payload.index, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}

export function* attributeFilterRemoveCommandHandler(
    ctx: DashboardContext,
    cmd: RemoveAttributeFilters,
): SagaIterator<void> {
    const { filterLocalIds } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const [removedFilters, survivingFilters] = partition(allFilters, (item) =>
        filterLocalIds.includes(item.attributeFilter.localIdentifier!),
    );

    for (const removedFilter of removedFilters) {
        // remove filter from parents and keep track of the affected filters
        const affectedChildren = survivingFilters.filter((item) =>
            item.attributeFilter.filterElementsBy?.some((parent) =>
                filterLocalIds.includes(parent.filterLocalIdentifier),
            ),
        );

        yield all(
            affectedChildren.map(({ attributeFilter }) =>
                put(
                    filterContextActions.setAttributeFilterParents({
                        filterLocalId: attributeFilter.localIdentifier!,
                        parentFilters: attributeFilter.filterElementsBy!.filter(
                            (parent) =>
                                parent.filterLocalIdentifier !==
                                removedFilter?.attributeFilter.localIdentifier,
                        ),
                    }),
                ),
            ),
        );

        // remove filter itself
        yield put(
            filterContextActions.removeAttributeFilter({
                filterLocalId: removedFilter.attributeFilter.localIdentifier!,
            }),
        );

        // emit event
        yield put(attributeFilterRemoved(ctx, removedFilter!, affectedChildren, cmd.correlationId));
    }

    yield call(putCurrentFilterContextChanged, ctx, cmd);
}

export function* attributeFilterMoveCommandHandler(
    ctx: DashboardContext,
    cmd: MoveAttributeFilter,
): SagaIterator<void> {
    const { filterLocalId, index } = cmd.payload;
    const originalIndex: SagaReturnType<typeof getAttributeFilterIndexById> = yield call(
        getAttributeFilterIndexById,
        filterLocalId,
    );

    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );

    const finalIndex: SagaReturnType<typeof getAttributeFilterIndexById> = yield call(
        getAttributeFilterIndexById,
        filterLocalId,
    );

    const affectedFilter: SagaReturnType<typeof getAttributeFilterById> = yield call(
        getAttributeFilterById,
        filterLocalId,
    );

    invariant(affectedFilter, "Inconsistent state in attributeFilterMoveCommandHandler");

    yield put(attributeFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId));
    yield call(putCurrentFilterContextChanged, ctx, cmd);
}

export function* attributeFilterSetParentsCommandHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterParent,
): SagaIterator<void> {
    const { filterLocalId, parentFilters } = cmd.payload;

    const allFilters: IDashboardAttributeFilter[] = yield select(selectFilterContextAttributeFilters);

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
