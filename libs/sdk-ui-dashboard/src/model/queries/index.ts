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
