// (C) 2021-2026 GoodData Corporation

import { type IQueryAttributeDataSet, queryAttributeDataSet } from "./attributeDataSet.js";
import { type IQueryAttributeElements, queryAttributeElements } from "./attributeElements.js";
import { type IQueryAttributeByDisplayForm, queryAttributeByDisplayForm } from "./attributes.js";
import {
    type IQueryAvailableDatasetsForItems,
    queryAvailableDatasetsForItems,
} from "./availableDatasetsForItems.js";
import { type IQueryConnectedAttributes, queryConnectedAttributes } from "./connectedAttributes.js";
import { type IQueryConnectingAttributes, queryConnectingAttributes } from "./connectingAttributes.js";
import {
    type IInsightAttributesMeta,
    type IInsightDateDatasets,
    type IQueryInsightAttributesMeta,
    type IQueryInsightDateDatasets,
    insightSelectDateDataset,
    queryDateDatasetsForInsight,
    queryInsightAttributesMeta,
} from "./insights.js";
import {
    type IMeasureDateDatasets,
    type IQueryMeasureDateDatasets,
    queryDateDatasetsForMeasure,
} from "./kpis.js";
import {
    type IMetricsAndFacts,
    type IQueryMetricsAndFacts,
    queryMetricsAndFacts,
} from "./metricsAndFacts.js";
import {
    type IQueryWidgetAlertCount,
    type IQueryWidgetBrokenAlerts,
    type IQueryWidgetFilters,
    queryWidgetAlertCount,
    queryWidgetBrokenAlerts,
    queryWidgetFilters,
} from "./widgets.js";

export type { IDashboardQuery, DashboardQueryType } from "./base.js";
export {
    type IQueryInsightDateDatasets,
    type IInsightDateDatasets,
    type IQueryInsightAttributesMeta,
    type IInsightAttributesMeta,
    queryDateDatasetsForInsight,
    queryInsightAttributesMeta,
    insightSelectDateDataset,
};
export { type IQueryMeasureDateDatasets, type IMeasureDateDatasets, queryDateDatasetsForMeasure };
export {
    type IQueryWidgetFilters,
    type IQueryWidgetBrokenAlerts,
    type IQueryWidgetAlertCount,
    queryWidgetFilters,
    queryWidgetBrokenAlerts,
    queryWidgetAlertCount,
};
export { type IQueryConnectingAttributes, queryConnectingAttributes };
export { type IQueryConnectedAttributes, queryConnectedAttributes };
export { type IQueryAttributeByDisplayForm, queryAttributeByDisplayForm };
export { type IQueryAttributeDataSet, queryAttributeDataSet };
export { type IQueryAttributeElements, queryAttributeElements };
export { type IQueryMetricsAndFacts, type IMetricsAndFacts, queryMetricsAndFacts };
export { type IQueryAvailableDatasetsForItems, queryAvailableDatasetsForItems };

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
