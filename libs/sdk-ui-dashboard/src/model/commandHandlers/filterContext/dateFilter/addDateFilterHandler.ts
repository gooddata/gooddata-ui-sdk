// (C) 2023-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { objRefToString } from "@gooddata/sdk-model";

// import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { canFilterBeAdded } from "./validation/uniqueFiltersValidation.js";
import { selectAllCatalogDateDatasetsMap } from "../../../../model/store/catalog/catalogSelectors.js";
import { type IAddDateFilter } from "../../../commands/filters.js";
import { dateFilterAdded } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextDateFilterByDataSet,
    selectFilterContextDateFiltersWithDimension,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* addDateFilterHandler(ctx: DashboardContext, cmd: IAddDateFilter): SagaIterator<void> {
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
        tabsActions.addDateFilter({
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
