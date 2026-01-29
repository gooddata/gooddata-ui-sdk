// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { applyGeoChartConfigDefaults } from "../../hooks/props/useResolvedGeoChartProps.js";

describe("applyGeoChartConfigDefaults", () => {
    it("applies config defaults for palette, mapping, legend, points, and gestures", () => {
        const config = applyGeoChartConfigDefaults({});

        expect(config.colorPalette).toBe(DefaultColorPalette);
        expect(config.colorMapping).toEqual([]);
        expect(config.points?.minSize).toBe("normal");
        expect(config.points?.maxSize).toBe("normal");
        expect(config.points?.groupNearbyPoints).toBe(true);
        expect(config.legend?.enabled).toBe(true);
        expect(config.legend?.position).toBe("top");
        expect(config.cooperativeGestures).toBe(true);
    });
});
