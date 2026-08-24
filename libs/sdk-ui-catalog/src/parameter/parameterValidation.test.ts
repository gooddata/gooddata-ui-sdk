// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ParameterType } from "@gooddata/sdk-model";

import { type ParameterDraft, serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";

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

        it("rejects an empty allowedValues list", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues: []
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "emptyAllowedValues",
                type: "STRING",
            });
        });

        it("rejects an allowedValues entry with an empty value", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: ""
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValue",
                type: "STRING",
            });
        });

        it("rejects an allowedValues entry missing its value", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - title: Actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValue",
                type: "STRING",
            });
        });

        it("rejects an allowedValues entry with a non-string value", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: 5
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValue",
                type: "STRING",
            });
        });

        it("rejects an allowedValues entry with a blank explicit title", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        title: "   "
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValueTitle",
                type: "STRING",
            });
        });

        it("rejects a whitespace-only value with no title (blank effective title)", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: " "
  constraints:
    allowedValues:
      - value: " "
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValueTitle",
                type: "STRING",
            });
        });

        it("rejects an allowedValues entry with a non-string title", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        title: 5
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidAllowedValueTitle",
                type: "STRING",
            });
        });

        it("accepts a whitespace-only value that carries a real title", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: " "
  constraints:
    allowedValues:
      - value: " "
        title: Blank
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    definition: {
                        type: "STRING",
                        defaultValue: " ",
                        constraints: {
                            allowedValues: [{ value: " ", title: "Blank" }],
                        },
                    },
                },
            });
        });

        it("rejects duplicate allowedValues values", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
      - value: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "duplicateAllowedValues",
                type: "STRING",
            });
        });

        it("rejects duplicate effective allowedValues titles", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        title: Shared
      - value: budget
        title: Shared
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "duplicateAllowedValues",
                type: "STRING",
            });
        });

        it("treats a title colliding with another entry's value-as-title as a duplicate", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
      - value: budget
        title: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "duplicateAllowedValues",
                type: "STRING",
            });
        });

        it("does not treat case-differing values as duplicates", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    allowedValues:
      - value: Actual
      - value: actual
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
                            allowedValues: [{ value: "Actual" }, { value: "actual" }],
                        },
                    },
                },
            });
        });

        it("rejects a defaultValue that is not among allowedValues", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: forecast
  constraints:
    allowedValues:
      - value: actual
      - value: budget
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidDefaultValue",
                type: "STRING",
            });
        });

        it("accepts a defaultValue that is among allowedValues", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: budget
  constraints:
    allowedValues:
      - value: actual
      - value: budget
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    definition: {
                        type: "STRING",
                        defaultValue: "budget",
                        constraints: {
                            allowedValues: [{ value: "actual" }, { value: "budget" }],
                        },
                    },
                },
            });
        });

        it("rejects allowedValues combined with minLength", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    minLength: 1
    allowedValues:
      - value: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "constraintsAllowedValuesExclusive",
                type: "STRING",
            });
        });

        it("rejects allowedValues combined with maxLength", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    maxLength: 10
    allowedValues:
      - value: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "constraintsAllowedValuesExclusive",
                type: "STRING",
            });
        });

        it("accepts cardinality single and strips it from the parse output", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  cardinality: single
  constraints:
    allowedValues:
      - value: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    definition: {
                        type: "STRING",
                        defaultValue: "actual",
                        constraints: {
                            allowedValues: [{ value: "actual" }],
                        },
                    },
                },
            });
        });

        it("rejects cardinality multi as unsupported", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  cardinality: multi
  constraints:
    allowedValues:
      - value: actual
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "unsupportedCardinality",
                type: "STRING",
            });
        });

        it("rejects a bogus cardinality value as unsupported", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  cardinality: both
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: false,
                errorCode: "unsupportedCardinality",
                type: "STRING",
            });
        });

        it("parses a STRING definition with allowedValues in order", () => {
            const result = validate(
                `definition:
  type: STRING
  defaultValue: actual
  constraints:
    allowedValues:
      - value: actual
        title: Actual
      - value: budget
`,
                { enabledTypes: ALL_TYPES },
            );

            expect(result).toEqual({
                isValid: true,
                parameter: {
                    type: "parameter",
                    definition: {
                        type: "STRING",
                        defaultValue: "actual",
                        constraints: {
                            allowedValues: [{ value: "actual", title: "Actual" }, { value: "budget" }],
                        },
                    },
                },
            });
        });
    });
});

describe("a type behind a feature flag", () => {
    const draft: ParameterDraft = {
        type: "parameter",
        id: "p1",
        title: "My Param",
        description: "",
        tags: [],
        definition: { type: "STRING", defaultValue: "abc" },
    };
    const stringParameter = serializeParameterToYaml(draft);

    it("is rejected as an unsupported type while the type is not enabled", () => {
        const result = validateParameterYaml(stringParameter, { enabledTypes: ["NUMBER"] });

        expect(result.isValid).toBe(false);
        expect(result.isValid === false && result.errorCode).toBe("unsupportedType");
    });

    it("is accepted once the type is enabled, from the very same document", () => {
        expect(validateParameterYaml(stringParameter, { enabledTypes: ["NUMBER", "STRING"] }).isValid).toBe(
            true,
        );
    });
});
