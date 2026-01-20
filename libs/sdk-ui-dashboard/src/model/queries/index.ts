// (C) 2021-2026 GoodData Corporation

import { type IQueryAttributeDataSet } from "./attributeDataSet.js";
import { type IQueryAttributeElements } from "./attributeElements.js";
import { type IQueryAttributeByDisplayForm } from "./attributes.js";
import { type IQueryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";
import { type IQueryConnectedAttributes } from "./connectedAttributes.js";
import { type IQueryConnectingAttributes } from "./connectingAttributes.js";
import { type IQueryInsightAttributesMeta, type IQueryInsightDateDatasets } from "./insights.js";
import { type IQueryMeasureDateDatasets } from "./kpis.js";
import { type IQueryMetricsAndFacts } from "./metricsAndFacts.js";
import {
    type IQueryWidgetAlertCount,
    type IQueryWidgetBrokenAlerts,
    type IQueryWidgetFilters,
} from "./widgets.js";

export type { IDashboardQuery, DashboardQueryType } from "./base.js";
export type {
    IQueryInsightDateDatasets,
    IInsightDateDatasets,
    IQueryInsightAttributesMeta,
    IInsightAttributesMeta,
} from "./insights.js";
export {
    queryDateDatasetsForInsight,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
} from "./insights.js";
export type { IQueryMeasureDateDatasets, IMeasureDateDatasets } from "./kpis.js";
export { queryDateDatasetsForMeasure } from "./kpis.js";
export type { IQueryWidgetFilters, IQueryWidgetBrokenAlerts, IQueryWidgetAlertCount } from "./widgets.js";
export { queryWidgetFilters, queryWidgetBrokenAlerts, queryWidgetAlertCount } from "./widgets.js";
export type { IQueryConnectingAttributes } from "./connectingAttributes.js";
export { queryConnectingAttributes } from "./connectingAttributes.js";
export type { IQueryConnectedAttributes } from "./connectedAttributes.js";
export { queryConnectedAttributes } from "./connectedAttributes.js";
export type { IQueryAttributeByDisplayForm } from "./attributes.js";
export { queryAttributeByDisplayForm } from "./attributes.js";
export type { IQueryAttributeDataSet } from "./attributeDataSet.js";
export { queryAttributeDataSet } from "./attributeDataSet.js";
export type { IQueryAttributeElements } from "./attributeElements.js";
export { queryAttributeElements } from "./attributeElements.js";
export type { IQueryMetricsAndFacts, IMetricsAndFacts } from "./metricsAndFacts.js";
export { queryMetricsAndFacts } from "./metricsAndFacts.js";
export type { IQueryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";
export { queryAvailableDatasetsForItems } from "./availableDatasetsForItems.js";

/**
 * @alpha
 */
export type DashboardQueries =
    | IQueryInsightDateDatasets
    | IQueryMeasureDateDatasets
    | IQueryInsightAttributesMeta
    | IQueryWidgetFilters
    | IQueryWidgetBrokenAlerts
    | IQueryWidgetAlertCount
    | IQueryConnectingAttributes
    | IQueryAttributeByDisplayForm
    | IQueryAttributeDataSet
    | IQueryAttributeElements
    | IQueryConnectedAttributes
    | IQueryMetricsAndFacts
    | IQueryAvailableDatasetsForItems;
