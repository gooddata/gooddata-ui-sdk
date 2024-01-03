// (C) 2021-2022 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { batchActions } from "redux-batched-actions";
import difference from "lodash/difference.js";
import partition from "lodash/partition.js";

import { RemoveDateFilters } from "../../../commands/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { selectFilterContextDateFiltersForDimension } from "../../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";
import { areObjRefsEqual, serializeObjRef } from "@gooddata/sdk-model";
import { layoutActions } from "../../../store/layout/index.js";
import { dateFilterConfigsActions } from "../../../store/dateFilterConfigs/index.js";

export function* removeDateFiltersHandler(ctx: DashboardContext, cmd: RemoveDateFilters): SagaIterator<void> {
    const { dataSets } = cmd.payload;

    const allDateFiltersWithDimension: ReturnType<typeof selectFilterContextDateFiltersForDimension> =
        yield select(selectFilterContextDateFiltersForDimension);

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
        const batch = batchActions([
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
        // TODO INE: propagate as event to KD
        // yield dispatchDashboardEvent(
        //     attributeFilterRemoved(ctx, removedFilter!, affectedChildren, cmd.correlationId),
        // );
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
