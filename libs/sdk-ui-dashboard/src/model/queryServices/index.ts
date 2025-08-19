// (C) 2021-2025 GoodData Corporation
import { QueryAttributeByDisplayFormService } from "./queryAttributeByDisplayForm.js";
import { QueryAttributeDataSetService } from "./queryAttributeDataset.js";
import { QueryAttributeElementsService } from "./queryAttributeElements.js";
import { QueryAvailableDatasetForItemsService } from "./queryAvailableDatasetsForItems.js";
import { QueryConnectedAttributesService } from "./queryConnectedAttributes.js";
import { QueryConnectingAttributesService } from "./queryConnectingAttributes.js";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta.js";
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets.js";
import { QueryDateDatasetsForMeasureService } from "./queryMeasureDateDatasets.js";
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

export {
    selectDateDatasetsForInsight,
    type selectDateDatasetsForInsightType,
} from "./queryInsightDateDatasets.js";
export {
    selectInsightAttributesMeta,
    type selectInsightAttributesMetaType,
} from "./queryInsightAttributesMeta.js";
export {
    selectDateDatasetsForMeasure,
    type selectDateDatasetsForMeasureType,
} from "./queryMeasureDateDatasets.js";
