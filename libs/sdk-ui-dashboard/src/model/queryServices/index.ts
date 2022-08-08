// (C) 2021-2022 GoodData Corporation
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta";
import { QueryWidgetFiltersService } from "./queryWidgetFilters";
import { QueryDateDatasetsForMeasureService } from "./queryMeasureDateDatasets";
import { QueryWidgetBrokenAlertService } from "./queryWidgetBrokenAlerts";
import { QueryWidgetAlertCountService } from "./queryWidgetAlertCount";

export const AllQueryServices = [
    QueryDateDatasetsForInsightService,
    QueryInsightAttributesMetaService,
    QueryWidgetFiltersService,
    QueryDateDatasetsForMeasureService,
    QueryWidgetBrokenAlertService,
    QueryWidgetAlertCountService,
];
