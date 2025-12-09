// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IAreaGeoData } from "../area.js";
import type { IPushpinGeoData } from "../pushpin.js";
import { isAreaGeoData, isPushpinGeoData } from "../typeGuards.js";

describe("typeGuards", () => {
    it("detects pushpin geo data when location bucket exists", () => {
        const pushpinData: IPushpinGeoData = {
            location: {
                name: "Location",
                index: 0,
                data: [],
            },
        };

        expect(isPushpinGeoData(pushpinData)).toBe(true);
        expect(isAreaGeoData(pushpinData)).toBe(false);
    });

    it("detects area geo data when area bucket exists", () => {
        const areaData: IAreaGeoData = {
            area: {
                name: "Area",
                index: 0,
                data: [],
                uris: [],
            },
        };

        expect(isAreaGeoData(areaData)).toBe(true);
        expect(isPushpinGeoData(areaData)).toBe(false);
    });
});
