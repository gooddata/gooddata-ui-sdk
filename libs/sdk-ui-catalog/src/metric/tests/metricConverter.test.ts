// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IMeasureMetadataObject, IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import {
    definitionToMetricYaml,
    mergeCopiedMetricDefinition,
    metricYamlToDefinition,
    overlayMetricYamlFields,
} from "../metricConverter.js";
import type { MetricSchema } from "../metricSchema.js";

const measure: IMeasureMetadataObject = {
    id: "revenue.total",
    uri: "revenue.total",
    ref: { identifier: "revenue.total", type: "measure" },
    type: "measure",
    title: "Total Revenue",
    description: "Sum of all order amounts",
    tags: ["finance"],
    production: true,
    deprecated: false,
    unlisted: false,
    expression: "SELECT SUM({fact/order_amount})",
    format: "#,##0.00",
};

describe("metricYamlToDefinition", () => {
    it("maps the AAC metric shape to a backend measure definition", () => {
        const metric: MetricSchema = {
            type: "metric",
            id: "revenue.total",
            title: "Total Revenue",
            description: "Sum of all order amounts",
            tags: ["finance"],
            maql: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        };

        expect(metricYamlToDefinition(metric)).toEqual({
            type: "measure",
            id: "revenue.total",
            title: "Total Revenue",
            description: "Sum of all order amounts",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });
    });

    it("omits the id when absent so the server derives one", () => {
        const metric: MetricSchema = { type: "metric", maql: "SELECT 1" };
        const definition = metricYamlToDefinition(metric);
        expect(definition).not.toHaveProperty("id");
        expect(definition).toMatchObject({ type: "measure", expression: "SELECT 1", format: "" });
    });

    it("prefers show_in_ai_results over the deprecated is_hidden", () => {
        expect(
            metricYamlToDefinition({
                type: "metric",
                maql: "SELECT 1",
                show_in_ai_results: false,
                is_hidden: false,
            }),
        ).toMatchObject({ isHidden: true });
    });

    it("falls back to is_hidden when show_in_ai_results is absent", () => {
        expect(metricYamlToDefinition({ type: "metric", maql: "SELECT 1", is_hidden: true })).toMatchObject({
            isHidden: true,
        });
    });
});

describe("round trip", () => {
    it("preserves a measure through definition mapping", () => {
        const yaml = definitionToMetricYaml(measure);
        const definition = metricYamlToDefinition(yaml as MetricSchema);
        expect(definition).toEqual({
            type: "measure",
            id: "revenue.total",
            title: "Total Revenue",
            description: "Sum of all order amounts",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });
    });
});

describe("definitionToMetricYaml", () => {
    it("maps a loaded measure to the canonical AAC metric shape", () => {
        expect(definitionToMetricYaml(measure)).toEqual({
            type: "metric",
            id: "revenue.total",
            title: "Total Revenue",
            description: "Sum of all order amounts",
            tags: ["finance"],
            maql: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });
    });

    it("omits empty meta fields and marks a hidden metric", () => {
        expect(
            definitionToMetricYaml({
                ...measure,
                description: "",
                tags: [],
                format: "",
                isHidden: true,
            }),
        ).toEqual({
            type: "metric",
            id: "revenue.total",
            title: "Total Revenue",
            maql: "SELECT SUM({fact/order_amount})",
            show_in_ai_results: false,
        });
    });

    it("omits the id when the definition has none", () => {
        const yaml = definitionToMetricYaml({
            type: "measure",
            title: "Copy",
            description: "",
            tags: [],
            expression: "SELECT 1",
            format: "",
        });
        expect(yaml).toEqual({ type: "metric", title: "Copy", maql: "SELECT 1" });
    });
});

describe("overlayMetricYamlFields", () => {
    it("overlays the YAML fields while keeping the base's non-YAML fields", () => {
        const base: IMeasureMetadataObject = {
            ...measure,
            metricType: "CURRENCY",
            isHiddenFromKda: true,
        };
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "revenue.total",
            title: "Renamed",
            maql: "SELECT 2",
        });
        const merged = overlayMetricYamlFields(base, yaml);
        expect(merged).toMatchObject({
            title: "Renamed",
            expression: "SELECT 2",
            metricType: "CURRENCY",
            isHiddenFromKda: true,
        });
    });

    it("keeps the base identity even when the YAML carries a different id", () => {
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "some_other_id",
            title: "X",
            maql: "SELECT 1",
        });
        expect(overlayMetricYamlFields(measure, yaml)).toMatchObject({
            id: "revenue.total",
            ref: measure.ref,
        });
    });
});

describe("mergeCopiedMetricDefinition", () => {
    // A copied source carrying fields the YAML cannot represent (metricType, isHiddenFromKda).
    const copied: IMeasureMetadataObjectDefinition = {
        type: "measure",
        id: "revenue_2",
        title: "Total Revenue (2)",
        description: "Sum of all order amounts",
        tags: ["finance"],
        expression: "SELECT SUM({fact/order_amount})",
        format: "#,##0.00",
        metricType: "CURRENCY",
        isHidden: true,
        isHiddenFromKda: true,
    };

    it("carries the source's non-YAML fields over the parsed YAML", () => {
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "revenue_2",
            title: "Total Revenue (2)",
            maql: "SELECT SUM({fact/order_amount})",
            show_in_ai_results: false,
        });
        const merged = mergeCopiedMetricDefinition(copied, yaml);
        expect(merged.metricType).toBe("CURRENCY");
        expect(merged.isHiddenFromKda).toBe(true);
    });

    it("lets a YAML edit win over the copied source", () => {
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "revenue_2",
            title: "Renamed",
            maql: "SELECT 2",
        });
        const merged = mergeCopiedMetricDefinition(copied, yaml);
        expect(merged).toMatchObject({ title: "Renamed", expression: "SELECT 2" });
    });

    it("takes the id from the YAML, not the copied source", () => {
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "renamed_id",
            title: "Copy",
            maql: "SELECT 1",
        });
        expect(mergeCopiedMetricDefinition(copied, yaml).id).toBe("renamed_id");
    });

    it("unhides the copy when the visibility line is removed from a hidden source", () => {
        const yaml = metricYamlToDefinition({
            type: "metric",
            id: "revenue_2",
            title: "Copy",
            maql: "SELECT 1",
        });
        expect(mergeCopiedMetricDefinition(copied, yaml).isHidden).toBe(false);
    });

    it("drops the id when removed from the YAML so the server derives one", () => {
        const yaml = metricYamlToDefinition({ type: "metric", title: "Copy", maql: "SELECT 1" });
        const merged = mergeCopiedMetricDefinition(copied, yaml);
        expect(merged).not.toHaveProperty("id");
        // The non-YAML semantics still survive even without an id.
        expect(merged.metricType).toBe("CURRENCY");
    });
});
