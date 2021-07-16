// (C) 2021 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights";

export { IDashboardQuery, DashboardQueryType } from "./base";
export {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
    queryInsightAttributesMeta,
} from "./insights";

/**
 * @alpha
 */
export type DashboardQueries = QueryInsightDateDatasets | QueryInsightAttributesMeta;
