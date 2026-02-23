// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import { mapVisualizationWhatIfToScenarios } from "../whatIfMapping.js";

const baseVisualization: IGenAIVisualization = {
    id: "vis-id",
    title: "Revenue by Region",
    visualizationType: "BAR",
    metrics: [],
    dimensionality: [],
};

function createVisualization(config: IGenAIVisualization["config"]): IGenAIVisualization {
    return {
        ...baseVisualization,
        config,
    };
}

describe("whatIfMapping", () => {
    it("returns undefined when visualization is undefined", () => {
        expect(mapVisualizationWhatIfToScenarios(undefined)).toBeUndefined();
    });

    it("returns undefined when config has no whatIf", () => {
        const vis = createVisualization({});
        expect(mapVisualizationWhatIfToScenarios(vis)).toBeUndefined();
    });

    it("returns undefined when scenarios array is empty", () => {
        const vis = createVisualization({
            whatIf: {
                scenarios: [],
            },
        });
        expect(mapVisualizationWhatIfToScenarios(vis)).toBeUndefined();
    });

    it("maps a single scenario without baseline", () => {
        const vis = createVisualization({
            whatIf: {
                scenarios: [
                    {
                        label: "Revenue +10%",
                        adjustments: [
                            {
                                metricId: "metric-1",
                                metricType: "metric",
                                scenarioMaql: "SELECT {metric-1} * 1.1",
                            },
                        ],
                    },
                ],
            },
        });

        const result = mapVisualizationWhatIfToScenarios(vis);
        expect(result).toEqual([
            {
                label: "Revenue +10%",
                execConfig: {
                    measureDefinitionOverrides: [
                        {
                            item: {
                                identifier: {
                                    id: "metric-1",
                                    type: "metric",
                                },
                            },
                            definition: {
                                inline: {
                                    maql: "SELECT {metric-1} * 1.1",
                                },
                            },
                        },
                    ],
                },
                isBaseline: false,
            },
        ]);
    });

    it("includes baseline when includeBaseline is true", () => {
        const vis = createVisualization({
            whatIf: {
                includeBaseline: true,
                scenarios: [
                    {
                        label: "Revenue +10%",
                        adjustments: [
                            {
                                metricId: "metric-1",
                                metricType: "metric",
                                scenarioMaql: "SELECT {metric-1} * 1.1",
                            },
                        ],
                    },
                ],
            },
        });

        const result = mapVisualizationWhatIfToScenarios(vis)!;
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            label: "Revenue by Region",
            execConfig: undefined,
            isBaseline: true,
        });
        expect(result[1].isBaseline).toBe(false);
        expect(result[1].label).toBe("Revenue +10%");
    });

    it("filters out non-metric adjustments", () => {
        const vis = createVisualization({
            whatIf: {
                scenarios: [
                    {
                        label: "Mixed adjustments",
                        adjustments: [
                            {
                                metricId: "metric-1",
                                metricType: "metric",
                                scenarioMaql: "SELECT {metric-1} * 1.1",
                            },
                            {
                                metricId: "fact-1",
                                metricType: "fact",
                                scenarioMaql: "SELECT SUM({fact-1}) * 2",
                            },
                            {
                                metricId: "attr-1",
                                metricType: "attribute",
                                scenarioMaql: "SELECT COUNT({attr-1})",
                            },
                        ],
                    },
                ],
            },
        });

        const result = mapVisualizationWhatIfToScenarios(vis)!;
        expect(result).toHaveLength(1);
        expect(result[0].execConfig?.measureDefinitionOverrides).toHaveLength(1);
        expect(result[0].execConfig?.measureDefinitionOverrides?.[0].item.identifier.id).toBe("metric-1");
    });

    it("sets execConfig to undefined when all adjustments are non-metric", () => {
        const vis = createVisualization({
            whatIf: {
                scenarios: [
                    {
                        label: "No metric overrides",
                        adjustments: [
                            {
                                metricId: "fact-1",
                                metricType: "fact",
                                scenarioMaql: "SELECT SUM({fact-1}) * 2",
                            },
                        ],
                    },
                ],
            },
        });

        const result = mapVisualizationWhatIfToScenarios(vis)!;
        expect(result[0].execConfig).toBeUndefined();
    });

    it("maps multiple scenarios", () => {
        const vis = createVisualization({
            whatIf: {
                includeBaseline: true,
                scenarios: [
                    {
                        label: "Optimistic",
                        adjustments: [
                            {
                                metricId: "metric-1",
                                metricType: "metric",
                                scenarioMaql: "SELECT {metric-1} * 1.2",
                            },
                        ],
                    },
                    {
                        label: "Pessimistic",
                        adjustments: [
                            {
                                metricId: "metric-1",
                                metricType: "metric",
                                scenarioMaql: "SELECT {metric-1} * 0.8",
                            },
                        ],
                    },
                ],
            },
        });

        const result = mapVisualizationWhatIfToScenarios(vis)!;
        expect(result).toHaveLength(3);
        expect(result[0].isBaseline).toBe(true);
        expect(result[1].label).toBe("Optimistic");
        expect(result[2].label).toBe("Pessimistic");
    });
});
