// (C) 2021 GoodData Corporation

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
    | QueryWidgetBrokenAlerts;
