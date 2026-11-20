// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IAttributeDisplayFormMetadataObject, idRef, uriRef } from "@gooddata/sdk-model";

import { newDisplayFormMap, newMapForObjectWithIdentity } from "./objRefMap.js";

const objWithBoth = (id: number, obj: number = id) => ({
    identifier: `id${id}`,
    uri: `uri${id}`,
    ref: {
        identifier: `id${id}`,
    },
    value: obj,
});

describe("ObjRefMap", () => {
    describe("for objects whose ref contains both identifier and uri", () => {
        const UnifiedTestData = [objWithBoth(1), objWithBoth(2), objWithBoth(3)];

        it("should handle insert", () => {
            const map = newMapForObjectWithIdentity(UnifiedTestData);

            expect(map.size).toEqual(3);
            expect(Array.from(map.values())).toEqual(UnifiedTestData);
        });

        it("should handle insert of duplicates using last-win", () => {
            const others = [objWithBoth(1, 10), objWithBoth(2, 20), objWithBoth(3, 30)];
            const map = newMapForObjectWithIdentity([...UnifiedTestData, ...others]);

            expect(Array.from(map.values())).toEqual(others);
        });

        it("should allow lookup by either id or uri if the stored object had both", () => {
            const map = newMapForObjectWithIdentity(UnifiedTestData);

            expect(map.get(idRef("id1"))).toBeDefined();
            expect(map.get(uriRef("uri1"))).toBeDefined();
            expect(map.get(idRef("id2"))).toBeDefined();
            expect(map.get(uriRef("uri2"))).toBeDefined();
            expect(map.get(idRef("id3"))).toBeDefined();
            expect(map.get(uriRef("uri3"))).toBeDefined();
        });
    });

    describe("for a computed attribute sharing its id with a label", () => {
        const displayForm = (
            id: string,
            type: "displayForm" | "computedAttribute",
        ): IAttributeDisplayFormMetadataObject => ({
            type: "displayForm",
            ref: idRef(id, type),
            id,
            uri: type === "displayForm" ? `/labels/${id}` : id,
            title: `${type} ${id}`,
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            attribute: idRef(id, type === "displayForm" ? "attribute" : "computedAttribute"),
        });
        const label = displayForm("region", "displayForm");
        const computedAttribute = displayForm("region", "computedAttribute");

        describe.each([
            ["label first, strict", [label, computedAttribute], true],
            ["computed attribute first, strict", [computedAttribute, label], true],
            ["label first, loose", [label, computedAttribute], false],
            ["computed attribute first, loose", [computedAttribute, label], false],
        ])("%s", (_, items, strict) => {
            const map = newDisplayFormMap(items, strict);

            it("should resolve the label by its displayForm-typed ref", () => {
                expect(map.get(idRef("region", "displayForm"))).toBe(label);
            });

            it("should resolve the computed attribute by its computedAttribute-typed ref", () => {
                expect(map.get(idRef("region", "computedAttribute"))).toBe(computedAttribute);
            });

            it("should keep both items", () => {
                expect(Array.from(map.values())).toHaveLength(2);
            });
        });

        it.each([true, false])(
            "should not resolve a computed attribute by the map's type (strict: %s)",
            (strict) => {
                const map = newDisplayFormMap([computedAttribute], strict);

                expect(map.get(idRef("region", "displayForm"))).toBeUndefined();
            },
        );
    });
});
