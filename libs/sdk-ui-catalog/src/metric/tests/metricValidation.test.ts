// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { validateMetricYaml } from "../metricValidation.js";

describe("validateMetricYaml", () => {
    it("parses a valid metric definition", () => {
        const result = validateMetricYaml(`type: metric
id: revenue.total
title: Total Revenue
description: Sum of all order amounts
tags:
  - finance

maql: SELECT SUM({fact/order_amount})
format: "#,##0.00"
`);

        expect(result).toEqual({
            isValid: true,
            measure: {
                type: "measure",
                id: "revenue.total",
                title: "Total Revenue",
                description: "Sum of all order amounts",
                tags: ["finance"],
                expression: "SELECT SUM({fact/order_amount})",
                format: "#,##0.00",
            },
        });
    });

    it("parses a minimal definition with only maql", () => {
        const result = validateMetricYaml(`maql: SELECT 1`);
        expect(result).toEqual({
            isValid: true,
            measure: {
                type: "measure",
                title: "",
                description: "",
                tags: [],
                expression: "SELECT 1",
                format: "",
            },
        });
    });

    it("rejects an empty definition", () => {
        expect(validateMetricYaml("   ")).toEqual({ isValid: false, errorCode: "empty" });
    });

    it("rejects invalid YAML syntax", () => {
        expect(validateMetricYaml("maql: [unclosed")).toEqual({ isValid: false, errorCode: "syntax" });
    });

    it("rejects a definition missing maql", () => {
        expect(validateMetricYaml(`title: No expression`)).toEqual({
            isValid: false,
            errorCode: "missingMaql",
        });
    });

    it("rejects a present but non-string maql as a structural error rather than missing", () => {
        expect(validateMetricYaml(`maql:\n  nested: value`)).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects non-string tags", () => {
        expect(validateMetricYaml(`maql: SELECT 1\ntags: 5`)).toEqual({
            isValid: false,
            errorCode: "invalidTags",
        });
    });

    it("rejects unknown fields", () => {
        expect(validateMetricYaml(`maql: SELECT 1\nunexpected: true`)).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects changing a fixed identifier in edit mode", () => {
        const result = validateMetricYaml(`id: changed\nmaql: SELECT 1`, {
            fixedIdentifier: "original",
        });
        expect(result).toEqual({ isValid: false, errorCode: "idImmutable" });
    });

    it("accepts an unchanged fixed identifier in edit mode", () => {
        const result = validateMetricYaml(`id: original\nmaql: SELECT 1`, {
            fixedIdentifier: "original",
        });
        expect(result.isValid).toBe(true);
    });
});
