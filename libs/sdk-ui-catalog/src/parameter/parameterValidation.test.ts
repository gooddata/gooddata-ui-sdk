// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { ParameterType, ScalarParameterType } from "@gooddata/sdk-model";

import { type ParameterDraft, serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";

const NUMBER_ONLY: ScalarParameterType[] = ["NUMBER"];
const ALL_TYPES: ScalarParameterType[] = ["NUMBER", "STRING"];

function validate(
    yaml: string,
    options: { enabledTypes?: ScalarParameterType[]; fixedIdentifier?: string } = {},
) {
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
            path: ["definition"],
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
            path: ["definition", "defaultValue"],
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
            path: ["definition", "defaultValue"],
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
            path: ["definition", "constraints", "min"],
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
            path: ["definition", "constraints"],
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
            path: ["tags", 0],
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
            path: ["unknown"],
            target: "key",
        });
    });

    it.each([`id:`, `id: `, `id: "   "`])(
        "ignores a blank id (%s), leaving the identity to the server",
        (idLine) => {
            const result = validate(`${idLine}
definition:
  type: NUMBER
  defaultValue: 10
`);

            expect(result.isValid).toBe(true);
            expect(result.isValid && result.parameter).not.toHaveProperty("id");
        },
    );

    it.each(["parameters", "computed_attribute", "Parameter"])(
        "names the expected type when the author mistypes the object's own type as %s",
        (type) => {
            const result = validate(`type: ${type}
definition:
  type: NUMBER
  defaultValue: 10
`);

            expect(result).toEqual({
                isValid: false,
                errorCode: "invalidType",
                path: ["type"],
            });
        },
    );

    it("keeps the object's type and the model type apart when both are wrong", () => {
        const result = validate(
            `type: parameters
definition:
  type: STRING
  defaultValue: Actual
`,
            { enabledTypes: NUMBER_ONLY },
        );

        expect(result).toEqual({
            isValid: false,
            errorCode: "invalidType",
            path: ["type"],
        });
    });

    it("rejects a blanked id while editing, where the identity is fixed", () => {
        const result = validate(
            `id:
definition:
  type: NUMBER
  defaultValue: 10
`,
            { fixedIdentifier: "test" },
        );

        expect(result).toEqual({
            isValid: false,
            errorCode: "idImmutable",
            path: ["id"],
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
            path: ["id"],
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
            path: ["definition", "extra"],
            target: "key",
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
            path: ["definition", "constraints", "step"],
            target: "key",
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
                path: ["definition", "type"],
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
                path: ["definition", "type"],
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
                path: ["definition", "defaultValue"],
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
                path: ["definition", "constraints"],
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
                path: ["definition", "constraints", "minLength"],
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
                path: ["definition", "constraints", "maxLength"],
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
                path: ["definition", "constraints", "allowedValues"],
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
                path: ["definition", "constraints", "allowedValues", 0],
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
                path: ["definition", "constraints", "allowedValues", 0, "value"],
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
                path: ["definition", "constraints", "allowedValues", 0, "value"],
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
                path: ["definition", "constraints", "allowedValues", 0],
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
                path: ["definition", "constraints", "allowedValues", 0],
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
                path: ["definition", "constraints", "allowedValues", 0, "title"],
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
                path: ["definition", "constraints", "allowedValues"],
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
                path: ["definition", "constraints", "allowedValues"],
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
                path: ["definition", "constraints", "allowedValues"],
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
                path: ["definition", "defaultValue"],
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
                path: ["definition", "constraints"],
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
                path: ["definition", "constraints"],
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
                path: ["definition", "cardinality"],
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
                path: ["definition", "cardinality"],
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

describe("date range parameters", () => {
    const WITH_DATE_RANGE: ParameterType[] = ["NUMBER", "DATE_RANGE"];

    function validatePeriod(period: string, enabledTypes = WITH_DATE_RANGE) {
        return validateParameterYaml(
            `id: most_recent_13_months
title: Most Recent 13 Months
tags: [published]
definition:
  type: DATE_RANGE
  defaultValue:
${period}`,
            { enabledTypes },
        );
    }

    it("parses a period with both ends", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: 2025-08\n    to: 2026-08\n")).toEqual({
            isValid: true,
            parameter: {
                type: "parameter",
                id: "most_recent_13_months",
                title: "Most Recent 13 Months",
                tags: ["published"],
                definition: {
                    type: "DATE_RANGE",
                    defaultValue: { granularity: "MONTH", from: "2025-08", to: "2026-08" },
                },
            },
        });
    });

    it("parses a period open at one end", () => {
        const result = validatePeriod("    granularity: DAY\n    to: 2026-08-14\n");

        expect(result.isValid && result.parameter.definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: "DAY", to: "2026-08-14" },
        });
    });

    it("takes a year written without quotes as its text", () => {
        const result = validatePeriod("    granularity: YEAR\n    from: 2025\n");

        expect(result.isValid && result.parameter.definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: "YEAR", from: "2025" },
        });
    });

    it("accepts every granularity the backend accepts", () => {
        const periods = [
            "    granularity: QUARTER\n    from: 2025-3\n",
            "    granularity: WEEK\n    from: 2025-33\n",
            "    granularity: HOUR\n    from: 2025-08-14 13\n",
            "    granularity: MINUTE\n    from: 2025-08-14 13:30\n",
            "    granularity: SECOND\n    from: 2025-08-14 13:30:45\n",
        ];

        expect(periods.map((period) => validatePeriod(period).isValid)).toEqual([
            true,
            true,
            true,
            true,
            true,
        ]);
    });

    it("rejects a DATE_RANGE definition as unsupported while the type is not enabled", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: 2025-08\n", ["NUMBER", "STRING"])).toEqual({
            isValid: false,
            errorCode: "unsupportedType",
            path: ["definition", "type"],
        });
    });

    it("rejects a granularity the backend does not accept", () => {
        expect(validatePeriod("    granularity: month\n    from: 2025-08\n")).toEqual({
            isValid: false,
            errorCode: "unsupportedGranularity",
            type: "DATE_RANGE",
            path: ["definition", "defaultValue", "granularity"],
        });
    });

    it("rejects a missing granularity", () => {
        expect(validatePeriod("    from: 2025-08\n")).toMatchObject({
            isValid: false,
            errorCode: "unsupportedGranularity",
            path: ["definition", "defaultValue", "granularity"],
        });
    });

    it("names the start when it does not match the granularity", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: 2026-13\n    to: 2026-12\n")).toEqual({
            isValid: false,
            errorCode: "invalidPeriodValue",
            period: { field: "from", granularity: "MONTH" },
            path: ["definition", "defaultValue", "from"],
        });
    });

    it("names the end when it is not a real date", () => {
        expect(validatePeriod("    granularity: DAY\n    from: 2025-02-01\n    to: 2025-02-30\n")).toEqual({
            isValid: false,
            errorCode: "invalidPeriodValue",
            period: { field: "to", granularity: "DAY" },
            path: ["definition", "defaultValue", "to"],
        });
    });

    it("names an end that is not text", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: true\n")).toEqual({
            isValid: false,
            errorCode: "invalidPeriodValue",
            period: { field: "from", granularity: "MONTH" },
            path: ["definition", "defaultValue", "from"],
        });
    });

    it("rejects a period with neither end", () => {
        expect(validatePeriod("    granularity: MONTH\n")).toEqual({
            isValid: false,
            errorCode: "emptyPeriod",
            type: "DATE_RANGE",
            path: ["definition", "defaultValue"],
        });
    });

    it("rejects a start after the end", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: 2026-08\n    to: 2025-08\n")).toEqual({
            isValid: false,
            errorCode: "invalidPeriodOrder",
            type: "DATE_RANGE",
            path: ["definition", "defaultValue"],
        });
    });

    it("rejects the period written directly under definition", () => {
        const result = validateParameterYaml(
            `definition:
  type: DATE_RANGE
  granularity: MONTH
  from: 2025-08
`,
            { enabledTypes: WITH_DATE_RANGE },
        );

        expect(result).toMatchObject({
            isValid: false,
            errorCode: "invalidDefaultValue",
            type: "DATE_RANGE",
        });
    });

    it("rejects an unknown key in the period", () => {
        expect(validatePeriod("    granularity: MONTH\n    from: 2025-08\n    until: 2026-08\n")).toEqual({
            isValid: false,
            errorCode: "invalidDefaultValue",
            type: "DATE_RANGE",
            path: ["definition", "defaultValue", "until"],
            target: "key",
        });
    });
});
