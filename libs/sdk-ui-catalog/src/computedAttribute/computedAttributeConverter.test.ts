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
    it("overlays the YAML fields, keeping the fields the YAML cannot express", () => {
        const base: IComputedAttributeMetadataObject = {
            ...computedAttribute,
            format: "#,##0",
            metricType: "CURRENCY",
            dataType: "STRING",
            isNullable: true,
            nullValue: "N/A",
        };
        const merged = reconcileComputedAttributeDefinition(
            base,
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                id: "rep_performance",
                title: "Renamed",
                maql: "SELECT 2",
            }),
        );

        expect(merged).toMatchObject({
            title: "Renamed",
            expression: "SELECT 2",
            format: "#,##0",
            metricType: "CURRENCY",
            dataType: "STRING",
            isNullable: true,
            nullValue: "N/A",
        });
    });

    // A copied source carrying fields the YAML cannot represent.
    const copied: IComputedAttributeMetadataObjectDefinition = {
        type: "computedAttribute",
        id: "rep_performance_2",
        title: "Rep Performance (2)",
        description: "Sales rep performance band",
        tags: ["sales"],
        expression: MAQL,
        dataType: "STRING",
        locale: "en-US",
    };

    it("takes the id from the YAML, not the copied source", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({
                type: "computed_attribute",
                id: "renamed_id",
                maql: MAQL,
            }),
        );
        expect(merged.id).toBe("renamed_id");
        expect(merged.dataType).toBe("STRING");
    });

    it("drops the id when removed from the YAML so the server derives one", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        );
        expect(merged).not.toHaveProperty("id");
        expect(merged.dataType).toBe("STRING");
    });

    it("clears the collation when the locale line is removed", () => {
        const merged = reconcileComputedAttributeDefinition(
            copied,
            computedAttributeYamlToDefinition({ type: "computed_attribute", maql: MAQL }),
        );
        expect(merged.locale).toBeUndefined();
    });
});
