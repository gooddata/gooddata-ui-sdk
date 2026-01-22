// (C) 2021-2026 GoodData Corporation

import { QueryAttributeByDisplayFormService } from "./queryAttributeByDisplayForm.js";
import { QueryAttributeDataSetService } from "./queryAttributeDataset.js";
import { QueryAttributeElementsService } from "./queryAttributeElements.js";
import { QueryAvailableDatasetForItemsService } from "./queryAvailableDatasetsForItems.js";
import { QueryConnectedAttributesService } from "./queryConnectedAttributes.js";
import { QueryConnectingAttributesService } from "./queryConnectingAttributes.js";
import {
    QueryInsightAttributesMetaService,
    selectInsightAttributesMeta,
    type selectInsightAttributesMetaType,
} from "./queryInsightAttributesMeta.js";
import {
    QueryDateDatasetsForInsightService,
    selectDateDatasetsForInsight,
    type selectDateDatasetsForInsightType,
} from "./queryInsightDateDatasets.js";
import {
    QueryDateDatasetsForMeasureService,
    selectDateDatasetsForMeasure,
    type selectDateDatasetsForMeasureType,
} from "./queryMeasureDateDatasets.js";
import { QueryMetricsAndFactsService } from "./queryMetricsAndFacts.js";
import { QueryWidgetAlertCountService } from "./queryWidgetAlertCount.js";
import { QueryWidgetBrokenAlertService } from "./queryWidgetBrokenAlerts.js";
import { QueryWidgetFiltersService } from "./queryWidgetFilters.js";

export const AllQueryServices = [
    QueryDateDatasetsForInsightService,
    QueryInsightAttributesMetaService,
    QueryWidgetFiltersService,
    QueryDateDatasetsForMeasureService,
    QueryWidgetBrokenAlertService,
    QueryWidgetAlertCountService,
    QueryConnectingAttributesService,
    QueryAttributeByDisplayFormService,
    QueryAttributeDataSetService,
    QueryAttributeElementsService,
    QueryConnectedAttributesService,
    QueryMetricsAndFactsService,
    QueryAvailableDatasetForItemsService,
];

export { selectDateDatasetsForInsight, type selectDateDatasetsForInsightType };
export { selectInsightAttributesMeta, type selectInsightAttributesMetaType };
export { selectDateDatasetsForMeasure, type selectDateDatasetsForMeasureType };
