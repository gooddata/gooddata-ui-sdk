// (C) 2026 GoodData Corporation

import type { IClusteringConfig } from "@gooddata/sdk-backend-spi";
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
        numberOfClusters: clustering.numberOfClusters,
    };
}

/**
 * @internal
 */
export function mapVisualizationClusteringToBackendConfig(config?: Config): IClusteringConfig | undefined {
    const clustering = config?.clustering;

    if (!clustering) {
        return undefined;
    }

    return {
        numberOfClusters: clustering.numberOfClusters,
        threshold: clustering.threshold,
    };
}
