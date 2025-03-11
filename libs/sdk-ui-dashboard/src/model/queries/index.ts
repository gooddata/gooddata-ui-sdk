// (C) 2021-2025 GoodData Corporation

import { QueryInsightAttributesMeta, QueryInsightDateDatasets } from "./insights.js";
import { QueryWidgetBrokenAlerts, QueryWidgetFilters, QueryWidgetAlertCount } from "./widgets.js";
import { QueryMeasureDateDatasets } from "./kpis.js";
import { QueryConnectingAttributes } from "./connectingAttributes.js";
import { QueryAttributeByDisplayForm } from "./attributes.js";
import { QueryAttributeDataSet } from "./attributeDataSet.js";
import { QueryAttributeElements } from "./attributeElements.js";
import { QueryConnectedAttributes } from "./connectedAttributes.js";
import { QueryMetricsAndFacts } from "./metricsAndFacts.js";
import { QueryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";

export type { IDashboardQuery, DashboardQueryType } from "./base.js";
export type {
    QueryInsightDateDatasets,
    InsightDateDatasets,
    QueryInsightAttributesMeta,
    InsightAttributesMeta,
} from "./insights.js";
export {
    queryDateDatasetsForInsight,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
} from "./insights.js";
export type { QueryMeasureDateDatasets, MeasureDateDatasets } from "./kpis.js";
export { queryDateDatasetsForMeasure } from "./kpis.js";
export type { QueryWidgetFilters, QueryWidgetBrokenAlerts, QueryWidgetAlertCount } from "./widgets.js";
export { queryWidgetFilters, queryWidgetBrokenAlerts, queryWidgetAlertCount } from "./widgets.js";
export type { QueryConnectingAttributes } from "./connectingAttributes.js";
export { queryConnectingAttributes } from "./connectingAttributes.js";
export type { QueryConnectedAttributes } from "./connectedAttributes.js";
export { queryConnectedAttributes } from "./connectedAttributes.js";
export type { QueryAttributeByDisplayForm } from "./attributes.js";
export { queryAttributeByDisplayForm } from "./attributes.js";
export type { QueryAttributeDataSet } from "./attributeDataSet.js";
export { queryAttributeDataSet } from "./attributeDataSet.js";
export type { QueryAttributeElements } from "./attributeElements.js";
export { queryAttributeElements } from "./attributeElements.js";
export type { QueryMetricsAndFacts, IMetricsAndFacts } from "./metricsAndFacts.js";
export { queryMetricsAndFacts } from "./metricsAndFacts.js";
export type { QueryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";
export { queryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";

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
    | QueryAttributeElements
    | QueryConnectedAttributes
    | QueryMetricsAndFacts
    | QueryAvailableDatasetsForItems;
