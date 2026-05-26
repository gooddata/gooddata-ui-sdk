// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITooltipReferenceMaps } from "../../registry/adapterTypes.js";
import { resolveReferencesFromGeoFeature } from "../resolveReferencesFromGeoFeature.js";

const NO_DATA = "(No data)";

const measure = (title: string, value: number, localId: string) => JSON.stringify({ title, value, localId });

const attribute = (title: string, value: string, attrId: string) => JSON.stringify({ title, value, attrId });

describe("resolveReferencesFromGeoFeature", () => {
    it("returns an empty map when properties are missing", () => {
        expect(resolveReferencesFromGeoFeature(null, undefined, undefined, NO_DATA)).toEqual({});
    });

    it("registers a measure under its LDM identifier when localId maps to one", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: { m_color: "ldm.sales" },
            attributes: {},
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "metric/ldm.sales": "100",
        });
    });

    it("skips measures whose localId has no LDM mapping", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({});
    });

    it("emits the no-data sentinel for measures with non-finite values", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: JSON.stringify({ title: "Sales", value: Number.NaN, localId: "m" }),
            size: JSON.stringify({ title: "Size", value: "not a number", localId: "s" }),
        };
        const maps: ITooltipReferenceMaps = {
            measures: { m: "ldm.sales", s: "ldm.size" },
            attributes: {},
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "metric/ldm.sales": NO_DATA,
            "metric/ldm.size": NO_DATA,
        });
    });

    it("first-wins precedence: size populates the metric key before color when both reference the same LDM id", () => {
        const props: GeoJSON.GeoJsonProperties = {
            size: measure("Size", 1, "m_size"),
            color: measure("Color", 2, "m_color"),
        };
        const maps: ITooltipReferenceMaps = {
            // both map to the same ldm id
            measures: { m_size: "ldm.shared", m_color: "ldm.shared" },
            attributes: {},
        };
        const values = resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA);
        expect(values["metric/ldm.shared"]).toBe("1");
    });

    it("registers attribute payloads under both display-form and parent attribute keys", () => {
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Country", "Czechia", "df.country"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { "df.country": "attr.country" },
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "label/df.country": "Czechia",
            "label/attr.country": "Czechia",
        });
    });

    it("registers only the display-form key when no parent attribute mapping exists", () => {
        const props: GeoJSON.GeoJsonProperties = {
            segment: attribute("Segment", "EU", "df.segment"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "label/df.segment": "EU",
        });
    });

    it("walks the tooltipText slot and registers under both display-form and parent attribute keys", () => {
        const props: GeoJSON.GeoJsonProperties = {
            tooltipText: attribute("Region", "Bohemia", "df.region"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { "df.region": "attr.region" },
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "label/df.region": "Bohemia",
            "label/attr.region": "Bohemia",
        });
    });

    it("walks measures[] entries in order with first-wins precedence", () => {
        const props: GeoJSON.GeoJsonProperties = {
            measures: [measure("First", 10, "a"), measure("Second", 20, "b")],
        };
        const maps: ITooltipReferenceMaps = {
            measures: { a: "ldm.x", b: "ldm.y" },
            attributes: {},
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined, NO_DATA)).toEqual({
            "metric/ldm.x": "10",
            "metric/ldm.y": "20",
        });
    });

    it("treats undefined referenceMaps as empty (no metric/label keys registered)", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
            locationName: attribute("Country", "CZ", "df.country"),
        };
        // attribute display-form key is still registered (no parent lookup needed)
        // but no metric key — measures table is empty.
        expect(resolveReferencesFromGeoFeature(props, undefined, undefined, NO_DATA)).toEqual({
            "label/df.country": "CZ",
        });
    });
});
