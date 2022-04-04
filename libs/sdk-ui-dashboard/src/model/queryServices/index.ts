// (C) 2021-2022 GoodData Corporation
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta";
import { QueryWidgetFiltersService } from "./queryWidgetFilters";
import { QueryDateDatasetsForMeasureService } from "./queryMeasureDateDatasets";
import { QueryWidgetBrokenAlertService } from "./queryWidgetBrokenAlerts";
import { QueryCatalogAttributesService } from "./queryCatalogAttributes";
import { QueryCatalogDateAttributesService } from "./queryCatalogDateAttributes";
import { QueryCatalogMeasuresService } from "./queryCatalogMeasures";
import { QueryCatalogFactsService } from "./queryCatalogFacts";
import { QueryCatalogDateDatasetsService } from "./queryCatalogDateDatasets";

export const AllQueryServices = [
    QueryDateDatasetsForInsightService,
    QueryInsightAttributesMetaService,
    QueryWidgetFiltersService,
    QueryDateDatasetsForMeasureService,
    QueryWidgetBrokenAlertService,
    QueryCatalogAttributesService,
    QueryCatalogDateAttributesService,
    QueryCatalogMeasuresService,
    QueryCatalogFactsService,
    QueryCatalogDateDatasetsService,
];
