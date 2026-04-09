// (C) 2026 GoodData Corporation

import type { IOutliersConfig } from "@gooddata/sdk-backend-spi";
import { type IColor } from "@gooddata/sdk-model";
import type { IAnomalies } from "@gooddata/sdk-ui-charts";

import { type Config } from "../types.js";

/**
 * @internal
 */
export interface INormalizedAnomalyDetectionValues {
    sensitivity: "low" | "medium" | "high";
    size: "small" | "medium" | "big";
    color: IColor;
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
        color: anomalyValues.color,
        size: anomalyValues.size,
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
    const anomalyDetection = config?.anomalyDetection ?? config?.anomalies;

    if (!anomalyDetection) {
        return undefined;
    }

    const sensitivity = anomalyDetection.sensitivity?.toLowerCase() ?? "medium";
    const color = parseColor(anomalyDetection.color?.toLowerCase() ?? "#FF0000");
    const size = anomalyDetection.size?.toLowerCase() ?? "small";

    if (sensitivity !== "low" && sensitivity !== "medium" && sensitivity !== "high") {
        return undefined;
    }

    return {
        sensitivity,
        size,
        color,
    };
}

function parseColor(color: string): IColor {
    if (color.startsWith("#")) {
        const hex = color.substring(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return {
            type: "rgb",
            value: { r, g, b },
        };
    } else if (color.startsWith("rgb")) {
        const match = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
            const [, r, g, b] = match;
            return {
                type: "rgb",
                value: {
                    r: parseInt(r, 10),
                    g: parseInt(g, 10),
                    b: parseInt(b, 10),
                },
            };
        }
    }

    // Default to red if parsing fails
    return {
        type: "rgb",
        value: { r: 255, g: 0, b: 0 },
    };
}
