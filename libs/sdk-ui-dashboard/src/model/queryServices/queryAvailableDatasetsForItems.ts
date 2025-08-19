// (C) 2024-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { ICatalogDateDataset } from "@gooddata/sdk-model";

import { QueryAvailableDatasetsForItems } from "../queries/availableDatasetsForItems.js";
import { createQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";
import { PromiseFnReturnType } from "../types/sagas.js";

export const QueryAvailableDatasetForItemsService = createQueryService(
    "GDC.DASH/QUERY.AVAILABLE.DATA.SETS.FOR.ITEMS",
    queryService,
);

function* queryService(
    ctx: DashboardContext,
    query: QueryAvailableDatasetsForItems,
): SagaIterator<ICatalogDateDataset[]> {
    const {
        payload: { items },
    } = query;

    const { backend, workspace } = ctx;

    const catalogLoader = backend.workspace(workspace).catalog();
    const catalog: PromiseFnReturnType<typeof catalogLoader.load> = yield call([
        catalogLoader,
        catalogLoader.load,
    ]);

    const availableDateDataSetsLoader = catalog.availableItems().forItems(items);

    const loadedAvailableDateDataSets: PromiseFnReturnType<typeof availableDateDataSetsLoader.load> =
        yield call([availableDateDataSetsLoader, availableDateDataSetsLoader.load]);

    return loadedAvailableDateDataSets.availableDateDatasets();
}
