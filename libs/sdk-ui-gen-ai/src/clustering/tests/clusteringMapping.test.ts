// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IGenAIVisualization } from "@gooddata/sdk-model";

import {
    mapVisualizationClusteringToBackendConfig,
    mapVisualizationClusteringToChartConfig,
} from "../clusteringMapping.js";

const baseVisualization: IGenAIVisualization = {
    id: "generated-scatter",
    title: "Clustering trend",
    visualizationType: "SCATTER",
    metrics: [],
    dimensionality: [],
    filters: [],
    suggestions: [],
};

describe("clusteringMapping", () => {
    describe("mapVisualizationClusteringToChartConfig", () => {
        it("should return undefined if clustering is not present", () => {
            expect(mapVisualizationClusteringToChartConfig(baseVisualization)).toBeUndefined();
        });

        it("should map clustering config to chart config", () => {
            const visualization: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    clustering: {
                        numberOfClusters: 3,
                        threshold: 0.5,
                    },
                },
            };
            expect(mapVisualizationClusteringToChartConfig(visualization)).toEqual({
                enabled: true,
                numberOfClusters: 3,
            });
        });
    });

    describe("mapVisualizationClusteringToBackendConfig", () => {
        it("should return undefined if clustering is not present", () => {
            expect(mapVisualizationClusteringToBackendConfig(baseVisualization)).toBeUndefined();
        });

        it("should map clustering config to backend config", () => {
            const visualization: IGenAIVisualization = {
                ...baseVisualization,
                config: {
                    clustering: {
                        numberOfClusters: 5,
                        threshold: 0.1,
                    },
                },
            };
            expect(mapVisualizationClusteringToBackendConfig(visualization)).toEqual({
                numberOfClusters: 5,
                threshold: 0.1,
            });
        });
    });
});
