// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getGeoBasemapDropdownItems } from "../geoBasemapConfiguration.js";

describe("getGeoBasemapDropdownItems", () => {
    const apiItems = [
        { id: "standard", title: "Standard", link: "/styles/standard" },
        { id: "satellite", title: "Satellite", link: "/styles/satellite" },
    ];

    it("returns backend items unchanged when no basemap is selected", () => {
        expect(getGeoBasemapDropdownItems(apiItems, undefined)).toEqual([
            { title: "Standard", value: "standard" },
            { title: "Satellite", value: "satellite" },
        ]);
    });

    it("returns backend items unchanged when the selected basemap is present", () => {
        expect(getGeoBasemapDropdownItems(apiItems, "satellite")).toEqual([
            { title: "Standard", value: "standard" },
            { title: "Satellite", value: "satellite" },
        ]);
    });

    it("appends the current basemap when it is missing from backend items", () => {
        expect(getGeoBasemapDropdownItems(apiItems, "legacy-style")).toEqual([
            { title: "Standard", value: "standard" },
            { title: "Satellite", value: "satellite" },
            { title: "legacy-style", value: "legacy-style" },
        ]);
    });

    it("returns an empty list when backend items are empty and no basemap is selected", () => {
        expect(getGeoBasemapDropdownItems([], undefined)).toEqual([]);
    });

    it("keeps the current basemap visible when backend items are empty", () => {
        expect(getGeoBasemapDropdownItems([], "satellite")).toEqual([
            { title: "satellite", value: "satellite" },
        ]);
    });
});
