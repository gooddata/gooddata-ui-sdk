// (C) 2021-2023 GoodData Corporation
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";
import { IDashboardAttributeFilter, ObjRef, objRefToString } from "@gooddata/sdk-model";

import { AddAttributeFilter } from "../../../commands/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { attributeFilterAdded } from "../../../events/filters.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectCanAddMoreAttributeFilters,
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilters,
} from "../../../store/filterContext/filterContextSelectors.js";

import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";
import { PromiseFnReturnType, PromiseReturnType } from "../../../types/sagas.js";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver.js";
import isEmpty from "lodash/isEmpty.js";
import { batchActions } from "redux-batched-actions";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function* addAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: AddAttributeFilter,
): SagaIterator<void> {
    const { displayForm, index, initialIsNegativeSelection, initialSelection, parentFilters, selectionMode } =
        cmd.payload;

    const isUnderFilterCountLimit: ReturnType<typeof selectCanAddMoreAttributeFilters> = yield select(
        selectCanAddMoreAttributeFilters,
    );

    if (!isUnderFilterCountLimit) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter, even though the limit on the count of filters has been reached.`,
        );
    }

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

    const displayFormMetadata = resolvedDisplayForm.resolved.get(displayForm);

    invariant(displayFormMetadata);

    const attributeRef = displayFormMetadata.attribute;

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
            `Filter for attribute ${objRefToString(
                attributeRef,
            )} represented by the displayForm ${objRefToString(
                displayForm,
            )} already exists in the filter context.`,
        );
    }

    yield put(
        batchActions([
            filterContextActions.addAttributeFilter({
                displayForm: displayFormMetadata.ref,
                index,
                initialIsNegativeSelection,
                initialSelection,
                parentFilters,
                selectionMode,
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
