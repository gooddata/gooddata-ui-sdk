// (C) 2021-2025 GoodData Corporation

import { AnyAction } from "@reduxjs/toolkit";
import { compact, partition, uniqBy } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, all, call, put, select } from "redux-saga/effects";

import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilter,
    ObjRef,
    areObjRefsEqual,
    attributeElementsIsEmpty,
    getAttributeElementsItems,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isSingleSelectionFilter,
    isUriRef,
    objRefToString,
    serializeObjRef,
    updateAttributeElementsItems,
} from "@gooddata/sdk-model";

import { canApplyDateFilter, dispatchFilterContextChanged, resetCrossFiltering } from "./common.js";
import { dashboardFilterToFilterContextItem } from "../../../_staging/dashboard/dashboardFilterContext.js";
import { ChangeFilterContextSelection } from "../../commands/index.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { attributeFilterConfigsActions } from "../../store/attributeFilterConfigs/index.js";
import { selectIsCrossFiltering } from "../../store/drill/drillSelectors.js";
import {
    IUpdateAttributeFilterSelectionPayload,
    IUpsertDateFilterPayload,
} from "../../store/filterContext/filterContextReducers.js";
import {
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDateFiltersWithDimension,
} from "../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { resolveAttributeMetadata } from "../../utils/attributeResolver.js";
import { DisplayFormResolutionResult, resolveDisplayFormMetadata } from "../../utils/displayFormResolver.js";

export function* changeFilterContextSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeFilterContextSelection,
): SagaIterator<void> {
    const { filters, resetOthers, attributeFilterConfigs = [] } = cmd.payload;

    const isCrossFiltering = yield select(selectIsCrossFiltering);
    if (isCrossFiltering) {
        yield call(resetCrossFiltering, cmd);
    }

    const normalizedFilters: FilterContextItem[] = filters.map((filter) => {
        if (isDashboardAttributeFilter(filter) || isDashboardDateFilter(filter)) {
            return filter;
        } else {
            return dashboardFilterToFilterContextItem(
                filter,
                !!ctx.backend.capabilities.supportsMultipleDateFilters,
            );
        }
    });

    const uniqueFilters = uniqBy(normalizedFilters, (filter) => {
        const identification = isDashboardAttributeFilter(filter)
            ? filter.attributeFilter.displayForm
            : filter.dateFilter.dataSet;
        let config;
        if (isDashboardAttributeFilter(filter)) {
            config = attributeFilterConfigs.find(
                (config) => config.localIdentifier === filter.attributeFilter.localIdentifier,
            );
        }
        // do not remove duplicates using same primary label, but different display as label
        const secondaryIdentification = config?.displayAsLabel ? objRefToString(config.displayAsLabel) : "";
        return identification
            ? objRefToString(identification) + secondaryIdentification
            : identification + secondaryIdentification;
    });

    const [dateFilters, attributeFilters] = partition(uniqueFilters, isDashboardDateFilter);

    const [[commonDateFilter], dateFiltersWithDimension] = partition(
        dateFilters,
        isDashboardCommonDateFilter,
    );

    const [
        attributeFilterUpdateActions,
        commonDateFilterUpdateActions,
        dateFiltersUpdateActions,
    ]: AnyAction[][] = yield all([
        call(
            getAttributeFiltersUpdateActions,
            [...attributeFilters].reverse(),
            attributeFilterConfigs,
            resetOthers,
            ctx,
        ),
        call(getDateFilterUpdateActions, commonDateFilter, resetOthers),
        call(getDateFiltersUpdateActions, dateFiltersWithDimension, resetOthers),
    ]);

    yield put(
        batchActions([
            ...attributeFilterUpdateActions,
            ...commonDateFilterUpdateActions,
            ...dateFiltersUpdateActions,
        ]),
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function* getDashboardFilterByAttributeMatching(
    filterRef: ObjRef,
    resolvedDisplayForms: DisplayFormResolutionResult,
    ctx: DashboardContext,
) {
    if (isUriRef(filterRef) && !ctx.backend.capabilities.supportsObjectUris) {
        throw new NotSupported("Unsupported filter ObjRef! Please provide IdentifierRef instead of UriRef.");
    }

    const filterDF = resolvedDisplayForms.resolved.get(filterRef);
    const resolvedAttribute: SagaReturnType<typeof resolveAttributeMetadata> = yield call(
        resolveAttributeMetadata,
        ctx,
        compact([filterDF?.attribute]),
    );
    const attribute = filterDF?.attribute && resolvedAttribute.resolved.get(filterDF?.attribute);

    for (const displayForm of attribute?.displayForms ?? []) {
        const dashboardFilter: ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm> =
            yield select(selectFilterContextAttributeFilterByDisplayForm(displayForm.ref));
        if (dashboardFilter) {
            return dashboardFilter;
        }
    }
    return null;
}

function* getDashboardFilterByDisplayAsLabelMatching(
    attributeFilter: IDashboardAttributeFilter,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
) {
    let foundByDisplayAsLabel = false;
    let foundByDashboardFilterDisplayAsLabel = false;
    let dashboardFilter: IDashboardAttributeFilter | undefined = undefined;

    const filterRef = attributeFilter.attributeFilter.displayForm;

    const filterConfig = attributeFilterConfigs.find(
        (config) => config.localIdentifier === attributeFilter.attributeFilter.localIdentifier,
    );
    if (filterConfig?.displayAsLabel) {
        dashboardFilter = yield select(
            selectFilterContextAttributeFilterByDisplayForm(filterConfig.displayAsLabel),
        );
        foundByDisplayAsLabel = !!dashboardFilter;
    }
    if (!foundByDisplayAsLabel) {
        const dashboardFiltersConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> =
            yield select(selectAttributeFilterConfigsOverrides);
        const matchingDashboardFilterConfig = dashboardFiltersConfigs.find((config) =>
            areObjRefsEqual(config.displayAsLabel, filterRef),
        );
        if (matchingDashboardFilterConfig) {
            dashboardFilter = yield select(
                selectFilterContextAttributeFilterByLocalId(matchingDashboardFilterConfig?.localIdentifier),
            );
            foundByDashboardFilterDisplayAsLabel = !!dashboardFilter;
        }
    }
    return { foundByDisplayAsLabel, foundByDashboardFilterDisplayAsLabel, dashboardFilter };
}

function* getAttributeFiltersUpdateActions(
    attributeFilters: IDashboardAttributeFilter[],
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    resetOthers: boolean,
    ctx: DashboardContext,
): SagaIterator<AnyAction[]> {
    const updateActions: AnyAction[] = [];
    const handledLocalIds = new Set<string>();
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        attributeFilters.map((af) => af.attributeFilter.displayForm),
    );

    for (const attributeFilter of attributeFilters) {
        const filterRef = attributeFilter.attributeFilter.displayForm;
        let dashboardFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>> =
            yield select(selectFilterContextAttributeFilterByDisplayForm(filterRef));

        if (!dashboardFilter && canMapDashboardFilterFromAnotherDisplayForm(ctx)) {
            dashboardFilter = yield call(
                getDashboardFilterByAttributeMatching,
                filterRef,
                resolvedDisplayForms,
                ctx,
            );
        }

        let foundByDisplayAsLabel = false;
        let foundByDashboardFilterDisplayAsLabel = false;

        if (!dashboardFilter) {
            const result = yield call(
                getDashboardFilterByDisplayAsLabelMatching,
                attributeFilter,
                attributeFilterConfigs,
            );
            foundByDisplayAsLabel = result.foundByDisplayAsLabel;
            foundByDashboardFilterDisplayAsLabel = result.foundByDashboardFilterDisplayAsLabel;
            dashboardFilter = result.dashboardFilter;
        }

        const displayFormData = resolvedDisplayForms.resolved.get(filterRef);

        if (dashboardFilter) {
            if (foundByDisplayAsLabel && displayFormData) {
                updateActions.push(
                    // keep the attribute display form field up to date
                    filterContextActions.addAttributeFilterDisplayForm(displayFormData),
                    filterContextActions.changeAttributeDisplayForm({
                        filterLocalId: dashboardFilter.attributeFilter.localIdentifier!,
                        displayForm: filterRef,
                    }),
                    // backup current displayForm to the displayAsLabel
                    attributeFilterConfigsActions.changeDisplayAsLabel({
                        localIdentifier: dashboardFilter.attributeFilter.localIdentifier!,
                        displayAsLabel: dashboardFilter.attributeFilter.displayForm,
                    }),
                );
            }
            if (foundByDashboardFilterDisplayAsLabel && displayFormData) {
                updateActions.push(
                    // keep the attribute display form field up to date
                    filterContextActions.addAttributeFilterDisplayForm(displayFormData),
                    filterContextActions.changeAttributeDisplayForm({
                        filterLocalId: dashboardFilter.attributeFilter.localIdentifier!,
                        displayForm: filterRef,
                    }),
                    // clear displayAsLabel
                    attributeFilterConfigsActions.changeDisplayAsLabel({
                        localIdentifier: dashboardFilter.attributeFilter.localIdentifier!,
                        displayAsLabel: undefined,
                    }),
                );
            }
            updateActions.push(
                filterContextActions.updateAttributeFilterSelection(
                    getAttributeFilterSelectionPayload(attributeFilter, dashboardFilter),
                ),
            );

            handledLocalIds.add(dashboardFilter.attributeFilter.localIdentifier!);
        }
    }

    if (resetOthers) {
        const currentAttributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
            selectFilterContextAttributeFilters,
        );

        // for filters that have not been handled by the loop above, create a clear selection actions
        const unhandledFilters = currentAttributeFilters.filter(
            (filter) => !handledLocalIds.has(filter.attributeFilter.localIdentifier!),
        );
        if (unhandledFilters.length > 0) {
            updateActions.push(
                filterContextActions.clearAttributeFiltersSelection({
                    filterLocalIds: unhandledFilters.map((filter) => filter.attributeFilter.localIdentifier!),
                }),
            );
        }
    }

    return updateActions;
}

function* getDateFilterUpdateActions(
    dateFilter: IDashboardDateFilter | undefined,
    resetOthers: boolean,
): SagaIterator<AnyAction[]> {
    if (dateFilter) {
        const canApply: SagaReturnType<typeof canApplyDateFilter> = yield call(
            canApplyDateFilter,
            dateFilter,
        );
        if (!canApply) {
            return [];
        }

        const localIdentifierObj = dateFilter.dateFilter.localIdentifier
            ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
            : {};
        const upsertPayload: IUpsertDateFilterPayload = isAllTimeDashboardDateFilter(dateFilter)
            ? {
                  type: "allTime",
                  dataSet: dateFilter.dateFilter.dataSet,
                  ...localIdentifierObj,
              }
            : {
                  type: dateFilter.dateFilter.type,
                  granularity: dateFilter.dateFilter.granularity,
                  from: dateFilter.dateFilter.from,
                  to: dateFilter.dateFilter.to,
                  dataSet: dateFilter.dateFilter.dataSet,
                  ...localIdentifierObj,
                  ...(dateFilter.dateFilter.boundedFilter
                      ? { boundedFilter: dateFilter.dateFilter.boundedFilter }
                      : {}),
              };

        return [filterContextActions.upsertDateFilter(upsertPayload)];
    } else if (resetOthers) {
        return [filterContextActions.upsertDateFilter({ type: "allTime" })];
    }

    return [];
}

function* getDateFiltersUpdateActions(
    dateFilters: IDashboardDateFilter[],
    resetOthers: boolean,
): SagaIterator<AnyAction[]> {
    const updateActions: AnyAction[] = [];
    const handledDataSets = new Set<string>();

    for (const dateFilter of dateFilters) {
        const filterRef = dateFilter.dateFilter.dataSet!;
        const dashboardFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
            yield select(selectFilterContextDateFilterByDataSet(filterRef));

        if (dashboardFilter) {
            const localIdentifierObj = dateFilter.dateFilter.localIdentifier
                ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
                : {};
            handledDataSets.add(serializeObjRef(dashboardFilter.dateFilter.dataSet!));
            const upsertPayload: IUpsertDateFilterPayload = isAllTimeDashboardDateFilter(dateFilter)
                ? {
                      type: "allTime",
                      dataSet: dateFilter.dateFilter.dataSet,
                      ...localIdentifierObj,
                  }
                : {
                      type: dateFilter.dateFilter.type,
                      granularity: dateFilter.dateFilter.granularity,
                      from: dateFilter.dateFilter.from,
                      to: dateFilter.dateFilter.to,
                      dataSet: dateFilter.dateFilter.dataSet,
                      ...localIdentifierObj,
                      ...(dateFilter.dateFilter.boundedFilter
                          ? { boundedFilter: dateFilter.dateFilter.boundedFilter }
                          : {}),
                  };

            updateActions.push(filterContextActions.upsertDateFilter(upsertPayload));
        }
    }

    if (resetOthers) {
        const currentDateFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> =
            yield select(selectFilterContextDateFiltersWithDimension);

        // for filters that have not been handled by the loop above, create a clear selection actions
        const unhandledFilters = currentDateFilters.filter(
            (filter) => !handledDataSets.has(serializeObjRef(filter.dateFilter.dataSet!)),
        );
        if (unhandledFilters.length > 0) {
            for (const dateFilter of unhandledFilters) {
                const localIdentifierObj = dateFilter.dateFilter.localIdentifier
                    ? { localIdentifier: dateFilter.dateFilter.localIdentifier }
                    : {};
                updateActions.push(
                    filterContextActions.upsertDateFilter({
                        type: "allTime",
                        dataSet: dateFilter.dateFilter.dataSet,
                        ...localIdentifierObj,
                    }),
                );
            }
        }
    }

    return updateActions;
}

const getAttributeFilterSelectionPayload = (
    incomingFilter: IDashboardAttributeFilter,
    currentFilter: IDashboardAttributeFilter,
): IUpdateAttributeFilterSelectionPayload => {
    const { attributeElements, negativeSelection } = incomingFilter.attributeFilter;

    const attributeFilterSelectionPayload: IUpdateAttributeFilterSelectionPayload = {
        elements: attributeElements,
        filterLocalId: currentFilter.attributeFilter.localIdentifier!,
        negativeSelection: negativeSelection,
    };

    if (isSingleSelectionFilter(currentFilter)) {
        if (negativeSelection) {
            return {
                ...attributeFilterSelectionPayload,
                elements: updateAttributeElementsItems(attributeElements, []),
                negativeSelection: false,
            };
        }

        if (!attributeElementsIsEmpty(attributeElements)) {
            const attributeElementsValues = getAttributeElementsItems(attributeElements);
            const singleSelectAttributeElements = [attributeElementsValues[0]];

            return {
                ...attributeFilterSelectionPayload,
                elements: updateAttributeElementsItems(attributeElements, singleSelectAttributeElements),
            };
        }
    }

    return attributeFilterSelectionPayload;
};

/**
 *  For Bear:
 *  Attribute element in Bear can be matched because Bear utilizes a unique URI to identify each attribute element.
 *  This URI remains constant regardless of the attribute label (the URI points to the attribute URI rather than the label URI).
 *  In Bear, there are duplicate values, and each label contains the same number of element values.
 *  As a result, we can easily map one value from one label to another, and enabling us to determine the customer's intended selection
 *
 *  For Tiger/Panther:
 *  Attribute elements in Tiger/Panther are referenced solely by the values that the user sees. There is no URI like in Bear.
 *  Only the display value is available in Tiger/Panther. Additionally, Tiger only displays unique values for each label.
 *  In Tiger/Panther, you may observe a varying number of element values in the labels if duplicates are present.
 *  Therefore, mapping one value from one label to another is not straightforward, as it can be mapped to multiple values,
 *  and it is not always possible to ascertain the customer's intended selection.
 */
function canMapDashboardFilterFromAnotherDisplayForm(ctx: DashboardContext) {
    return ctx.backend.capabilities.supportsElementUris;
}
