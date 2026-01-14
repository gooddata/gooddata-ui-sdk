// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { idRef, newInsightDefinition, newMeasureValueFilterWithOptions } from "@gooddata/sdk-model";

import { getReactEmbeddingCodeGenerator } from "../index.js";

describe("getReactEmbeddingCodeGenerator", () => {
    const mockInsight = newInsightDefinition("foo");

    const generator = getReactEmbeddingCodeGenerator({
        component: {
            importType: "named",
            name: "Foo",
            package: "@gooddata/foo",
        },
        insightToProps() {
            return {
                prop: {
                    value: "string",
                    meta: {
                        typeImport: { name: "Type", package: "some-package", importType: "default" },
                        cardinality: "scalar",
                    },
                },
                another: {
                    value: [ReferenceMd.Account.Name],
                    meta: {
                        typeImport: { name: "Type2", package: "some-package2", importType: "named" },
                        cardinality: "array",
                    },
                },
            };
        },
    });

    describe("height test", () => {
        type Scenario = [string, number | string];
        const scenarios: Scenario[] = [
            ["without height", undefined!],
            ["with height as number", 1000],
            ["with height as string", "20rem"],
        ];

        it.each(scenarios)("should generate embedding code %s", (_, height) => {
            expect(generator(mockInsight, { height })).toMatchSnapshot();
        });
    });

    describe("omitChartProps", () => {
        type Scenario = [string, string[]];
        const scenarios: Scenario[] = [
            ["no props to omit defined in empty array", []],
            ["no props to omit defined as undefined", undefined!],
            ["omit one prop", ["prop"]],
            ["omit all props", ["prop", "another"]],
        ];

        it.each(scenarios)("should generate embedding code %s", (_, omitProps) => {
            expect(generator(mockInsight, { omitChartProps: omitProps })).toMatchSnapshot();
        });
    });

    describe("import detection", () => {
        it("should not import newMeasureValueFilter when only newMeasureValueFilterWithOptions is used", () => {
            const generatorWithMvf = getReactEmbeddingCodeGenerator({
                component: {
                    importType: "named",
                    name: "TestComponent",
                    package: "@gooddata/test",
                },
                insightToProps() {
                    return {
                        filters: {
                            value: [
                                newMeasureValueFilterWithOptions(idRef("price", "measure"), {
                                    operator: "GREATER_THAN",
                                    value: 2000,
                                }),
                            ],
                            meta: {
                                typeImport: {
                                    name: "IFilter",
                                    package: "@gooddata/sdk-model",
                                    importType: "named",
                                },
                                cardinality: "array",
                            },
                        },
                    };
                },
            });

            const code = generatorWithMvf(mockInsight);

            // Should contain newMeasureValueFilterWithOptions
            expect(code).toContain("newMeasureValueFilterWithOptions");
            // Should NOT import both - count occurrences in import statement
            const importMatch = code.match(/import.*from "@gooddata\/sdk-model";/);
            expect(importMatch).toBeTruthy();
            const importStatement = importMatch![0];
            // Should have newMeasureValueFilterWithOptions in imports
            expect(importStatement).toContain("newMeasureValueFilterWithOptions");
            // Should NOT have "newMeasureValueFilter, newMeasureValueFilterWithOptions" pattern
            expect(importStatement).not.toMatch(/newMeasureValueFilter,\s*newMeasureValueFilterWithOptions/);
        });
    });
});
