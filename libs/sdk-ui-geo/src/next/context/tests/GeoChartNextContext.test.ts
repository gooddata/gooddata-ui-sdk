// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { applyGeoChartNextConfigDefaults } from "../../hooks/props/useResolvedGeoChartNextProps.js";

describe("applyGeoChartNextConfigDefaults", () => {
    it("applies config defaults for palette, mapping, legend, points, and gestures", () => {
        const config = applyGeoChartNextConfigDefaults({});

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
