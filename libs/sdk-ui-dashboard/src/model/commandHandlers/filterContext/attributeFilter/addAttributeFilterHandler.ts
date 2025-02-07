// (C) 2021-2025 GoodData Corporation
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";
import {
    IDashboardAttributeFilter,
    ObjRef,
    objRefToString,
    isInsightWidget,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { AddAttributeFilter } from "../../../commands/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { attributeFilterAdded } from "../../../events/filters.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectCanAddMoreFilters,
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilters,
} from "../../../store/filterContext/filterContextSelectors.js";
import { selectBackendCapabilities } from "../../../store/backendCapabilities/backendCapabilitiesSelectors.js";

import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";
import { PromiseFnReturnType, PromiseReturnType } from "../../../types/sagas.js";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { attributeFilterConfigsActions } from "../../../store/attributeFilterConfigs/index.js";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver.js";
import isEmpty from "lodash/isEmpty.js";
import { batchActions } from "redux-batched-actions";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../../store/drill/drillSelectors.js";
import { selectAllAnalyticalWidgets } from "../../../store/layout/layoutSelectors.js";
import { validateDrillToCustomUrlParams } from "../../common/validateDrillToCustomUrlParams.js";
import { selectEnableDuplicatedLabelValuesInAttributeFilter } from "../../../store/config/configSelectors.js";

export function* addAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: AddAttributeFilter,
    type: "normal" | "crossfilter" = "normal",
): SagaIterator<void> {
    const {
        displayForm,
        index,
        initialIsNegativeSelection,
        initialSelection,
        parentFilters,
        selectionMode,
        mode,
        localIdentifier,
        primaryDisplayForm,
        title,
    } = cmd.payload;

    const isUnderFilterCountLimit: ReturnType<typeof selectCanAddMoreFilters> = yield select(
        selectCanAddMoreFilters,
    );

    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);

    const usedDisplayForm =
        enableDuplicatedLabelValuesInAttributeFilter && primaryDisplayForm ? primaryDisplayForm : displayForm;
    const displayAsLabel =
        enableDuplicatedLabelValuesInAttributeFilter &&
        primaryDisplayForm &&
        !areObjRefsEqual(primaryDisplayForm, displayForm)
            ? displayForm
            : undefined;

    if (!isUnderFilterCountLimit && type !== "crossfilter") {
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
        [usedDisplayForm],
    );

    if (!isEmpty(resolvedDisplayForm.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter for a non-existing display form ${objRefToString(usedDisplayForm)}.`,
        );
    }

    const displayFormMetadata = resolvedDisplayForm.resolved.get(usedDisplayForm);

    invariant(displayFormMetadata);

    const attributeRef = displayFormMetadata.attribute;

    const canBeAdded: PromiseFnReturnType<typeof canFilterBeAdded> = yield call(
        canFilterBeAdded,
        ctx,
        usedDisplayForm,
        allFilters,
    );

    const crossFilteringFiltersLocalIdentifiers: ReturnType<
        typeof selectCrossFilteringFiltersLocalIdentifiers
    > = yield select(selectCrossFilteringFiltersLocalIdentifiers);
    const isVirtualFilter = crossFilteringFiltersLocalIdentifiers.includes(localIdentifier!);

    if (!isVirtualFilter && !canBeAdded) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Filter for attribute ${objRefToString(
                attributeRef,
            )} represented by the displayForm ${objRefToString(
                usedDisplayForm,
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
                localIdentifier,
                title,
            }),
            filterContextActions.addAttributeFilterDisplayForm(displayFormMetadata),
        ]),
    );

    const addedFilterByLocalId: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(localIdentifier!));

    const addedFilterByDisplayForm: ReturnType<
        ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>
    > = yield select(selectFilterContextAttributeFilterByDisplayForm(displayFormMetadata.ref));

    const addedFilter = addedFilterByLocalId ?? addedFilterByDisplayForm;

    invariant(addedFilter, "Inconsistent state in attributeFilterAddCommandHandler");

    const capabilities: ReturnType<typeof selectBackendCapabilities> = yield select(
        selectBackendCapabilities,
    );
    const attributeFilterConfigActions = [];
    if (capabilities.supportsHiddenAndLockedFiltersOnUI && mode) {
        attributeFilterConfigActions.push(
            attributeFilterConfigsActions.changeMode({
                localIdentifier: addedFilter.attributeFilter.localIdentifier!,
                mode,
            }),
        );
    }
    if (enableDuplicatedLabelValuesInAttributeFilter && displayAsLabel) {
        attributeFilterConfigActions.push(
            attributeFilterConfigsActions.changeDisplayAsLabel({
                localIdentifier: addedFilter.attributeFilter.localIdentifier!,
                displayAsLabel,
            }),
        );
    }
    if (attributeFilterConfigActions.length > 0) {
        yield put(batchActions(attributeFilterConfigActions));
    }

    yield dispatchDashboardEvent(
        attributeFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
    const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(selectAllAnalyticalWidgets);
    yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
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
