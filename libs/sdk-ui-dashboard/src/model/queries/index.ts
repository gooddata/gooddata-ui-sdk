// (C) 2021 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights";
import { QueryWidgetFilters } from "./widgets";

export { IDashboardQuery, DashboardQueryType } from "./base";
export {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
    queryInsightAttributesMeta,
} from "./insights";
export { QueryWidgetFilters as QueryInsightWidgetFilters, queryWidgetFilters } from "./widgets";

/**
 * @alpha
 */
export type DashboardQueries = QueryInsightDateDatasets | QueryInsightAttributesMeta | QueryWidgetFilters;
