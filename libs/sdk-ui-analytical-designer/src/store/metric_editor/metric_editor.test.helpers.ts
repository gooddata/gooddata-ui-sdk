// (C) 2022-2026 GoodData Corporation

import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { type ICatalogMeasure, type IMeasureMetadataObject, idRef } from "@gooddata/sdk-model";

function createExampleMetric(sufix: string | number): IMeasureMetadataObject {
    return newMeasureMetadataObject(idRef(`metric${sufix}`), (builder) =>
        builder
            .title(`Metric title ${sufix}`)
            .description("Short description of the metric to help understand the function")
            .expression("SELECT SUM ({fact/sales.profit}) BY {attribute/sales.department}"),
    );
}

export const exampleMetric = createExampleMetric(1);
export const exampleMetric2 = createExampleMetric(2);
export const exampleMetric3 = createExampleMetric(3);

export const exampleCatalogMetric: ICatalogMeasure = {
    measure: exampleMetric,
    groups: [],
    type: "measure",
};
