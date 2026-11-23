// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { mapVisualizationClusteringToChartConfig } from "./clusteringMapping.js";

const baseVisualization = {};

describe("clusteringMapping", () => {
    describe("mapVisualizationClusteringToChartConfig", () => {
        it("should return undefined if clustering is not present", () => {
            expect(mapVisualizationClusteringToChartConfig(baseVisualization)).toBeUndefined();
        });

        it("should map clustering config to chart config", () => {
            expect(
                mapVisualizationClusteringToChartConfig({
                    clustering: {
                        numberOfClusters: 3,
                        threshold: 0.5,
                    },
                }),
            ).toEqual({
                enabled: true,
                numberOfClusters: 3,
                threshold: 0.5,
            });
        });
    });
});
