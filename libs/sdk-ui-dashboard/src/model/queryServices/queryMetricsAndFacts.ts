// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import { IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { IMetricsAndFacts, QueryMetricsAndFacts } from "../queries/index.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { catalogActions, selectCatalogFacts, selectCatalogMeasures } from "../store/index.js";
import { DashboardContext } from "../types/commonTypes.js";

export const QueryMetricsAndFactsService = createCachedQueryService(
    "GDC.DASH/QUERY.METRICS_AND_FACTS",
    queryService,
    (_query: QueryMetricsAndFacts) => "metrics_and_facts",
);

async function loadMetricsAndFacts({ backend, workspace, config }: DashboardContext) {
    const availability = config?.objectAvailability;

    const options: IWorkspaceCatalogFactoryOptions = {
        excludeTags: (availability?.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        includeTags: (availability?.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        types: ["fact", "measure"],
        loadGroups: false,
    };

    return backend.workspace(workspace).catalog().withOptions(options).load();
}

function* queryService(ctx: DashboardContext, query: QueryMetricsAndFacts): SagaIterator<IMetricsAndFacts> {
    const metrics: ReturnType<typeof selectCatalogMeasures> = yield select(selectCatalogMeasures);
    const facts: ReturnType<typeof selectCatalogFacts> = yield select(selectCatalogFacts);

    // metrics and facts were loaded during dashboard initialization in initializeDashboardHandler
    // or by previous of this (sic) cached query that stores the result in the catalog slice as well
    if (metrics?.length > 0 && facts?.length > 0) {
        return {
            metrics,
            facts,
        };
    }

    const { correlationId } = query;

    const catalog: SagaReturnType<typeof loadMetricsAndFacts> = yield call(loadMetricsAndFacts, ctx);

    if (!catalog) {
        throw invalidQueryArguments(ctx, `Cannot find any metrics and facts`, correlationId);
    }

    // cache the results into catalog slice to be usable by other selectors without necessity to call
    // this query explicitly first
    yield put(
        catalogActions.setCatalogMeasuresAndFacts({
            facts: catalog.facts(),
            measures: catalog.measures(),
        }),
    );

    return {
        metrics: catalog.measures(),
        facts: catalog.facts(),
    };
}
