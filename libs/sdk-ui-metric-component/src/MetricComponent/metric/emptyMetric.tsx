// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type EmptyMetric = IMeasureMetadataObjectDefinition &
    Required<
        Pick<
            IMeasureMetadataObjectDefinition,
            "expression" | "type" | "description" | "format" | "title" | "tags"
        >
    >;

/**
 * @internal
 */
export type EmptyMetricWidthId = EmptyMetric & { id: string };

/**
 * @internal
 */
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

/**
 * @internal
 */
export const emptyMetricWithId: EmptyMetricWidthId = { ...emptyMetric, id: "" };
