// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization, IInsight } from "@gooddata/sdk-model";

import type { IChatConversationLocalContent } from "../../model.js";
import { loadWhatIfScenarios, mapVisualizationWhatIfToScenarios } from "../whatIfMapping.js";

const insight: IInsight = {
    insight: {
        ref: {
            identifier: "insight-id",
            type: "insight",
        },
        identifier: "insight-id",
        uri: "insight-uri",
        title: "Insight Title",
        visualizationUrl: "vis-url",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        updated: "2024-01-01T00:00:00Z",
        created: "2024-01-01T00:00:00Z",
        tags: [],
        summary: "",
    },
};

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

describe("loadWhatIfScenarios", () => {
    it("returns undefined if no what-if part is present", () => {
        const content: IChatConversationLocalContent = {
            type: "multipart",
            parts: [],
        };
        expect(loadWhatIfScenarios(content)).toBeUndefined();
    });

    it("returns undefined if what-if has no scenarios", () => {
        const content: IChatConversationLocalContent = {
            type: "multipart",
            parts: [
                {
                    type: "whatIf",
                    whatIf: {
                        includeBaseline: true,
                        scenarios: [],
                    },
                },
            ],
        };
        expect(loadWhatIfScenarios(content)).toBeUndefined();
    });

    it("returns undefined if no visualization part is present", () => {
        const content: IChatConversationLocalContent = {
            type: "multipart",
            parts: [
                {
                    type: "whatIf",
                    whatIf: {
                        includeBaseline: true,
                        scenarios: [
                            {
                                label: "Scenario 1",
                                adjustments: [],
                            },
                        ],
                    },
                },
            ],
        };
        expect(loadWhatIfScenarios(content)).toBeUndefined();
    });

    it("correctly loads scenarios with baseline", () => {
        const content: IChatConversationLocalContent = {
            type: "multipart",
            parts: [
                {
                    type: "visualization",
                    visualization: insight,
                },
                {
                    type: "whatIf",
                    whatIf: {
                        includeBaseline: true,
                        scenarios: [
                            {
                                label: "Scenario 1",
                                adjustments: [
                                    {
                                        ref: { identifier: "m1", type: "measure" },
                                        scenarioMaql: "SELECT {m1} * 1.1",
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        };

        const result = loadWhatIfScenarios(content);
        expect(result).toBeDefined();
        expect(result?.insight).toEqual(insight);
        expect(result?.scenarios).toHaveLength(2);
        expect(result?.scenarios[0]).toEqual({
            label: "Insight Title",
            execConfig: undefined,
            isBaseline: true,
        });
        expect(result?.scenarios[1]).toEqual({
            label: "Scenario 1",
            execConfig: {
                measureDefinitionOverrides: [
                    {
                        item: {
                            identifier: {
                                id: "m1",
                                type: "metric",
                            },
                        },
                        definition: {
                            inline: {
                                maql: "SELECT {m1} * 1.1",
                            },
                        },
                    },
                ],
            },
            isBaseline: false,
        });
    });

    it("handles URI refs correctly", () => {
        const content: IChatConversationLocalContent = {
            type: "multipart",
            parts: [
                {
                    type: "visualization",
                    visualization: insight,
                },
                {
                    type: "whatIf",
                    whatIf: {
                        includeBaseline: false,
                        scenarios: [
                            {
                                label: "Scenario 1",
                                adjustments: [
                                    {
                                        ref: { uri: "/uri/1" },
                                        scenarioMaql: "SELECT {m1} * 1.1",
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        };

        const result = loadWhatIfScenarios(content);
        expect(result?.scenarios[0].execConfig?.measureDefinitionOverrides?.[0].item).toEqual({
            identifier: {
                id: "/uri/1",
                type: "metric",
            },
        });
    });
});
