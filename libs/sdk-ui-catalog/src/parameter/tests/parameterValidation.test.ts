// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ParameterType } from "@gooddata/sdk-model";

import { validateParameterYaml } from "../parameterValidation.js";

const NUMBER_ONLY: ParameterType[] = ["NUMBER"];
const ALL_TYPES: ParameterType[] = ["NUMBER", "STRING"];

function validate(yaml: string, options: { enabledTypes?: ParameterType[]; fixedIdentifier?: string } = {}) {
    const { enabledTypes = NUMBER_ONLY, ...rest } = options;
    return validateParameterYaml(yaml, { enabledTypes, ...rest });
}

describe("validateParameterYaml", () => {
    it("parses valid numeric parameter YAML", () => {
        const result = validate(`id: threshold
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
        const result = validate(`definition:
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
        const result = validate(`tags: [alerts, monitoring]
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
        const result = validate(`definition:
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
        expect(validate("")).toEqual({
            isValid: false,
            errorCode: "empty",
        });
    });

    it("rejects whitespace-only input", () => {
        expect(validate("   \n  \n  ")).toEqual({
            isValid: false,
            errorCode: "empty",
        });
    });

    it("rejects YAML syntax errors", () => {
        const result = validate("id: [foo");

        expect(result).toEqual({
            isValid: false,
            errorCode: "syntax",
        });
    });

    it("rejects invalid top-level structure (plain scalar)", () => {
        const result = validate("just a string");

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects invalid top-level structure (array)", () => {
        const result = validate("- item1\n- item2");

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects missing definition key", () => {
        const result = validate(`id: test
title: "Test"
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidStructure",
        });
    });

    it("rejects non-numeric default values", () => {
        const result = validate(`definition:
  type: NUMBER
  defaultValue: foo
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidDefaultValue",
            type: "NUMBER",
        });
    });

    it("rejects boolean default values for NUMBER type", () => {
        const result = validate(`definition:
  type: NUMBER
  defaultValue: true
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidDefaultValue",
            type: "NUMBER",
        });
    });

    it("rejects non-numeric constraints", () => {
        const result = validate(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: low
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraints",
            type: "NUMBER",
        });
    });

    it("rejects invalid constraint ranges (min > max)", () => {
        const result = validate(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 20
    max: 5
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraintRange",
            type: "NUMBER",
        });
    });

    it("rejects non-string tags", () => {
        const result = validate(`tags:
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
        const result = validate(`unknown: value
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
        const result = validate(
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
        const result = validate(`definition:
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
        const result = validate(`definition:
  type: NUMBER
  defaultValue: 10
  constraints:
    min: 0
    step: 1
`);

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidConstraints",
            type: "NUMBER",
        });
    });

    describe("string parameters disabled (flag off)", () => {
        it("rejects a STRING definition as unsupported regardless of a valid body", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
`,
                { enabledTypes: NUMBER_ONLY },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "unsupportedType",
            });
        });

        it("classifies a STRING definition with a bad body as unsupportedType, not invalidDefaultValue", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: 5
`,
                { enabledTypes: NUMBER_ONLY },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "unsupportedType",
            });
        });
    });

    describe("string parameters enabled (flag on)", () => {
        it("parses a valid STRING definition", () => {
            const result = validate(
                `id: scenario
definition:
  type: STRING
  defaultValue: Actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    id: "scenario",
                    definition: {
                        type: "STRING",
                        defaultValue: "Actual",
                    },
                },
            });
        });

        it("rejects a non-string default value", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: 5
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidDefaultValue",
                type: "STRING",
            });
        });

        it("parses a STRING definition with length constraints", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    minLength: 1
    maxLength: 10
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    definition: {
                        type: "STRING",
                        defaultValue: "Actual",
                        constraints: {
                            minLength: 1,
                            maxLength: 10,
                        },
                    },
                },
            });
        });

        it("rejects invalid length constraint ranges (minLength > maxLength)", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    minLength: 10
    maxLength: 5
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidConstraintRange",
                type: "STRING",
            });
        });

        it("rejects negative length constraints", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    minLength: -1
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidConstraints",
                type: "STRING",
            });
        });

        it("rejects non-integer length constraints", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    maxLength: 2.5
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidConstraints",
                type: "STRING",
            });
        });
    });
});
