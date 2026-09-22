// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ResolvedReference } from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

import { resolveReferencesFromGeoFeature } from "./resolveReferencesFromGeoFeature.js";

function value(text: string): ResolvedReference {
    return { kind: "value", text };
}

const EMPTY: ResolvedReference = { kind: "empty" };

const measure = (title: string, value: number, localId: string) => JSON.stringify({ title, value, localId });

const attribute = (title: string, value: string, attrId: string, attrLocalId?: string) =>
    JSON.stringify({ title, value, attrId, attrLocalId });

/** The reference keys a label publishes under, as `buildTooltipReferenceMaps` would emit them. */
const labelKeys = (displayFormId: string, attributeId = displayFormId) => ({
    displayFormKey: `label/${displayFormId}`,
    attributeKey: `label/${attributeId}`,
});

describe("resolveReferencesFromGeoFeature", () => {
    it("returns an empty map when properties are missing", () => {
        expect(resolveReferencesFromGeoFeature(null, undefined, undefined)).toEqual({});
    });

    it("registers a computed attribute under its own key namespace, via its localIdentifier", () => {
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Tier", "Gold", "tier", "a_tier"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            // a computed attribute is its own display form, so both keys are the same
            attributes: {
                a_tier: {
                    displayFormKey: "computed_attribute/tier",
                    attributeKey: "computed_attribute/tier",
                },
            },
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "computed_attribute/tier": value("Gold"),
        });
    });

    it("keeps a label and a computed attribute of the same id apart", () => {
        // An LDM identifier is unique only within an object type, so both may share one. Each
        // payload carries its localIdentifier, which is unique within the execution, so the maps
        // can hand back the right namespace for each.
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Tier label", "Silver", "tier", "a_label"),
            segment: attribute("Tier CA", "Gold", "tier", "a_ca"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: {
                a_label: labelKeys("tier"),
                a_ca: { displayFormKey: "computed_attribute/tier", attributeKey: "computed_attribute/tier" },
            },
        };

        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/tier": value("Silver"),
            "computed_attribute/tier": value("Gold"),
        });
    });

    it("treats a payload without a localIdentifier as a label, keeping older writers working", () => {
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Tier", "Gold", "tier"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };

        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/tier": value("Gold"),
        });
    });

    it("registers a measure under its LDM identifier when localId maps to one", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: { m_color: "ldm.sales" },
            attributes: {},
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "metric/ldm.sales": value("100"),
        });
    });

    it("skips measures whose localId has no LDM mapping", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({});
    });

    it("emits the empty status for measures with non-finite values", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: JSON.stringify({ title: "Sales", value: Number.NaN, localId: "m" }),
            size: JSON.stringify({ title: "Size", value: "not a number", localId: "s" }),
        };
        const maps: ITooltipReferenceMaps = {
            measures: { m: "ldm.sales", s: "ldm.size" },
            attributes: {},
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "metric/ldm.sales": EMPTY,
            "metric/ldm.size": EMPTY,
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
        const values = resolveReferencesFromGeoFeature(props, maps, undefined);
        expect(values["metric/ldm.shared"]).toEqual(value("1"));
    });

    it("registers attribute payloads under both display-form and parent attribute keys", () => {
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Country", "Czechia", "df.country", "a_country"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { a_country: labelKeys("df.country", "attr.country") },
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/df.country": value("Czechia"),
            "label/attr.country": value("Czechia"),
        });
    });

    it("registers only the display-form key when no parent attribute mapping exists", () => {
        const props: GeoJSON.GeoJsonProperties = {
            segment: attribute("Segment", "EU", "df.segment"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/df.segment": value("EU"),
        });
    });

    it("treats an empty attribute value as the empty status (consistent with the lookup builder)", () => {
        const props: GeoJSON.GeoJsonProperties = {
            locationName: attribute("Country", "", "df.country"),
        };
        const maps: ITooltipReferenceMaps = { measures: {}, attributes: {} };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/df.country": EMPTY,
        });
    });

    it("walks the tooltipText slot and registers under both display-form and parent attribute keys", () => {
        const props: GeoJSON.GeoJsonProperties = {
            tooltipText: attribute("Region", "Bohemia", "df.region", "a_region"),
        };
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { a_region: labelKeys("df.region", "attr.region") },
        };
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "label/df.region": value("Bohemia"),
            "label/attr.region": value("Bohemia"),
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
        expect(resolveReferencesFromGeoFeature(props, maps, undefined)).toEqual({
            "metric/ldm.x": value("10"),
            "metric/ldm.y": value("20"),
        });
    });

    it("treats undefined referenceMaps as empty (no metric/label keys registered)", () => {
        const props: GeoJSON.GeoJsonProperties = {
            color: measure("Sales", 100, "m_color"),
            locationName: attribute("Country", "CZ", "df.country"),
        };
        // attribute display-form key is still registered (no parent lookup needed)
        // but no metric key — measures table is empty.
        expect(resolveReferencesFromGeoFeature(props, undefined, undefined)).toEqual({
            "label/df.country": value("CZ"),
        });
    });
});
