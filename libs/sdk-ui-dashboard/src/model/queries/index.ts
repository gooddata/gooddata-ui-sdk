// (C) 2021 GoodData Corporation

import { QueryDateDatasetsForInsightService } from "./queryDateDatasetForInsight";

export { IDashboardQuery, DashboardQueryType } from "./base";
export {
    QueryDateDatasetsForInsight,
    DateDatasetsForInsight,
    QueryDateDatasetsForInsightService,
} from "./queryDateDatasetForInsight";

/**
 * @internal
 */
export const AllQueryServices = [QueryDateDatasetsForInsightService];
