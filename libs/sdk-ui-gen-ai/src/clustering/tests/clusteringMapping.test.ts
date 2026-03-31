// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    mapVisualizationClusteringToBackendConfig,
    mapVisualizationClusteringToChartConfig,
} from "../clusteringMapping.js";

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
            });
        });
    });

    describe("mapVisualizationClusteringToBackendConfig", () => {
        it("should return undefined if clustering is not present", () => {
            expect(mapVisualizationClusteringToBackendConfig(baseVisualization)).toBeUndefined();
        });

        it("should map clustering config to backend config", () => {
            expect(
                mapVisualizationClusteringToBackendConfig({
                    clustering: {
                        numberOfClusters: 5,
                        threshold: 0.1,
                    },
                }),
            ).toEqual({
                numberOfClusters: 5,
                threshold: 0.1,
            });
        });
    });
});
