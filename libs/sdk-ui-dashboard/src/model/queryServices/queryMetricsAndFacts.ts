// (C) 2022-2024 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";

import { createCachedQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";
import { invalidQueryArguments } from "../events/general.js";
import { QueryMetricsAndFacts, IMetricsAndFacts } from "../queries/index.js";
import { selectCatalogMeasures, selectCatalogFacts } from "../store/index.js";

export const QueryMetricsAndFactsService = createCachedQueryService(
    "GDC.DASH/QUERY.METRICS_AND_FACTS",
    queryService,
    (_query: QueryMetricsAndFacts) => "metrics_and_facts",
);

async function loadMetricsAndFacts(ctx: DashboardContext) {
    const { backend, workspace, config } = ctx;
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
    // it is not necessary to fetch them again
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

    return {
        metrics: catalog.measures(),
        facts: catalog.facts(),
    };
}
