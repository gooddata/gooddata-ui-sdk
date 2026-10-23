// (C) 2022-2026 GoodData Corporation

import { type IMeasureMetadataObject, idRef } from "@gooddata/sdk-model";

export const exampleMetric: IMeasureMetadataObject = {
    ref: idRef("metric"),
    uri: "",
    id: "metric",
    type: "measure",
    title: "Metric title",
    description: "Short description of the metric to help understand the function",
    expression: "SELECT SUM ({fact/sales.profit}) BY {attribute/sales.department}",
    format: "",
    production: true,
    deprecated: false,
    isLocked: false,
    unlisted: false,
};
