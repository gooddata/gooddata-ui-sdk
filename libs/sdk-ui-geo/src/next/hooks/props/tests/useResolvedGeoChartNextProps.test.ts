// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { applyGeoChartNextConfigDefaults } from "../useResolvedGeoChartNextProps.js";

describe("applyGeoChartNextConfigDefaults", () => {
    it("applies legend, points, areas, and palette defaults", () => {
        const config = applyGeoChartNextConfigDefaults(undefined);

        expect(config.colorPalette).toBe(DefaultColorPalette);
        expect(config.colorMapping).toEqual([]);
        expect(config.points?.minSize).toBe("normal");
        expect(config.points?.maxSize).toBe("normal");
        expect(config.points?.groupNearbyPoints).toBe(true);
        expect(config.areas?.fillOpacity).toBe(0.7);
        expect(config.areas?.borderColor).toBe("#FFFFFF");
        expect(config.areas?.borderWidth).toBe(1);
        expect(config.legend?.enabled).toBe(true);
        expect(config.legend?.position).toBe("top");
        expect(config.cooperativeGestures).toBe(true);
    });
});
