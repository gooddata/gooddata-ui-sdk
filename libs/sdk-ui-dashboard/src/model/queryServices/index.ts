// (C) 2021 GoodData Corporation
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta";
import { QueryInsightWidgetFiltersService } from "./queryInsightWidgetFilters";

export const AllQueryServices = [
    QueryDateDatasetsForInsightService,
    QueryInsightAttributesMetaService,
    QueryInsightWidgetFiltersService,
];
