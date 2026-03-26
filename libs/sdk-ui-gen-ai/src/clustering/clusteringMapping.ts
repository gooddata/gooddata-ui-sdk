// (C) 2026 GoodData Corporation

import type { IChatVisualisationDefinition, IClusteringConfig } from "@gooddata/sdk-backend-spi";
import type { IGenAIVisualization } from "@gooddata/sdk-model";
import type { IChartClusteringConfig } from "@gooddata/sdk-ui-charts";

/**
 * @internal
 */
export function mapVisualizationClusteringToChartConfig(
    visualization?: IGenAIVisualization | IChatVisualisationDefinition,
): IChartClusteringConfig | undefined {
    const clustering = visualization?.config?.clustering;

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
export function mapVisualizationClusteringToBackendConfig(
    visualization?: IGenAIVisualization | IChatVisualisationDefinition,
): IClusteringConfig | undefined {
    const clustering = visualization?.config?.clustering;

    if (!clustering) {
        return undefined;
    }

    return {
        numberOfClusters: clustering.numberOfClusters,
        threshold: clustering.threshold,
    };
}
