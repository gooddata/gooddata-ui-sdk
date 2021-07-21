// (C) 2021 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights";
import { QueryInsightWidgetFilters } from "./widgets";

export { IDashboardQuery, DashboardQueryType } from "./base";
export {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
    queryInsightAttributesMeta,
} from "./insights";
export { QueryInsightWidgetFilters, queryInsightWidgetFilters } from "./widgets";

/**
 * @alpha
 */
export type DashboardQueries =
    | QueryInsightDateDatasets
    | QueryInsightAttributesMeta
    | QueryInsightWidgetFilters;
