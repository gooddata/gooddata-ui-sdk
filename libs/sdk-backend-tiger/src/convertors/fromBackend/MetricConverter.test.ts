// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiMetricOutDocument } from "@gooddata/api-client-tiger";

import { convertMetricFromBackend } from "./MetricConverter.js";

function metricDocument(
    conditionalFormatting: JsonApiMetricOutDocument["data"]["attributes"]["conditionalFormatting"],
): JsonApiMetricOutDocument {
    return {
        data: {
            id: "metric.id",
            type: "metric",
            attributes: {
                title: "Metric A",
                description: "",
                tags: [],
                content: { maql: "SELECT 1" },
                conditionalFormatting,
            },
        },
    } as unknown as JsonApiMetricOutDocument;
}

describe("convertMetricFromBackend — conditionalFormatting", () => {
    it("surfaces conditions and the enabled bit when the backend marks conditionalFormatting enabled", () => {
        const measure = convertMetricFromBackend(
            metricDocument({
                enabled: true,
                conditions: [
                    {
                        id: "c1",
                        operator: "GREATER_THAN",
                        value: { kind: "literal", value: 1 },
                        format: { scope: "cell" },
                    },
                ],
            }),
        );
        expect(measure.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [
                {
                    id: "c1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 1 },
                    format: { scope: "cell" },
                },
            ],
        });
    });

    it("surfaces conditions and the enabled bit when the backend marks conditionalFormatting disabled", () => {
        const measure = convertMetricFromBackend(
            metricDocument({
                enabled: false,
                conditions: [
                    {
                        id: "c1",
                        operator: "GREATER_THAN",
                        value: { kind: "literal", value: 1 },
                        format: { scope: "cell" },
                    },
                ],
            }),
        );
        expect(measure.conditionalFormatting).toEqual({
            enabled: false,
            conditions: [
                {
                    id: "c1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 1 },
                    format: { scope: "cell" },
                },
            ],
        });
    });

    it("has no conditionalFormatting when the field is absent", () => {
        const measure = convertMetricFromBackend(metricDocument(undefined));
        expect(measure.conditionalFormatting).toBeUndefined();
    });
});
