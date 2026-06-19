// (C) 2021-2026 GoodData Corporation

import { difference, partition } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { areObjRefsEqual, isUriRef, serializeObjRef } from "@gooddata/sdk-model";

import { type IRemoveDateFilters } from "../../../commands/filters.js";
import { dateFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimension,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeDateFiltersHandler(
    ctx: DashboardContext,
    cmd: IRemoveDateFilters,
): SagaIterator<void> {
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
        const dataSetRef = removedFilter.dateFilter.dataSet;
        // dateFilter.localIdentifier is the new format stored by useDependentDateFilterConfigurationState;
        // dataSetRef?.identifier (dataset identifier) is the legacy format. Both must be matched here
        // so that cleanup works regardless of which format a dependent reference was saved in.
        const filterLocalIdentifier = removedFilter.dateFilter.localIdentifier;

        invariant(!isUriRef(dataSetRef));
        const affectedDependentFilters = allAttributeFilters.filter((item) => {
            return item.attributeFilter.filterElementsByDate?.some((depdendentDateFilter) => {
                return (
                    // Guard the new-format clause: only compare against filterLocalIdentifier when it is
                    // defined. An undefined filterLocalIdentifier (date filters without a localIdentifier
                    // field, e.g. created by older backend versions) would otherwise match any entry whose
                    // filterLocalIdentifier is also undefined, incorrectly tagging unrelated filters.
                    ((filterLocalIdentifier !== undefined &&
                        depdendentDateFilter.filterLocalIdentifier === filterLocalIdentifier) ||
                        depdendentDateFilter.filterLocalIdentifier === dataSetRef?.identifier) &&
                    !depdendentDateFilter.isCommonDate
                );
            });
        });

        const batch = batchActions([
            // remove filter from parents and keep track of the affected filters
            ...affectedDependentFilters.map(({ attributeFilter }) =>
                tabsActions.setAttributeFilterDependentDateFilters({
                    filterLocalId: attributeFilter.localIdentifier!,
                    dependentDateFilters: attributeFilter.filterElementsByDate!.filter(
                        // Remove entries in both new (localIdentifier) and legacy (dataset identifier)
                        // formats. Guard the new-format clause symmetrically with detection above: when
                        // filterLocalIdentifier is undefined the clause would be !== undefined (always
                        // true), so skip it and rely solely on the legacy dataset-identifier check.
                        (parent) =>
                            (filterLocalIdentifier === undefined ||
                                parent.filterLocalIdentifier !== filterLocalIdentifier) &&
                            parent.filterLocalIdentifier !== dataSetRef?.identifier,
                    ),
                }),
            ),
            // remove filter itself
            tabsActions.removeDateFilter({
                dataSet: removedFilter.dateFilter.dataSet!,
            }),

            // remove reflect dashboard date filter config
            tabsActions.removeDateFilterConfigs(removedFilter.dateFilter.dataSet!),
            // house-keeping: ensure the removed date filter disappears from widget ignore lists
            tabsActions.removeIgnoredDateFilter({
                dateDataSets: [removedFilter.dateFilter.dataSet!],
            }),
        ]);

        yield put(batch);

        yield dispatchDashboardEvent(dateFilterRemoved(ctx, removedFilter, cmd.correlationId));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
