// (C) 2021-2022 GoodData Corporation
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";
import { IDashboardAttributeFilter, ObjRef, objRefToString } from "@gooddata/sdk-model";

import { AddAttributeFilter } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterAdded } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import {
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilters,
} from "../../../store/filterContext/filterContextSelectors";

import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { PromiseFnReturnType, PromiseReturnType } from "../../../types/sagas";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver";
import isEmpty from "lodash/isEmpty";
import { batchActions } from "redux-batched-actions";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function* addAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: AddAttributeFilter,
): SagaIterator<void> {
    const { displayForm, index, initialIsNegativeSelection, initialSelection, parentFilters } = cmd.payload;

    const allFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

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
        yield select(selectFilterContextAttributeFilterByDisplayForm(displayFormMetadata.ref));

    invariant(addedFilter, "Inconsistent state in attributeFilterAddCommandHandler");

    yield dispatchDashboardEvent(
        attributeFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}

export function* getConnectingAttributes(
    ctx: DashboardContext,
    addedFilterAttribute: ObjRef,
    neighborFilter: IDashboardAttributeFilter,
) {
    const { backend, workspace } = ctx;

    const displayFormsMap: ReturnType<typeof selectAttributeFilterDisplayFormsMap> = yield select(
        selectAttributeFilterDisplayFormsMap,
    );
    const neighborFilterAttribute = displayFormsMap.get(
        neighborFilter.attributeFilter.displayForm,
    )?.attribute;

    invariant(neighborFilterAttribute, "Inconsistent state in attributeFilterAddCommandHandler");

    const connectingAttributeRefs: PromiseReturnType<ReturnType<typeof getCommonAttributesRefs>> = yield call(
        getCommonAttributesRefs,
        ctx.backend,
        ctx.workspace,
        addedFilterAttribute,
        neighborFilterAttribute,
    );

    const connectingAttributesMeta: PromiseReturnType<ReturnType<typeof getConnectingAttributeByRef>>[] =
        yield all(
            connectingAttributeRefs.map((ref) => call(getConnectingAttributeByRef, backend, workspace, ref)),
        );

    const connectingAttributes = connectingAttributesMeta.map((meta) => {
        return {
            title: meta.title,
            ref: meta.ref,
        };
    });

    return {
        filterLocalId: neighborFilter.attributeFilter.localIdentifier!,
        connectingAttributes: connectingAttributes,
    };
}

function getCommonAttributesRefs(
    backend: IAnalyticalBackend,
    workspace: string,
    addedFilterAttribute: ObjRef,
    neighborFilterAttribute: ObjRef,
) {
    return backend
        .workspace(workspace)
        .attributes()
        .getCommonAttributes([addedFilterAttribute, neighborFilterAttribute]);
}

function getConnectingAttributeByRef(backend: IAnalyticalBackend, workspace: string, ref: ObjRef) {
    return backend.workspace(workspace).attributes().getAttribute(ref);
}
