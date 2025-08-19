// (C) 2021-2025 GoodData Corporation
import difference from "lodash/difference.js";
import partition from "lodash/partition.js";
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { areObjRefsEqual, isUriRef, serializeObjRef } from "@gooddata/sdk-model";

import { RemoveDateFilters } from "../../../commands/filters.js";
import { dateFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { dateFilterConfigsActions } from "../../../store/dateFilterConfigs/index.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimension,
} from "../../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { layoutActions } from "../../../store/layout/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeDateFiltersHandler(ctx: DashboardContext, cmd: RemoveDateFilters): SagaIterator<void> {
    const { dataSets } = cmd.payload;

    const allDateFiltersWithDimension: ReturnType<typeof selectFilterContextDateFiltersWithDimension> =
        yield select(selectFilterContextDateFiltersWithDimension);

    const allAttributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const [removedFilters, _survivingFilters] = partition(allDateFiltersWithDimension, (item) =>
        dataSets.some((ds) => areObjRefsEqual(ds, item.dateFilter.dataSet)),
    );

    const invalidDataSets = difference(
        dataSets.map(serializeObjRef),
        allDateFiltersWithDimension.map((filter) => serializeObjRef(filter.dateFilter.dataSet!)),
    );

    if (invalidDataSets.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid dataSet provided. These ids were not found: ${invalidDataSets.join(", ")}.`,
        );
    }

    for (const removedFilter of removedFilters) {
        const localIdentifier = removedFilter.dateFilter.dataSet;

        invariant(!isUriRef(localIdentifier));
        const affectedDependentFilters = allAttributeFilters.filter((item) => {
            return item.attributeFilter.filterElementsByDate?.some((depdendentDateFilter) => {
                return (
                    localIdentifier?.identifier === depdendentDateFilter.filterLocalIdentifier &&
                    !depdendentDateFilter.isCommonDate
                );
            });
        });

        const batch = batchActions([
            // remove filter from parents and keep track of the affected filters
            ...affectedDependentFilters.map(({ attributeFilter }) =>
                filterContextActions.setAttributeFilterDependentDateFilters({
                    filterLocalId: attributeFilter.localIdentifier!,
                    dependentDateFilters: attributeFilter.filterElementsByDate!.filter(
                        (parent) => parent.filterLocalIdentifier !== localIdentifier?.identifier,
                    ),
                }),
            ),
            // remove filter itself
            filterContextActions.removeDateFilter({
                dataSet: removedFilter.dateFilter.dataSet!,
            }),

            // remove reflect dashboard date filter config
            dateFilterConfigsActions.removeDateFilterConfig(removedFilter.dateFilter.dataSet!),
            // house-keeping: ensure the removed date filter disappears from widget ignore lists
            layoutActions.removeIgnoredDateFilter({
                dateDataSets: [removedFilter.dateFilter.dataSet!],
            }),
        ]);

        yield put(batch);

        yield dispatchDashboardEvent(dateFilterRemoved(ctx, removedFilter!, cmd.correlationId));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
