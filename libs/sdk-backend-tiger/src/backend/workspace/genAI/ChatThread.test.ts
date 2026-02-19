// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { CreatedVisualization } from "@gooddata/api-client-tiger";

import { convertCreatedVisualization } from "./ChatThread.js";

const baseCreatedVisualization: CreatedVisualization = {
    id: "generated-line",
    title: "Revenue trend",
    visualizationType: "LINE",
    metrics: [],
    dimensionality: [],
    filters: [],
    suggestions: [],
};

describe("convertCreatedVisualization", () => {
    it("preserves forecast config in created visualization conversion", () => {
        const converted = convertCreatedVisualization({
            ...baseCreatedVisualization,
            config: {
                forecast: {
                    forecastPeriod: 3,
                    confidenceLevel: 0.95,
                    seasonal: true,
                },
            },
        });

        expect(converted.config).toEqual({
            forecast: {
                forecastPeriod: 3,
                confidenceLevel: 0.95,
                seasonal: true,
            },
        });
    });

    it("keeps config undefined when backend does not send it", () => {
        const converted = convertCreatedVisualization(baseCreatedVisualization);

        expect(converted.config).toBeUndefined();
    });
});
