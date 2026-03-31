// (C) 2026 GoodData Corporation

import type { IOutliersConfig } from "@gooddata/sdk-backend-spi";
import type { IAnomalies } from "@gooddata/sdk-ui-charts";

import { type Config } from "../types.js";

/**
 * @internal
 */
export interface INormalizedAnomalyDetectionValues {
    sensitivity: "low" | "medium" | "high";
}

/**
 * @internal
 */
export function mapVisualizationAnomalyDetectionToChartConfig(config?: Config): IAnomalies | undefined {
    const anomalyValues = getNormalizedAnomalyDetectionValues(config);

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
    config?: Config,
): IOutliersConfig | undefined {
    const anomalyValues = getNormalizedAnomalyDetectionValues(config);

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
    config?: Config,
): INormalizedAnomalyDetectionValues | undefined {
    const anomalyDetection = config?.anomalyDetection;

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
