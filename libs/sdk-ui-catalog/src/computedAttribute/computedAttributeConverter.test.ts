// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    IComputedAttributeMetadataObject,
    IComputedAttributeMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import {
    computedAttributeYamlToDefinition,
    definitionToComputedAttributeYaml,
    reconcileComputedAttributeDefinition,
} from "./computedAttributeConverter.js";
import type { ComputedAttributeSchema } from "./computedAttributeSchema.js";

const MAQL = 'SELECT CASE WHEN {metric/won_activities} > 50 THEN "High" ELSE "Low" END';

const computedAttribute: IComputedAttributeMetadataObject = {
    id: "rep_performance",
    uri: "rep_performance",
    ref: { identifier: "rep_performance", type: "computedAttribute" },
    type: "computedAttribute",
    title: "Rep Performance",
    description: "Sales rep performance band",
    tags: ["sales"],
    production: true,
    deprecated: false,
    unlisted: false,
    expression: MAQL,
    displayForms: [],
};

describe("computedAttributeYamlToDefinition", () => {
    it("maps the AAC shape to a backend computed attribute definition", () => {
        const yaml: ComputedAttributeSchema = {
            type: "computed_attribute",
            id: "rep_performance",
            title: "Rep Performance",
            description: "Sales rep performance band",
            tags: ["sales"],
            maql: MAQL,
            locale: "en-US",
        };

        expect(computedAttributeYamlToDefinition(yaml)).toEqual({
            type: "computedAttribute",
            id: "rep_performance",
            title: "Rep Performance",
            description: "Sales rep performance band",
            tags: ["sales"],
            expression: MAQL,
            locale: "en-US",
        });
    });

    it("omits the id when absent so the server derives one", () => {
        const definition = computedAttributeYamlToDefinition({
            type: "computed_attribute",
            maql: MAQL,
        });
        expect(definition).not.toHaveProperty("id");
        expect(definition).toMatchObject({ type: "computedAttribute", expression: MAQL });
    });

    it("omits the locale when absent rather than defaulting one", () => {
        expect(
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        ).not.toHaveProperty("locale");
    });

    it("maps the value-shaping fields and reads show_in_ai_results as the hidden flag", () => {
        expect(
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                maql: MAQL,
                format: "#,##0.00",
                metric_type: "CURRENCY",
                data_type: "NUMERIC",
                value_type: "HYPERLINK",
                is_nullable: true,
                null_value_join_replacement: "N/A",
                show_in_ai_results: false,
            }),
        ).toMatchObject({
            format: "#,##0.00",
            metricType: "CURRENCY",
            dataType: "NUMERIC",
            valueType: "HYPERLINK",
            isNullable: true,
            nullValue: "N/A",
            isHidden: true,
        });
        expect(
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                maql: MAQL,
                show_in_ai_results: true,
            }),
        ).toMatchObject({ isHidden: false });
        expect(
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        ).not.toHaveProperty("isHidden");
    });
});

describe("definitionToComputedAttributeYaml", () => {
    it("maps a loaded computed attribute to the canonical AAC shape", () => {
        expect(definitionToComputedAttributeYaml(computedAttribute)).toEqual({
            type: "computed_attribute",
            id: "rep_performance",
            title: "Rep Performance",
            description: "Sales rep performance band",
            tags: ["sales"],
            maql: MAQL,
        });
    });

    it("omits empty meta fields", () => {
        expect(
            definitionToComputedAttributeYaml({ ...computedAttribute, description: "", tags: [] }),
        ).toEqual({
            type: "computed_attribute",
            id: "rep_performance",
            title: "Rep Performance",
            maql: MAQL,
        });
    });

    it("omits the id when the definition has none", () => {
        expect(
            definitionToComputedAttributeYaml({
                type: "computedAttribute",
                title: "Copy",
                description: "",
                tags: [],
                expression: MAQL,
            }),
        ).toEqual({ type: "computed_attribute", title: "Copy", maql: MAQL });
    });

    it("writes the value-shaping fields and a hidden flag as show_in_ai_results: false", () => {
        expect(
            definitionToComputedAttributeYaml({
                ...computedAttribute,
                format: "#,##0.00",
                metricType: "CURRENCY",
                dataType: "NUMERIC",
                valueType: "HYPERLINK",
                isNullable: true,
                nullValue: "N/A",
                isHidden: true,
                locale: "en-US",
            }),
        ).toMatchObject({
            format: "#,##0.00",
            metric_type: "CURRENCY",
            data_type: "NUMERIC",
            value_type: "HYPERLINK",
            is_nullable: true,
            null_value_join_replacement: "N/A",
            show_in_ai_results: false,
            locale: "en-US",
        });
        expect(
            definitionToComputedAttributeYaml({ ...computedAttribute, isHidden: false }),
        ).not.toHaveProperty("show_in_ai_results");
    });
});

describe("round trip", () => {
    it("preserves a computed attribute through definition mapping", () => {
        const yaml = definitionToComputedAttributeYaml(computedAttribute);
        expect(computedAttributeYamlToDefinition(yaml as ComputedAttributeSchema)).toEqual({
            type: "computedAttribute",
            id: "rep_performance",
            title: "Rep Performance",
            description: "Sales rep performance band",
            tags: ["sales"],
            expression: MAQL,
        });
    });
});

describe("reconcileComputedAttributeDefinition", () => {
    const shaped: IComputedAttributeMetadataObject = {
        ...computedAttribute,
        isLocked: true,
        format: "#,##0",
        metricType: "CURRENCY",
        dataType: "NUMERIC",
        valueType: "HYPERLINK",
        isNullable: true,
        nullValue: "N/A",
        isHidden: true,
        locale: "en-US",
    };

    it("overlays the YAML fields, keeping only identity and server-managed state from the base", () => {
        const merged = reconcileComputedAttributeDefinition(
            shaped,
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                id: "rep_performance",
                title: "Renamed",
                maql: "SELECT 2",
            }),
        );

        expect(merged).toMatchObject({
            id: "rep_performance",
            ref: shaped.ref,
            uri: shaped.uri,
            isLocked: true,
            title: "Renamed",
            expression: "SELECT 2",
            isHidden: false,
        });
        // every value-shaping line was removed from the YAML, so the base's values do not leak through
        for (const key of [
            "format",
            "metricType",
            "dataType",
            "valueType",
            "isNullable",
            "nullValue",
            "locale",
        ]) {
            expect(merged[key as keyof typeof merged]).toBeUndefined();
        }
    });

    it("takes the value-shaping fields from the YAML", () => {
        const merged = reconcileComputedAttributeDefinition(
            shaped,
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                id: "rep_performance",
                maql: MAQL,
                format: "0.0",
                metric_type: "UNSPECIFIED",
                data_type: "STRING",
                value_type: "IMAGE",
                is_nullable: false,
                null_value_join_replacement: "-",
                show_in_ai_results: true,
                locale: "cs-CZ",
            }),
        );

        expect(merged).toMatchObject({
            format: "0.0",
            metricType: "UNSPECIFIED",
            dataType: "STRING",
            valueType: "IMAGE",
            isNullable: false,
            nullValue: "-",
            isHidden: false,
            locale: "cs-CZ",
        });
    });

    // A copied source carrying its identity and a value type.
    const copied: IComputedAttributeMetadataObjectDefinition = {
        type: "computedAttribute",
        id: "rep_performance_2",
        title: "Rep Performance (2)",
        description: "Sales rep performance band",
        tags: ["sales"],
        expression: MAQL,
        valueType: "HYPERLINK",
        locale: "en-US",
    };

    it("takes the id from the YAML, not the copied source", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                id: "renamed_id",
                maql: MAQL,
                value_type: "HYPERLINK",
            }),
        );
        expect(merged.id).toBe("renamed_id");
        expect(merged.valueType).toBe("HYPERLINK");
    });

    it("drops the id when removed from the YAML so the server derives one", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        );
        expect(merged).not.toHaveProperty("id");
    });

    it("clears the collation when the locale line is removed", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        );
        expect(merged.locale).toBeUndefined();
    });
});
