// (C) 2026 GoodData Corporation

import { type IInsight, insightProperties } from "@gooddata/sdk-model";

import { type IReportVisualizationObject } from "../../typings/report.js";
import { convertModelInsightToADRep } from "../../utils/sdkModelToADRep/InsightConverter.js";

/**
 * The opened insight's visualization properties, normalized: anything that is not a non-null,
 * non-array object (a corrupted string, a number, null — or an array, the wrong collection KIND)
 * becomes `{}`. The array check matters: a bare `typeof` test would let `properties: []` straight
 * through into the metadata pipeline.
 */
export function normalizeInsightProperties(insight: IInsight): object {
    const visualizationProperties = insightProperties(insight);
    return visualizationProperties !== null &&
        typeof visualizationProperties === "object" &&
        !Array.isArray(visualizationProperties)
        ? visualizationProperties
        : {};
}

/**
 * The save-button-compatible report a successful open stores as `report.lastSavedObject` — a pure
 * computation over the action payload, pinned by the characterization suite.
 *
 * The stored object must contain EXACTLY what a saved report would, because the save-button selector
 * compares against it, which is why the properties are re-serialized with the `{ controls: {} }`
 * defaults.
 */
export function buildLastSavedCompatibleReport(insight: IInsight): IReportVisualizationObject {
    const converted = convertModelInsightToADRep(insight, true);
    return {
        ...converted,
        content: {
            ...converted.content,
            properties: JSON.stringify(normalizeInsightProperties(insight)),
        },
    };
}
