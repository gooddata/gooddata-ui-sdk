// (C) 2021-2024 GoodData Corporation
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets.js";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta.js";
import { QueryWidgetFiltersService } from "./queryWidgetFilters.js";
import { QueryDateDatasetsForMeasureService } from "./queryMeasureDateDatasets.js";
import { QueryWidgetBrokenAlertService } from "./queryWidgetBrokenAlerts.js";
import { QueryWidgetAlertCountService } from "./queryWidgetAlertCount.js";
import { QueryConnectingAttributesService } from "./queryConnectingAttributes.js";
import { QueryAttributeByDisplayFormService } from "./queryAttributeByDisplayForm.js";
import { QueryAttributeDataSetService } from "./queryAttributeDataset.js";
import { QueryAttributeElementsService } from "./queryAttributeElements.js";
import { QueryConnectedAttributesService } from "./queryConnectedAttributes.js";
import { QueryMetricsAndFactsService } from "./queryMetricsAndFacts.js";
import { QueryAvailableDatasetForItemsService } from "./queryAvailableDatasetsForItems.js";

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
