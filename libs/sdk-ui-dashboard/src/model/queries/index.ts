// (C) 2021-2023 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights.js";
import { QueryWidgetBrokenAlerts, QueryWidgetFilters, QueryWidgetAlertCount } from "./widgets.js";
import { QueryMeasureDateDatasets } from "./kpis.js";
import { QueryConnectingAttributes } from "./connectingAttributes.js";
import { QueryAttributeByDisplayForm } from "./attributes.js";
import { QueryAttributeDataSet } from "./attributeDataSet.js";
import { QueryAttributeElements } from "./attributeElements.js";

export { IDashboardQuery, DashboardQueryType } from "./base.js";
export {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
} from "./insights.js";
export { QueryMeasureDateDatasets, queryDateDatasetsForMeasure, MeasureDateDatasets } from "./kpis.js";
export {
    QueryWidgetFilters,
    queryWidgetFilters,
    QueryWidgetBrokenAlerts,
    queryWidgetBrokenAlerts,
    QueryWidgetAlertCount,
    queryWidgetAlertCount,
} from "./widgets.js";
export { QueryConnectingAttributes, queryConnectingAttributes } from "./connectingAttributes.js";
export { QueryAttributeByDisplayForm, queryAttributeByDisplayForm } from "./attributes.js";
export { QueryAttributeDataSet, queryAttributeDataSet } from "./attributeDataSet.js";
export { QueryAttributeElements, queryAttributeElements } from "./attributeElements.js";

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
    | QueryAttributeByDisplayForm
    | QueryAttributeDataSet
    | QueryAttributeElements;
