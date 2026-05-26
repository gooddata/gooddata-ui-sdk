// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, uriRef } from "@gooddata/sdk-model";

import {
    getAttributeIdRefIdentifier,
    getAttributeRefId,
    readAttrIdentity,
} from "../customTooltipExecution.js";

const idAttribute = newAttribute(idRef("df.country", "displayForm"), (a) => a.localId("country"));
const uriAttribute = newAttribute(uriRef("/gdc/md/project/obj/123"), (a) => a.localId("country"));

describe("readAttrIdentity", () => {
    it("reads identity from an object payload (raw callback path)", () => {
        const payload = {
            title: "Country",
            value: "Czechia",
            attrId: "df.country",
            uri: "/country/cz",
        };
        expect(readAttrIdentity(payload)).toEqual({ attrId: "df.country", uri: "/country/cz" });
    });

    it("parses a stringified payload (MapLibre queryRenderedFeatures path)", () => {
        // MapLibre serializes complex GeoJSON property values to JSON strings when
        // they round-trip through queryRenderedFeatures. Without parsing, the
        // function would return {uri: ""} with attrId undefined and the pushpin
        // custom-tooltip lookup would never match any feature.
        const payload = JSON.stringify({
            title: "Country",
            value: "Czechia",
            attrId: "df.country",
            uri: "/country/cz",
        });
        expect(readAttrIdentity(payload)).toEqual({ attrId: "df.country", uri: "/country/cz" });
    });

    it("returns the safe sentinel when payload is null or undefined", () => {
        expect(readAttrIdentity(null)).toEqual({ uri: "" });
        expect(readAttrIdentity(undefined)).toEqual({ uri: "" });
    });

    it("returns the safe sentinel when payload is malformed JSON", () => {
        expect(readAttrIdentity("{not json")).toEqual({ uri: "" });
    });

    it("returns the safe sentinel when payload parses to a non-object", () => {
        expect(readAttrIdentity('"plain string"')).toEqual({ uri: "" });
        expect(readAttrIdentity("42")).toEqual({ uri: "" });
        expect(readAttrIdentity("null")).toEqual({ uri: "" });
    });

    it("returns the safe sentinel when payload lacks a title (treated as malformed)", () => {
        // `parseTooltipPayload` requires a non-empty title to consider a payload
        // a valid tooltip payload; without it we cannot trust the identity.
        const payload = { attrId: "df.country", uri: "/country/cz" };
        expect(readAttrIdentity(payload)).toEqual({ uri: "" });
    });

    it("treats non-string fields as undefined / empty", () => {
        const payload = { title: "Country", attrId: 42, uri: null };
        expect(readAttrIdentity(payload)).toEqual({ attrId: undefined, uri: "" });
    });

    it("preserves missing uri as empty string", () => {
        const payload = { title: "Country", attrId: "df.country" };
        expect(readAttrIdentity(payload)).toEqual({ attrId: "df.country", uri: "" });
    });
});

describe("display-form identity helpers", () => {
    it("returns identifiers for identifier refs", () => {
        expect(getAttributeIdRefIdentifier(idAttribute)).toBe("df.country");
        expect(getAttributeRefId(idAttribute)).toBe("df.country");
    });

    it("keeps identifier-only and stable-id semantics separate for URI refs", () => {
        expect(getAttributeIdRefIdentifier(uriAttribute)).toBeUndefined();
        expect(getAttributeRefId(uriAttribute)).toBe("/gdc/md/project/obj/123");
    });

    it("returns undefined for missing attributes", () => {
        expect(getAttributeIdRefIdentifier(undefined)).toBeUndefined();
        expect(getAttributeRefId(undefined)).toBeUndefined();
    });
});
