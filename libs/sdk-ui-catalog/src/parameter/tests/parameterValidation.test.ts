// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { validateParameterYaml } from "../parameterValidation.js";

describe("validateParameterYaml", () => {
    it("parses valid numeric parameter YAML", () => {
        const result = validateParameterYaml(`id: threshold
title: "Threshold"
description: "Alert threshold"
tags:
  - alerts

definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 0
    max: 100
`);

        expect(result).toEqual({
            isValid: true,
            parameter: {
                type: "parameter",
                id: "threshold",
                title: "Threshold",
                description: "Alert threshold",
                tags: ["alerts"],
                definition: {
                    type: "NUMBER",
                    defaultValue: 10,
                    constraints: {
                        min: 0,
                        max: 100,
                    },
                },
            },
        });
    });

    it("parses minimal valid YAML with only definition", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: 5
`);

        expect(result).toEqual({
            isValid: true,
            parameter: {
                type: "parameter",
                definition: {
                    type: "NUMBER",
                    defaultValue: 5,
                },
            },
        });
    });

    it("parses YAML with inline tags array", () => {
        const result = validateParameterYaml(`tags: [alerts, monitoring]
definition:
  type: NUMBER
  defaultValue: 0
`);

        expect(result).toEqual({
            isValid: true,
            parameter: {
                type: "parameter",
                tags: ["alerts", "monitoring"],
                definition: {
                    type: "NUMBER",
                    defaultValue: 0,
                },
            },
        });
    });

    it("parses YAML with negative and decimal default values", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: -3.14
`);

        expect(result).toEqual({
            isValid: true,
            parameter: {
                type: "parameter",
                definition: {
                    type: "NUMBER",
                    defaultValue: -3.14,
                },
            },
        });
    });

    it("rejects empty input", () => {
        expect(validateParameterYaml("")).toEqual({
            isValid: false,
            errorCode: "empty",
        });
    });

    it("rejects whitespace-only input", () => {
        expect(validateParameterYaml("   \n  \n  ")).toEqual({
            isValid: false,
            errorCode: "empty",
        });
    });

    it("rejects YAML syntax errors", () => {
        const result = validateParameterYaml("id: [foo");

        expect(result).toEqual({
            isValid: false,
            errorCode: "syntax",
        });
    });

    it("rejects invalid top-level structure (plain scalar)", () => {
        const result = validateParameterYaml("just a string");

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects invalid top-level structure (array)", () => {
        const result = validateParameterYaml("- item1\n- item2");

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects missing definition key", () => {
        const result = validateParameterYaml(`id: test
title: "Test"
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects unsupported parameter types", () => {
        const result = validateParameterYaml(`definition:
  type: STRING
  defaultValue: foo
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "unsupportedType",
        });
    });

    it("rejects non-numeric default values", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: foo
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidDefaultValue",
        });
    });

    it("rejects boolean default values for NUMBER type", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: true
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidDefaultValue",
        });
    });

    it("rejects non-numeric constraints", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: low
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraints",
        });
    });

    it("rejects invalid constraint ranges (min > max)", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 20
    max: 5
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraintRange",
        });
    });

    it("rejects non-string tags", () => {
        const result = validateParameterYaml(`tags:
  - 123
definition:
  type: NUMBER
  defaultValue: 0
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidTags",
        });
    });

    it("rejects additional/unknown top-level properties", () => {
        const result = validateParameterYaml(`unknown: value
definition:
  type: NUMBER
  defaultValue: 10
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects id changes when a fixed identifier is required", () => {
        const result = validateParameterYaml(
            `id: another
definition:
  type: NUMBER
  defaultValue: 10
`,
            { fixedIdentifier: "test" },
        );

        expect(result).toEqual({
            isValid: false,
            errorCode: "idImmutable",
        });
    });

    it("rejects unknown properties inside definition", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: 10
  extra: true
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects unknown properties inside constraints", () => {
        const result = validateParameterYaml(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 0
    step: 1
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraints",
        });
    });
});
