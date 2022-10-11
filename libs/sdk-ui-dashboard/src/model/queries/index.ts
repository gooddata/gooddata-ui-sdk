// (C) 2021-2022 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights";
import { QueryWidgetBrokenAlerts, QueryWidgetFilters, QueryWidgetAlertCount } from "./widgets";
import { QueryMeasureDateDatasets } from "./kpis";
import { QueryConnectingAttributes } from "./connectingAttributes";
import { QueryAttributeByDisplayForm } from "./attributes";

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
    QueryWidgetAlertCount,
    queryWidgetAlertCount,
} from "./widgets";
export { QueryConnectingAttributes, queryConnectingAttributes } from "./connectingAttributes";
export { QueryAttributeByDisplayForm, queryAttributeByDisplayForm } from "./attributes";

/**
 * @alpha
 */
export type DashboardQueries =
    | QueryInsightDateDatasets
    | QueryMeasureDateDatasets
    | QueryInsightAttributesMeta
    | QueryWidgetFilters
    | QueryWidgetBrokenAlerts
    | QueryWidgetAlertCount
    | QueryConnectingAttributes
    | QueryAttributeByDisplayForm;
