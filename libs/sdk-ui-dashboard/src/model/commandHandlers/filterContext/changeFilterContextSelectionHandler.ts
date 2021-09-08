// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeFilterContextSelection } from "../../commands";
import { filterContextActions } from "../../state/filterContext";
import {
    selectFilterContextAttributeFilterByDisplayForm,
    selectFilterContextAttributeFilters,
} from "../../state/filterContext/filterContextSelectors";
import { batchActions } from "redux-batched-actions";
import { AnyAction } from "@reduxjs/toolkit";
import { dispatchFilterContextChanged } from "./common";
import partition from "lodash/partition";
import { isAttributeFilter, objRefToString, filterObjRef } from "@gooddata/sdk-model";
import {
    filterAttributeElements,
    isNegativeAttributeFilter,
    isAbsoluteDateFilter,
} from "@gooddata/sdk-model";
import { isAllTimeDateFilter } from "@gooddata/sdk-model";
import { DateFilterGranularity } from "@gooddata/sdk-backend-spi";
import { IUpsertDateFilterPayload } from "../../state/filterContext/filterContextReducers";
import uniqBy from "lodash/uniqBy";
import flow from "lodash/flow";

export function* changeFilterContextSelectionHandler(
    ctx: DashboardContext,
    cmd: ChangeFilterContextSelection,
): SagaIterator<void> {
    const { filters, resetOthers } = cmd.payload;

    const uniqueFilters = uniqBy(filters, flow(filterObjRef, objRefToString));

    const [attributeFilters, [dateFilter]] = partition(uniqueFilters, isAttributeFilter);

    const updateActions: AnyAction[] = [];
    const handledLocalIds = new Set<string>();
    for (const attributeFilter of attributeFilters) {
        const filterRef = filterObjRef(attributeFilter);
        const dashboardFilter: ReturnType<
            ReturnType<typeof selectFilterContextAttributeFilterByDisplayForm>
        > = yield select(selectFilterContextAttributeFilterByDisplayForm(filterRef));

        if (dashboardFilter) {
            updateActions.push(
                filterContextActions.updateAttributeFilterSelection({
                    elements: filterAttributeElements(attributeFilter),
                    filterLocalId: dashboardFilter.attributeFilter.localIdentifier!,
                    negativeSelection: isNegativeAttributeFilter(attributeFilter),
                }),
            );
            handledLocalIds.add(dashboardFilter.attributeFilter.localIdentifier!);
        }
    }

    if (resetOthers) {
        const currentAttributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
            selectFilterContextAttributeFilters,
        );

        // for filters that have not been handled by the loop above, create a clear selection actions
        currentAttributeFilters
            .filter((filter) => !handledLocalIds.has(filter.attributeFilter.localIdentifier!))
            .forEach((filter) => {
                updateActions.push(
                    filterContextActions.clearAttributeFilterSelection({
                        filterLocalId: filter.attributeFilter.localIdentifier!,
                    }),
                );
            });
    }

    if (dateFilter) {
        let upsertPayload: IUpsertDateFilterPayload;
        if (isAllTimeDateFilter(dateFilter)) {
            upsertPayload = { type: "allTime" };
        } else if (isAbsoluteDateFilter(dateFilter)) {
            upsertPayload = {
                type: "absolute",
                granularity: "GDC.time.date",
                from: dateFilter.absoluteDateFilter.from,
                to: dateFilter.absoluteDateFilter.to,
            };
        } else {
            upsertPayload = {
                type: "relative",
                granularity: dateFilter.relativeDateFilter.granularity as DateFilterGranularity,
                from: dateFilter.relativeDateFilter.from,
                to: dateFilter.relativeDateFilter.to,
            };
        }
        updateActions.push(filterContextActions.upsertDateFilter(upsertPayload));
    } else {
        updateActions.push(filterContextActions.upsertDateFilter({ type: "allTime" }));
    }

    yield put(batchActions(updateActions));

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
