// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { toBearRef, toScopedBearRef } from "./ObjRefConverter.js";

describe("toBearRef", () => {
    it("keeps the type of an identifier ref so that consumers can tell object kinds apart", () => {
        expect(toBearRef(idRef("label.id", "displayForm"))).toEqual({
            identifier: "label.id",
            type: "displayForm",
        });
        expect(toBearRef(idRef("metric.id", "measure"))).toEqual({
            identifier: "metric.id",
            type: "measure",
        });
    });

    it("leaves an untyped identifier ref untyped", () => {
        expect(toBearRef(idRef("label.id"))).toEqual({ identifier: "label.id" });
    });

    it("keeps a uri ref", () => {
        expect(toBearRef(uriRef("/gdc/md/1"))).toEqual({ uri: "/gdc/md/1" });
    });

    it("keeps the computed attribute type, for it the only thing telling it apart from a label", () => {
        expect(toBearRef(idRef("ca.id", "computedAttribute"))).toEqual({
            identifier: "ca.id",
            type: "computedAttribute",
        });
    });

    it("leaves local identifier refs alone", () => {
        expect(toScopedBearRef({ localIdentifier: "m1" })).toEqual({
            localIdentifier: "m1",
        });
    });
});
