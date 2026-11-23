// (C) 2026 GoodData Corporation

import type { IChartClusteringConfig } from "@gooddata/sdk-ui-charts";

import { type Config } from "../types.js";

/**
 * @internal
 */
export function mapVisualizationClusteringToChartConfig(config?: Config): IChartClusteringConfig | undefined {
    const clustering = config?.clustering;

    if (!clustering) {
        return undefined;
    }

    return {
        enabled: true,
        numberOfClusters: clustering.numberOfClusters ?? 3,
        threshold: clustering.threshold ?? 0.03,
    };
}
