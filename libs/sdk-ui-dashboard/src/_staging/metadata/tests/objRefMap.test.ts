// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { newMapForObjectWithIdentity } from "../objRefMap.js";

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
});
