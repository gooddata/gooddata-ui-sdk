// (C) 2021-2026 GoodData Corporation

import { difference } from "lodash-es";
import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    areObjRefsEqual,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
    isDashboardDateFilter,
    isUriRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { _partition } from "@gooddata/util";

import { type IRemoveDateFilters } from "../../../commands/filters.js";
import { dateFilterOfAnyTypeRemoved, dateFilterRemoved } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimensionOfAnyType,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* removeDateFiltersHandler(
    ctx: DashboardContext,
    cmd: IRemoveDateFilters,
): SagaIterator<void> {
    const { dataSets } = cmd.payload;

    const allDateFiltersWithDimension: ReturnType<
        typeof selectFilterContextDateFiltersWithDimensionOfAnyType
    > = yield select(selectFilterContextDateFiltersWithDimensionOfAnyType);

    const [removedFilters, _survivingFilters] = _partition(allDateFiltersWithDimension, (item) =>
        dataSets.some((ds) => areObjRefsEqual(ds, dashboardFilterObjRef(item))),
    );

    const invalidDataSets = difference(
        dataSets.map(serializeObjRef),
        allDateFiltersWithDimension.map((filter) => serializeObjRef(dashboardFilterObjRef(filter)!)),
    );

    if (invalidDataSets.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid dataSet provided. These ids were not found: ${invalidDataSets.join(", ")}.`,
        );
    }

    for (const removedFilter of removedFilters) {
        const dataSetRef = dashboardFilterObjRef(removedFilter)!;
        // read the dependencies left by the previous removal, its cleanup must not be overwritten
        const allAttributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
            selectFilterContextAttributeFilters,
        );
        // the local identifier is the new format stored by useDependentDateFilterConfigurationState;
        // dataSetRef.identifier (dataset identifier) is the legacy format. Both must be matched here
        // so that cleanup works regardless of which format a dependent reference was saved in.
        const filterLocalIdentifier = dashboardFilterLocalIdentifier(removedFilter);

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
                        depdendentDateFilter.filterLocalIdentifier === dataSetRef.identifier) &&
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
                            parent.filterLocalIdentifier !== dataSetRef.identifier,
                    ),
                }),
            ),
            // remove filter itself
            tabsActions.removeDateFilter({
                dataSet: dataSetRef,
            }),

            // remove reflect dashboard date filter config
            tabsActions.removeDateFilterConfigs(dataSetRef),
            // house-keeping: ensure the removed date filter disappears from widget ignore lists
            tabsActions.removeIgnoredDateFilter({
                dateDataSets: [dataSetRef],
            }),
        ]);

        yield put(batch);

        if (isDashboardDateFilter(removedFilter)) {
            yield dispatchDashboardEvent(dateFilterRemoved(ctx, removedFilter, cmd.correlationId));
        }
        yield dispatchDashboardEvent(dateFilterOfAnyTypeRemoved(ctx, removedFilter, cmd.correlationId));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
