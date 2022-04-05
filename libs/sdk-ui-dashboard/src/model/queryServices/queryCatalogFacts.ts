// (C) 2022 GoodData Corporation

import { ICatalogFact } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { QueryCatalogFacts } from "../queries/catalog";
import { selectCatalogFactsLoaded, selectCatalogFacts } from "../store/catalog/catalogSelectors";
import { createCachedQueryService } from "../store/_infra/queryService";
import { DashboardContext } from "../types/commonTypes";

async function loadFacts(context: DashboardContext, factRefs: ObjRef[]): Promise<ICatalogFact[]> {
    const { backend, workspace } = context;

    const facts = await backend.workspace(workspace).facts().getCatalogFacts(factRefs);

    return facts.filter((fact) => fact.fact.production);
}

function* queryService(context: DashboardContext, query: QueryCatalogFacts): SagaIterator<ICatalogFact[]> {
    const {
        payload: { refs },
    } = query;

    const factsLoaded: ReturnType<typeof selectCatalogFactsLoaded> = yield select(selectCatalogFactsLoaded);

    if (factsLoaded) {
        const facts: ReturnType<typeof selectCatalogFacts> = yield select(selectCatalogFacts);

        return facts.filter((fact) => {
            return refs.some((ref) => areObjRefsEqual(ref, fact.fact.ref));
        });
    }

    return yield call(loadFacts, context, refs);
}

export const QueryCatalogFactsService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.FACTS",
    queryService,
    (query: QueryCatalogFacts) => {
        const {
            payload: { refs },
        } = query;

        const serializedRefs = refs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
