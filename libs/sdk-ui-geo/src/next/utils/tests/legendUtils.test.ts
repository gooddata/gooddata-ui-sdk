// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IAreaGeoData } from "../../types/geoData/area.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import {
    ATTRIBUTE_ONLY_URI_PREFIX,
    FALLBACK_LEGEND_COLOR,
    convertToColorCategories,
    isAttributeOnlyAreaData,
    isAttributeOnlyGeoData,
    isAttributeOnlyPushpinData,
} from "../legend/legendUtils.js";

describe("isAttributeOnlyAreaData", () => {
    it("returns true when only area attribute is present", () => {
        const geoData: IAreaGeoData = {
            area: { name: "Area", index: 0, data: [], uris: [] },
        };
        expect(isAttributeOnlyAreaData(geoData)).toBe(true);
    });

    it("returns false when segment is present", () => {
        const geoData: IAreaGeoData = {
            area: { name: "Area", index: 0, data: [], uris: [] },
            segment: { name: "Segment", index: 1, data: ["A"], uris: ["/uri/1"] },
        };
        expect(isAttributeOnlyAreaData(geoData)).toBe(false);
    });

    it("returns false when color measure is present", () => {
        const geoData: IAreaGeoData = {
            area: { name: "Area", index: 0, data: [], uris: [] },
            color: { name: "Revenue", index: 1, data: [10], format: "#,##0" },
        };
        expect(isAttributeOnlyAreaData(geoData)).toBe(false);
    });

    it("returns false when no area attribute is present", () => {
        const geoData: IAreaGeoData = {};
        expect(isAttributeOnlyAreaData(geoData)).toBe(false);
    });

    it("returns false when only tooltipText is present (no area attribute)", () => {
        const geoData: IAreaGeoData = {
            tooltipText: { name: "Tooltip", index: 0, data: ["text"] },
        };
        expect(isAttributeOnlyAreaData(geoData)).toBe(false);
    });
});

describe("isAttributeOnlyPushpinData", () => {
    it("returns true when only location attribute is present", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
        };
        expect(isAttributeOnlyPushpinData(geoData)).toBe(true);
    });

    it("returns false when segment is present", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
            segment: { name: "Segment", index: 1, data: ["A"], uris: ["/uri/1"] },
        };
        expect(isAttributeOnlyPushpinData(geoData)).toBe(false);
    });

    it("returns false when color measure is present", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
            color: { name: "Revenue", index: 1, data: [10], format: "#,##0" },
        };
        expect(isAttributeOnlyPushpinData(geoData)).toBe(false);
    });

    it("returns false when size measure is present", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
            size: { name: "Size", index: 1, data: [5], format: "#,##0" },
        };
        expect(isAttributeOnlyPushpinData(geoData)).toBe(false);
    });

    it("returns false when no location attribute is present", () => {
        const geoData: IPushpinGeoData = {};
        expect(isAttributeOnlyPushpinData(geoData)).toBe(false);
    });

    it("returns false when only tooltipText is present (no location)", () => {
        const geoData: IPushpinGeoData = {
            tooltipText: { name: "Tooltip", index: 0, data: ["text"] },
        };
        expect(isAttributeOnlyPushpinData(geoData)).toBe(false);
    });
});

describe("isAttributeOnlyGeoData", () => {
    it("delegates to area check for area layer type", () => {
        const geoData: IAreaGeoData = {
            area: { name: "Area", index: 0, data: [], uris: [] },
        };
        expect(isAttributeOnlyGeoData(geoData, "area")).toBe(true);
    });

    it("delegates to pushpin check for pushpin layer type", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
        };
        expect(isAttributeOnlyGeoData(geoData, "pushpin")).toBe(true);
    });

    it("returns false for area with color", () => {
        const geoData: IAreaGeoData = {
            area: { name: "Area", index: 0, data: [], uris: [] },
            color: { name: "Revenue", index: 1, data: [10], format: "#,##0" },
        };
        expect(isAttributeOnlyGeoData(geoData, "area")).toBe(false);
    });

    it("returns false for pushpin with size", () => {
        const geoData: IPushpinGeoData = {
            location: { name: "Location", index: 0, data: [] },
            size: { name: "Size", index: 1, data: [5], format: "#,##0" },
        };
        expect(isAttributeOnlyGeoData(geoData, "pushpin")).toBe(false);
    });
});

describe("convertToColorCategories", () => {
    it("converts legend items to color category items", () => {
        const result = convertToColorCategories([
            {
                type: "pushpin",
                name: "Czech",
                uri: "/uri/1",
                color: "#ff0000",
                legendIndex: 0,
                isVisible: true,
            },
        ]);

        expect(result).toEqual([
            { type: "colorCategory", label: "Czech", color: "#ff0000", uri: "/uri/1", isVisible: true },
        ]);
    });

    it("uses fallback color when item color is undefined", () => {
        const result = convertToColorCategories([
            { type: "pushpin", name: "Unknown", uri: "/uri/2", legendIndex: 0, isVisible: false },
        ]);

        expect(result[0]?.color).toBe(FALLBACK_LEGEND_COLOR);
    });

    it("returns empty array for empty input", () => {
        expect(convertToColorCategories([])).toEqual([]);
    });
});

describe("constants", () => {
    it("FALLBACK_LEGEND_COLOR is #ccc", () => {
        expect(FALLBACK_LEGEND_COLOR).toBe("#ccc");
    });

    it("ATTRIBUTE_ONLY_URI_PREFIX is __attribute_only__", () => {
        expect(ATTRIBUTE_ONLY_URI_PREFIX).toBe("__attribute_only__");
    });
});
