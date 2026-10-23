// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

export type EmptyMetric = IMeasureMetadataObjectDefinition &
    Required<
        Pick<
            IMeasureMetadataObjectDefinition,
            "expression" | "type" | "description" | "format" | "title" | "tags"
        >
    >;
export type EmptyMetricWidthId = EmptyMetric & { id: string };

export const emptyMetric: EmptyMetric = {
    type: "measure",
    title: "",
    description: "",
    expression: "",
    format: "#,##0.00",
    tags: [],
    // metricType must be explicitly undefined to ensure lodash.isEqual works correctly
    // when comparing with form data that adds metricType: undefined explicitly
    metricType: undefined,
};

export const emptyMetricWithId: EmptyMetricWidthId = { ...emptyMetric, id: "" };
