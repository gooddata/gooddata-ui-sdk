// (C) 2021-2025 GoodData Corporation

import { type QueryAttributeDataSet } from "./attributeDataSet.js";
import { type QueryAttributeElements } from "./attributeElements.js";
import { type QueryAttributeByDisplayForm } from "./attributes.js";
import { type QueryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";
import { type QueryConnectedAttributes } from "./connectedAttributes.js";
import { type QueryConnectingAttributes } from "./connectingAttributes.js";
import { type QueryInsightAttributesMeta, type QueryInsightDateDatasets } from "./insights.js";
import { type QueryMeasureDateDatasets } from "./kpis.js";
import { type QueryMetricsAndFacts } from "./metricsAndFacts.js";
import {
    type QueryWidgetAlertCount,
    type QueryWidgetBrokenAlerts,
    type QueryWidgetFilters,
} from "./widgets.js";

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
