// (C) 2024-2025 GoodData Corporation

import { ICatalogFact, ICatalogMeasure } from "@gooddata/sdk-model";

import { IDashboardQuery } from "./base.js";

/**
 * @alpha
 */
export interface IMetricsAndFacts {
    metrics: ICatalogMeasure[];
    facts: ICatalogFact[];
}

/**
 * @alpha
 */
export interface QueryMetricsAndFacts extends IDashboardQuery {
    type: "GDC.DASH/QUERY.METRICS_AND_FACTS";
}

/**
 * Creates action through which you can query metrics and facts
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @returns metrics and facts from catalog
 *
 * @alpha
 */
export function queryMetricsAndFacts(correlationId?: string): QueryMetricsAndFacts {
    return {
        type: "GDC.DASH/QUERY.METRICS_AND_FACTS",
        correlationId,
    };
}
