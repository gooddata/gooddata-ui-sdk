// (C) 2023-2025 GoodData Corporation

import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { objRefToString } from "@gooddata/sdk-model";
import { dispatchFilterContextChanged } from "../common.js";
// import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDateFiltersWithDimension,
} from "../../../store/filterContext/filterContextSelectors.js";

import { AddDateFilter } from "../../../commands/filters.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { selectAllCatalogDateDatasetsMap } from "../../../../model/store/catalog/catalogSelectors.js";
import { invariant } from "ts-invariant";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { dateFilterAdded } from "../../../events/filters.js";

export function* addDateFilterHandler(ctx: DashboardContext, cmd: AddDateFilter): SagaIterator<void> {
    const { index, dateDataset } = cmd.payload;

    const isUnderFilterCountLimit: ReturnType<typeof selectCanAddMoreFilters> =
        yield select(selectCanAddMoreFilters);

    if (!isUnderFilterCountLimit) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter, even though the limit on the count of filters has been reached.`,
        );
    }

    const dateDataSets: ReturnType<typeof selectAllCatalogDateDatasetsMap> = yield select(
        selectAllCatalogDateDatasetsMap,
    );
    const usedDateDataSet = dateDataSets.get(dateDataset);

    if (!usedDateDataSet) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add filter for a non-existing date data set ${objRefToString(dateDataset)}.`,
        );
    }

    invariant(usedDateDataSet);

    const allFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> = yield select(
        selectFilterContextDateFiltersWithDimension,
    );

    const canBeAdded: ReturnType<typeof canFilterBeAdded> = yield call(
        canFilterBeAdded,
        dateDataset,
        allFilters,
    );

    if (!canBeAdded) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Filter for date data set ${objRefToString(dateDataset)} already exists in the filter context.`,
        );
    }

    yield put(
        filterContextActions.addDateFilter({
            index,
            dateDataset,
        }),
    );

    const addedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> = yield select(
        selectFilterContextDateFilterByDataSet(dateDataset),
    );

    invariant(addedFilter, "Inconsistent state in addDateFilterHandler");

    yield dispatchDashboardEvent(dateFilterAdded(ctx, addedFilter, cmd.payload.index, cmd.correlationId));

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
