// (C) 2021-2022 GoodData Corporation

import {
    QueryCatalogAttributes,
    QueryCatalogDateAttributes,
    QueryCatalogDateDatasets,
    QueryCatalogFacts,
    QueryCatalogMeasures,
} from "./catalog";
import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights";
import { QueryWidgetBrokenAlerts, QueryWidgetFilters } from "./widgets";

export { IDashboardQuery, DashboardQueryType } from "./base";
export {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
} from "./insights";
export {
    QueryCatalogAttributes,
    QueryCatalogAttributesPayload,
    queryCatalogAttributes,
    QueryCatalogDateAttributes,
    QueryCatalogDateAttributesPayload,
    queryCatalogDateAttributes,
    QueryCatalogDateDatasets,
    QueryCatalogDateDatasetsPayload,
    queryCatalogDateDatasets,
    QueryCatalogFacts,
    QueryCatalogFactsPayload,
    queryCatalogFacts,
    QueryCatalogMeasures,
    QueryCatalogMeasuresPayload,
    queryCatalogMeasures,
} from "./catalog";
export { QueryMeasureDateDatasets, queryDateDatasetsForMeasure, MeasureDateDatasets } from "./kpis";
export {
    QueryWidgetFilters,
    queryWidgetFilters,
    QueryWidgetBrokenAlerts,
    queryWidgetBrokenAlerts,
} from "./widgets";

/**
 * @alpha
 */
export type DashboardQueries =
    | QueryInsightDateDatasets
    | QueryInsightAttributesMeta
    | QueryWidgetFilters
    | QueryWidgetBrokenAlerts
    | QueryCatalogAttributes
    | QueryCatalogFacts
    | QueryCatalogMeasures
    | QueryCatalogDateDatasets
    | QueryCatalogDateAttributes;
