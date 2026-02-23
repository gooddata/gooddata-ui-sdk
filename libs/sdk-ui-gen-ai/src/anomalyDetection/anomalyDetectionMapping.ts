// (C) 2026 GoodData Corporation

import type { IOutliersConfig } from "@gooddata/sdk-backend-spi";
import type { IGenAIVisualization } from "@gooddata/sdk-model";
import type { IAnomalies } from "@gooddata/sdk-ui-charts";

/**
 * @internal
 */
export interface INormalizedAnomalyDetectionValues {
    sensitivity: "low" | "medium" | "high";
}

/**
 * @internal
 */
export function mapVisualizationAnomalyDetectionToChartConfig(
    visualization?: IGenAIVisualization,
): IAnomalies | undefined {
    const anomalyValues = getNormalizedAnomalyDetectionValues(visualization);

    if (!anomalyValues) {
        return undefined;
    }

    return {
        enabled: true,
        sensitivity: anomalyValues.sensitivity,
        size: "small",
        color: {
            type: "rgb",
            value: {
                r: 255,
                g: 0,
                b: 0,
            },
        },
    };
}

/**
 * @internal
 */
export function mapVisualizationAnomalyDetectionToBackendConfig(
    visualization?: IGenAIVisualization,
): IOutliersConfig | undefined {
    const anomalyValues = getNormalizedAnomalyDetectionValues(visualization);

    if (!anomalyValues) {
        return undefined;
    }

    return {
        sensitivity: anomalyValues.sensitivity,
    };
}

/**
 * @internal
 */
export function getNormalizedAnomalyDetectionValues(
    visualization?: IGenAIVisualization,
): INormalizedAnomalyDetectionValues | undefined {
    const anomalyDetection = visualization?.config?.anomalyDetection;

    if (!anomalyDetection) {
        return undefined;
    }

    const sensitivity = anomalyDetection.sensitivity?.toLowerCase();

    if (sensitivity !== "low" && sensitivity !== "medium" && sensitivity !== "high") {
        return undefined;
    }

    return {
        sensitivity,
    };
}
