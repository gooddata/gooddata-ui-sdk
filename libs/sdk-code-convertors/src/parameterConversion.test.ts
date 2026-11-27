// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import type { DateRangeParameterValue, Parameter } from "@gooddata/sdk-code-schemas/v1";

import { declarativeParameterToYaml } from "./from/declarativeParameterToYaml.js";
import { yamlParameterToDeclarative } from "./to/yamlParameterToDeclarative.js";
import {
    type DeclarativeNumberParameter,
    type DeclarativeStringParameter,
    isDeclarativeCodeParameter,
    isDeclarativeDateRangeParameter,
    isDeclarativeNumberParameter,
    isDeclarativeStringParameter,
} from "./utils/parameterUtils.js";

describe("parameter conversion", () => {
    const freeTextParameter: Parameter = {
        type: "parameter",
        id: "scenario",
        title: "Scenario",
        description: "Selects the planning scenario used in metric computation.",
        tags: ["category"],
        definition: {
            type: "STRING",
            defaultValue: "Actual",
        },
    };

    describe("yamlParameterToDeclarative", () => {
        it("should convert a free-text string parameter to declarative format", () => {
            const result = yamlParameterToDeclarative(freeTextParameter);

            expect(result.id).toBe("scenario");
            expect(result.title).toBe("Scenario");
            expect(result.description).toBe("Selects the planning scenario used in metric computation.");
            expect(result.tags).toEqual(["category"]);
            expect(result.content).toEqual({
                type: "STRING",
                defaultValue: "Actual",
            });
        });

        it("should not emit constraints for a string parameter that has none", () => {
            const result = yamlParameterToDeclarative(freeTextParameter);

            expect(result.content).not.toHaveProperty("constraints");
        });

        it("should convert string length constraints", () => {
            const result = yamlParameterToDeclarative({
                ...freeTextParameter,
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: { minLength: 1, maxLength: 50 },
                },
            });

            expect(result.content).toEqual({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50 },
            });
        });

        it("should carry only the bound that is set, with no phantom keys", () => {
            const minLength = yamlParameterToDeclarative({
                ...freeTextParameter,
                definition: { type: "STRING", defaultValue: "Actual", constraints: { minLength: 1 } },
            });
            const maxLength = yamlParameterToDeclarative({
                ...freeTextParameter,
                definition: { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 50 } },
            });

            expect(minLength.content).toStrictEqual({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1 },
            });
            expect(maxLength.content).toStrictEqual({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { maxLength: 50 },
            });
        });

        it("should convert allowed values with and without titles", () => {
            const result = yamlParameterToDeclarative({
                ...freeTextParameter,
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: {
                        allowedValues: [{ value: "Actual", title: "Actuals" }, { value: "Plan" }],
                    },
                },
            });

            expect(result.content).toEqual({
                type: "STRING",
                defaultValue: "Actual",
                constraints: {
                    allowedValues: [{ value: "Actual", title: "Actuals" }, { value: "Plan" }],
                },
            });
        });

        it("should derive title from id and default description and tags", () => {
            const result = yamlParameterToDeclarative({
                type: "parameter",
                id: "planning_scenario",
                definition: { type: "STRING", defaultValue: "" },
            });

            expect(result.title).toBe("Planning Scenario");
            expect(result.description).toBe("");
            expect(result.tags).toEqual([]);
        });
    });

    describe("isDeclarativeStringParameter", () => {
        it("accepts a textual parameter", () => {
            expect(
                isDeclarativeStringParameter({
                    id: "scenario",
                    title: "Scenario",
                    content: { type: "STRING", defaultValue: "Actual" },
                }),
            ).toBe(true);
        });

        it("rejects a numeric parameter", () => {
            expect(
                isDeclarativeStringParameter({
                    id: "target_margin",
                    title: "Target Margin",
                    content: { type: "NUMBER", defaultValue: 10 },
                }),
            ).toBe(false);
        });
    });

    describe("isDeclarativeCodeParameter", () => {
        it("accepts textual and numeric parameters, the types code can represent", () => {
            const textual = { id: "a", title: "A", content: { type: "STRING" as const, defaultValue: "x" } };
            const numeric = { id: "b", title: "B", content: { type: "NUMBER" as const, defaultValue: 1 } };
            expect(isDeclarativeCodeParameter(textual)).toBe(true);
            expect(isDeclarativeCodeParameter(numeric)).toBe(true);
            expect(isDeclarativeNumberParameter(numeric)).toBe(true);
            expect(isDeclarativeNumberParameter(textual)).toBe(false);
        });
    });

    describe("numeric parameters", () => {
        const numericParameter: Parameter = {
            type: "parameter",
            id: "target_margin",
            title: "Target margin",
            description: "",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
        };

        it("should convert a bounded numeric parameter to declarative format", () => {
            expect(yamlParameterToDeclarative(numericParameter)).toEqual({
                id: "target_margin",
                title: "Target margin",
                description: "",
                tags: [],
                content: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
            });
        });

        it("should carry only the bound that is set, with no phantom keys", () => {
            const { content } = yamlParameterToDeclarative({
                ...numericParameter,
                definition: { type: "NUMBER", defaultValue: 10, constraints: { max: 100 } },
            });
            expect(content).toEqual({ type: "NUMBER", defaultValue: 10, constraints: { max: 100 } });
        });

        it("should not emit constraints for an unbounded numeric parameter", () => {
            const { content } = yamlParameterToDeclarative({
                ...numericParameter,
                definition: { type: "NUMBER", defaultValue: 0 },
            });
            expect(content).toEqual({ type: "NUMBER", defaultValue: 0 });
        });

        it("should round-trip a numeric parameter through YAML", () => {
            const declarative: DeclarativeNumberParameter = {
                id: "target_margin",
                title: "Target margin",
                description: "",
                tags: [],
                content: { type: "NUMBER", defaultValue: 10.5, constraints: { min: -1, max: 100 } },
            };
            const { content, json } = declarativeParameterToYaml(declarative);
            expect(content).toContain("type: NUMBER");
            expect(content).toContain("defaultValue: 10.5");
            expect(json.definition).toEqual({
                type: "NUMBER",
                defaultValue: 10.5,
                constraints: { min: -1, max: 100 },
            });
            expect(yamlParameterToDeclarative(json)).toEqual(declarative);
        });

        it("should omit an empty constraints mapping the server may send", () => {
            const { json } = declarativeParameterToYaml({
                id: "n",
                title: "N",
                content: { type: "NUMBER", defaultValue: 1, constraints: {} },
            });
            expect(json.definition).toEqual({ type: "NUMBER", defaultValue: 1 });
        });
    });

    describe("declarativeParameterToYaml", () => {
        it("should convert a declarative string parameter to YAML", () => {
            const declarative = yamlParameterToDeclarative(freeTextParameter);
            const { json, content } = declarativeParameterToYaml(declarative);

            expect(json).toEqual(freeTextParameter);
            expect(content).toContain("type: parameter");
            expect(content).toContain("id: scenario");
            expect(content).toContain("definition:");
            expect(content).toContain("type: STRING");
            expect(content).toContain("defaultValue: Actual");
        });

        it("should round-trip a free-text string parameter", () => {
            const declarative = yamlParameterToDeclarative(freeTextParameter);
            const { json } = declarativeParameterToYaml(declarative);

            expect(yamlParameterToDeclarative(json)).toEqual(declarative);
        });

        it("should round-trip a default value carrying quotes, apostrophes and non-ASCII", () => {
            const awkward: Parameter = {
                ...freeTextParameter,
                definition: {
                    type: "STRING",
                    defaultValue: `Say "it's" \\ scénario`,
                },
            };
            const declarative = yamlParameterToDeclarative(awkward);
            const { json } = declarativeParameterToYaml(declarative);

            expect(json.definition).toEqual(awkward.definition);
        });

        it("should round-trip allowed values", () => {
            const enumerated: Parameter = {
                ...freeTextParameter,
                definition: {
                    type: "STRING",
                    defaultValue: "Plan",
                    constraints: {
                        allowedValues: [{ value: "Actual", title: "Actuals" }, { value: "Plan" }],
                    },
                },
            };
            const declarative = yamlParameterToDeclarative(enumerated);
            const { json } = declarativeParameterToYaml(declarative);

            expect(json.definition).toEqual(enumerated.definition);
        });

        it("should omit an empty constraints mapping the server may send", () => {
            const declarative: DeclarativeStringParameter = {
                id: "scenario",
                title: "Scenario",
                description: "",
                tags: [],
                content: { type: "STRING", defaultValue: "Actual", constraints: {} },
            };
            const { json, content } = declarativeParameterToYaml(declarative);

            expect(json.definition).toEqual({ type: "STRING", defaultValue: "Actual" });
            expect(content).not.toContain("constraints");
        });

        it("should emit only the bound that is set, with no phantom keys", () => {
            const { json, content } = declarativeParameterToYaml({
                id: "scenario",
                title: "Scenario",
                description: "",
                tags: [],
                content: { type: "STRING", defaultValue: "Actual", constraints: { minLength: 1 } },
            });

            expect(json.definition).toStrictEqual({
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1 },
            });
            expect(content).not.toContain("maxLength");
        });

        it("should treat an empty allowed values list as free text", () => {
            const declarative: DeclarativeStringParameter = {
                id: "scenario",
                title: "Scenario",
                description: "",
                tags: [],
                content: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: { allowedValues: [] },
                },
            };
            const { json } = declarativeParameterToYaml(declarative);

            expect(json.definition).toEqual({ type: "STRING", defaultValue: "Actual" });
        });
    });

    describe("date range parameters", () => {
        type Granularity = DateRangeParameterValue["granularity"];
        type Range = { from?: string; to?: string };
        const periodsByGranularity: Array<[Granularity, string, string]> = [
            ["YEAR", "2024", "2025"],
            ["QUARTER", "2024-4", "2025-1"],
            ["MONTH", "2024-11", "2025-11"],
            ["WEEK", "2024-01", "2024-52"],
            ["DAY", "2024-11-01", "2025-11-30"],
            ["HOUR", "2024-11-01 08", "2024-11-01 17"],
            ["MINUTE", "2024-11-01 08:00", "2024-11-01 08:30"],
            ["SECOND", "2024-11-01 08:00:00", "2024-11-01 08:00:59"],
        ];
        const ranges = periodsByGranularity.flatMap(
            ([granularity, from, to]): Array<[string, Granularity, Range]> => [
                ["closed", granularity, { from, to }],
                ["open start", granularity, { to }],
                ["open end", granularity, { from }],
            ],
        );
        const period = (granularity: Granularity, range: Range): Parameter => ({
            type: "parameter",
            id: "reporting_period",
            title: "Reporting period",
            definition: { type: "DATE_RANGE", defaultValue: { granularity, ...range } },
        });

        it.each(ranges)(
            "round-trips a %s %s range unchanged, through the YAML text too",
            (_, granularity, range) => {
                const input = period(granularity, range);

                const declarative = yamlParameterToDeclarative(input);
                const { json, content } = declarativeParameterToYaml(declarative);

                expect(declarative.content).toStrictEqual({
                    type: "DATE_RANGE",
                    defaultValue: { granularity, ...range },
                });
                expect(json).toStrictEqual(input);
                expect(yamlParameterToDeclarative(parse(content) as Parameter)).toStrictEqual(declarative);
            },
        );

        it.each(periodsByGranularity.filter(([granularity]) => granularity !== "YEAR"))(
            "writes both ends of a %s range without quotes, as the catalog editor does",
            (granularity, from, to) => {
                const { content } = declarativeParameterToYaml({
                    id: "reporting_period",
                    title: "Reporting period",
                    content: { type: "DATE_RANGE", defaultValue: { granularity, from, to } },
                });

                expect(content).toContain(`from: ${from}\n`);
                expect(content).toContain(`to: ${to}\n`);
            },
        );

        it("introduces a period file as a period, not as a value metrics reference", () => {
            const { content } = declarativeParameterToYaml({
                id: "this_year",
                title: "This year",
                content: { type: "DATE_RANGE", defaultValue: { granularity: "YEAR", from: "2025" } },
            });

            expect(content.startsWith("# A date range parameter is a named period")).toBe(true);
        });

        it("keeps a year that looks like a number a string in the YAML text", () => {
            const { content } = declarativeParameterToYaml({
                id: "this_year",
                title: "This year",
                content: { type: "DATE_RANGE", defaultValue: { granularity: "YEAR", from: "2025" } },
            });

            expect(content).toContain('from: "2025"');
            expect(parse(content).definition.defaultValue).toStrictEqual({
                granularity: "YEAR",
                from: "2025",
            });
        });

        it("takes a year written without quotes as its text", () => {
            const declarative = yamlParameterToDeclarative(
                parse(
                    "type: parameter\nid: years\ndefinition:\n  type: DATE_RANGE\n  defaultValue:\n    granularity: YEAR\n    from: 2024\n    to: 2025\n",
                ) as Parameter,
            );

            expect(declarative.content).toStrictEqual({
                type: "DATE_RANGE",
                defaultValue: { granularity: "YEAR", from: "2024", to: "2025" },
            });
        });

        it("is a parameter code can represent", () => {
            const dateRange = {
                id: "p",
                title: "P",
                content: { type: "DATE_RANGE" as const, defaultValue: { granularity: "MONTH" as const } },
            };
            expect(isDeclarativeCodeParameter(dateRange)).toBe(true);
            expect(isDeclarativeDateRangeParameter(dateRange)).toBe(true);
            expect(
                isDeclarativeDateRangeParameter({
                    id: "n",
                    title: "N",
                    content: { type: "NUMBER", defaultValue: 1 },
                }),
            ).toBe(false);
        });
    });
});
