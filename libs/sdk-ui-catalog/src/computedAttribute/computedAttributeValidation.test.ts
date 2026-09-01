// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { validateComputedAttributeYaml } from "./computedAttributeValidation.js";

const MAQL = 'SELECT CASE WHEN {metric/won_activities} > 50 THEN "High" ELSE "Low" END';

describe("validateComputedAttributeYaml", () => {
    it("parses a valid computed attribute definition", () => {
        const result = validateComputedAttributeYaml(`type: computed_attribute
id: rep_performance
title: Rep Performance
description: Sales rep performance band
tags:
  - sales

maql: ${MAQL}
locale: en-US
`);

        expect(result).toEqual({
            isValid: true,
            computedAttribute: {
                type: "computedAttribute",
                id: "rep_performance",
                title: "Rep Performance",
                description: "Sales rep performance band",
                tags: ["sales"],
                expression: MAQL,
                locale: "en-US",
            },
        });
    });

    it("parses a minimal definition with only maql", () => {
        expect(validateComputedAttributeYaml(`maql: SELECT 1`)).toEqual({
            isValid: true,
            computedAttribute: {
                type: "computedAttribute",
                title: "",
                description: "",
                tags: [],
                expression: "SELECT 1",
            },
        });
    });

    it.each([`id:`, `id: `, `id: "   "`])(
        "ignores a blank id (%s), leaving the identity to the server",
        (idLine) => {
            const result = validateComputedAttributeYaml(`${idLine}\nmaql: SELECT 1`);

            expect(result.isValid).toBe(true);
            expect(result.isValid && result.computedAttribute).not.toHaveProperty("id");
        },
    );

    it("rejects an empty definition", () => {
        expect(validateComputedAttributeYaml("   ")).toEqual({ isValid: false, errorCode: "empty" });
    });

    it("rejects invalid YAML syntax", () => {
        expect(validateComputedAttributeYaml("maql: [unclosed")).toEqual({
            isValid: false,
            errorCode: "syntax",
        });
    });

    it("rejects a definition missing maql", () => {
        expect(validateComputedAttributeYaml(`title: No expression`)).toEqual({
            isValid: false,
            errorCode: "missingMaql",
        });
    });

    it.each(["computedAttribute", "computed attribute", "metric"])(
        "names the expected type when the author mistypes it as %s",
        (type) => {
            expect(validateComputedAttributeYaml(`type: ${type}\nmaql: SELECT 1`)).toEqual({
                isValid: false,
                errorCode: "invalidType",
            });
        },
    );

    it("reports a blank maql line - the create template's state - as missing, not malformed", () => {
        expect(validateComputedAttributeYaml(`title: Draft\ndescription: ""\nmaql:`)).toEqual({
            isValid: false,
            errorCode: "missingMaql",
        });
        expect(validateComputedAttributeYaml(`title: Draft\ndescription: ""\nmaql: `)).toEqual({
            isValid: false,
            errorCode: "missingMaql",
        });
    });

    it("rejects a present but non-string maql as a structural error rather than missing", () => {
        expect(validateComputedAttributeYaml(`maql:\n  nested: value`)).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects non-string tags", () => {
        expect(validateComputedAttributeYaml(`maql: SELECT 1\ntags: 5`)).toEqual({
            isValid: false,
            errorCode: "invalidTags",
        });
    });

    // The bucketing sugar the design mocked up (using/buckets) is not part of the entity, so it must
    // not silently pass through as an unknown field.
    it("rejects unknown fields", () => {
        expect(validateComputedAttributeYaml(`maql: SELECT 1\nusing: customer_age`)).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects changing a fixed identifier in edit mode", () => {
        expect(
            validateComputedAttributeYaml(`id: changed\nmaql: SELECT 1`, {
                fixedIdentifier: "original",
            }),
        ).toEqual({ isValid: false, errorCode: "idImmutable" });
    });

    it("accepts an unchanged fixed identifier in edit mode", () => {
        expect(
            validateComputedAttributeYaml(`id: original\nmaql: SELECT 1`, {
                fixedIdentifier: "original",
            }).isValid,
        ).toBe(true);
    });
});
