// (C) 2021-2023 GoodData Corporation
import { all, call, put, SagaReturnType, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeFilterContextSelection } from "../../commands/index.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import {
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilters,
} from "../../store/filterContext/filterContextSelectors.js";
import { batchActions } from "redux-batched-actions";
import { AnyAction } from "@reduxjs/toolkit";
import { canApplyDateFilter, dispatchFilterContextChanged } from "./common.js";
import partition from "lodash/partition.js";
import uniqBy from "lodash/uniqBy.js";
import compact from "lodash/compact.js";
import {
    objRefToString,
    isUriRef,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    updateAttributeElementsItems,
    getAttributeElementsItems,
    attributeElementsIsEmpty,
    isSingleSelectionFilter,
    FilterContextItem,
    DateFilterGranularity,
    isAttributeFilter,
    isNegativeAttributeFilter,
    filterObjRef,
    filterAttributeElements,
    isAbsoluteDateFilter,
    newAbsoluteDashboardDateFilter,
    isAllTimeDateFilter,
    newAllTimeDashboardDateFilter,
    isRelativeDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    IUpdateAttributeFilterSelectionPayload,
    IUpsertDateFilterPayload,
} from "../../store/filterContext/filterContextReducers.js";
import { resolveDisplayFormMetadata } from "../../utils/displayFormResolver.js";
import { resolveAttributeMetadata } from "../../utils/attributeResolver.js";
import { IDashboardFilter } from "../../../types.js";

function dashboardFilterToFilterContextItem(filter: IDashboardFilter): FilterContextItem {
    if (isAttributeFilter(filter)) {
        return {
            attributeFilter: {
                negativeSelection: isNegativeAttributeFilter(filter),
                displayForm: filterObjRef(filter),
                attributeElements: filterAttributeElements(filter),
                selectionMode: "multi",
            },
        };
    } else if (isAbsoluteDateFilter(filter)) {
        return newAbsoluteDashboardDateFilter(filter.absoluteDateFilter.from, filter.absoluteDateFilter.to);
    } else if (isAllTimeDateFilter(filter)) {
        return newAllTimeDashboardDateFilter();
    } else if (isRelativeDateFilter(filter)) {
        return newRelativeDashboardDateFilter(
            filter.relativeDateFilter.granularity as DateFilterGranularity,
            filter.relativeDateFilter.from,
            filter.relativeDateFilter.to,
        );
    }

    throw new NotSupported("Unsupported filter type! Please provide valid dashboard filter.");
}

export function* changeFilterContextSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeFilterContextSelection,
): SagaIterator<void> {
    const { filters, resetOthers } = cmd.payload;

    const normalizedFilters: FilterContextItem[] = filters.map((filter) => {
        if (isDashboardAttributeFilter(filter) || isDashboardDateFilter(filter)) {
            return filter;
        } else {
            return dashboardFilterToFilterContextItem(filter);
        }
    });

    const uniqueFilters = uniqBy(normalizedFilters, (filter) => {
        const identification = isDashboardAttributeFilter(filter)
            ? filter.attributeFilter.displayForm
            : filter.dateFilter.dataSet;
        return identification ? objRefToString(identification) : identification;
    });

    const [[dateFilter], attributeFilters] = partition(uniqueFilters, isDashboardDateFilter);

    const [attributeFilterUpdateActions, dateFilterUpdateActions]: AnyAction[][] = yield all([
        call(getAttributeFiltersUpdateActions, attributeFilters, resetOthers, ctx),
        call(getDateFilterUpdateActions, dateFilter, resetOthers),
    ]);

    yield put(batchActions([...attributeFilterUpdateActions, ...dateFilterUpdateActions]));

    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function* getAttributeFiltersUpdateActions(
    attributeFilters: IDashboardAttributeFilter[],
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

        if (!dashboardFilter) {
            if (isUriRef(filterRef) && !ctx.backend.capabilities.supportsObjectUris) {
                throw new NotSupported(
                    "Unsupported filter ObjRef! Please provide IdentifierRef instead of UriRef.",
                );
            }

            const filterDF = resolvedDisplayForms.resolved.get(filterRef);
            const resolvedAttribute: SagaReturnType<typeof resolveAttributeMetadata> = yield call(
                resolveAttributeMetadata,
                ctx,
                compact([filterDF?.attribute]),
            );
            const attribute = filterDF?.attribute && resolvedAttribute.resolved.get(filterDF?.attribute);

            for (const displayForm of attribute?.displayForms ?? []) {
                dashboardFilter = yield select(
                    selectFilterContextAttributeFilterByDisplayForm(displayForm.ref),
                );
                if (dashboardFilter) {
                    break;
                }
            }
        }

        if (dashboardFilter) {
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

        const upsertPayload: IUpsertDateFilterPayload = isAllTimeDashboardDateFilter(dateFilter)
            ? { type: "allTime" }
            : {
                  type: dateFilter.dateFilter.type,
                  granularity: dateFilter.dateFilter.granularity,
                  from: dateFilter.dateFilter.from,
                  to: dateFilter.dateFilter.to,
              };

        return [filterContextActions.upsertDateFilter(upsertPayload)];
    } else if (resetOthers) {
        return [filterContextActions.upsertDateFilter({ type: "allTime" })];
    }

    return [];
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
