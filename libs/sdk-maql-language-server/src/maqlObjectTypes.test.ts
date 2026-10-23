// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isTigerType, tigerIdTypeToObjectType } from "@gooddata/sdk-backend-tiger";
import { type IComputedAttributeMetadataObject } from "@gooddata/sdk-model";

import { validate } from "./diagnostics.js";
import { findAllObjects } from "./findObjects.js";
import { normalizeMaqlObjectType, toMaqlObjectType } from "./maqlObjectTypes.js";
import { LdmObjects } from "./metadata/model.js";
import { MaqlMetric } from "./parseMaql.js";

/**
 * A computed attribute is referenced from MAQL as `{computed_attribute/id}` - from a metric or from
 * another computed attribute. The MAQL spelling uses an underscore while the Tiger entity type is
 * camelCase, so these cover the bridge between the two and the catalog lookup behind it.
 *
 * The grammar lexes `computed_attribute` as its own object type, so a reference parses like any
 * other attribute; these pin the gdc-ui side the token feeds into.
 */
describe("MAQL computed attribute object type", () => {
    const computedAttribute: IComputedAttributeMetadataObject = {
        type: "computedAttribute",
        ref: { identifier: "rep_performance", type: "computedAttribute" },
        uri: "",
        id: "rep_performance",
        title: "Rep Performance",
        description: "",
        expression: 'SELECT CASE WHEN {metric/won} > 100 THEN "High" ELSE "Low" END BY {label/rep}',
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [],
    };

    describe("normalizeMaqlObjectType", () => {
        it("maps the MAQL spelling onto the Tiger entity type", () => {
            expect(normalizeMaqlObjectType("computed_attribute")).toBe("computedAttribute");
        });

        it("produces a type the tiger mapping accepts", () => {
            const tigerType = normalizeMaqlObjectType("computed_attribute");
            expect(isTigerType(tigerType)).toBe(true);
            expect(tigerIdTypeToObjectType[tigerType as "computedAttribute"]).toBe("computedAttribute");
        });

        it.each(["metric", "label", "fact", "attribute", "dataset", "parameter"])(
            "leaves %s unchanged",
            (type) => {
                expect(normalizeMaqlObjectType(type)).toBe(type);
            },
        );
    });

    describe("toMaqlObjectType", () => {
        it("maps the Tiger entity type back onto the MAQL spelling", () => {
            expect(toMaqlObjectType("computedAttribute")).toBe("computed_attribute");
        });

        it.each(["metric", "label", "fact", "attribute", "dataset", "parameter"])(
            "leaves %s unchanged",
            (type) => {
                expect(toMaqlObjectType(type)).toBe(type);
            },
        );

        it("round-trips through normalizeMaqlObjectType", () => {
            expect(normalizeMaqlObjectType(toMaqlObjectType("computedAttribute"))).toBe("computedAttribute");
        });
    });

    describe("grammar", () => {
        it("parses a {computed_attribute/id} reference into the Tiger type", () => {
            const metric = new MaqlMetric("SELECT COUNT({computed_attribute/rep_performance})");

            expect(findAllObjects(metric)).toEqual([
                expect.objectContaining({
                    tigerType: "computedAttribute",
                    actualType: "computed_attribute",
                    id: "rep_performance",
                }),
            ]);
        });

        it("accepts a computed attribute the catalog knows", async () => {
            const ldm = new LdmObjects([], [], [], [], [], [], [computedAttribute]);

            await expect(
                validate("SELECT COUNT({computed_attribute/rep_performance})", ldm),
            ).resolves.toEqual([]);
        });

        it("reports a computed attribute the catalog does not know", async () => {
            const ldm = new LdmObjects([], [], [], [], [], [], [computedAttribute]);

            const diagnostics = await validate("SELECT COUNT({computed_attribute/missing})", ldm);

            expect(diagnostics).toEqual([
                expect.objectContaining({ message: "computedAttribute 'missing' not found" }),
            ]);
        });
    });

    describe("LdmObjects", () => {
        it("exposes computed attributes so a MAQL reference can resolve", () => {
            const ldm = new LdmObjects([], [], [], [], [], [], [computedAttribute]);

            expect(ldm.get("computedAttribute").map((item) => item.id)).toEqual(["rep_performance"]);
            expect(ldm.size).toBe(1);
        });

        it("resolves the object a {computed_attribute/id} reference denotes", () => {
            const ldm = new LdmObjects([], [], [], [], [], [], [computedAttribute]);

            const found = ldm.findObject({
                tigerType: normalizeMaqlObjectType("computed_attribute") as "computedAttribute",
                id: "rep_performance",
                ref: { identifier: "rep_performance", type: "computedAttribute" },
            });

            expect(found?.id).toBe("rep_performance");
            expect(found?.tigerType).toBe("computedAttribute");
        });

        it("does not resolve an unknown computed attribute", () => {
            const ldm = new LdmObjects([], [], [], [], [], [], [computedAttribute]);

            const found = ldm.findObject({
                tigerType: "computedAttribute",
                id: "missing",
                ref: { identifier: "missing", type: "computedAttribute" },
            });

            expect(found).toBeUndefined();
        });

        it("stays empty when no computed attributes are supplied", () => {
            expect(new LdmObjects([], [], [], [], [], []).get("computedAttribute")).toEqual([]);
        });
    });
});
