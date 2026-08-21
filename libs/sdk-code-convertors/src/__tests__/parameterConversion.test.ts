// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Parameter } from "@gooddata/sdk-code-schemas/v1";

import { declarativeParameterToYaml } from "../from/declarativeParameterToYaml.js";
import { yamlParameterToDeclarative } from "../to/yamlParameterToDeclarative.js";
import { type DeclarativeStringParameter, isDeclarativeStringParameter } from "../utils/parameterUtils.js";

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

            expect(Object.keys(minLength.content.constraints ?? {})).toEqual(["minLength"]);
            expect(Object.keys(maxLength.content.constraints ?? {})).toEqual(["maxLength"]);
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

        it("rejects a numeric parameter, which has no code representation", () => {
            expect(
                isDeclarativeStringParameter({
                    id: "target_margin",
                    title: "Target Margin",
                    content: { type: "NUMBER", defaultValue: 10 },
                }),
            ).toBe(false);
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

            expect(Object.keys(json.definition.constraints ?? {})).toEqual(["minLength"]);
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
});
