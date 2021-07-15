// (C) 2021 GoodData Corporation
import { newMapForObjectWithRef } from "../objRefMap";
import { idRef, uriRef } from "@gooddata/sdk-model";

const objWithIdRef = (id: number, obj: number = id) => ({
    ref: idRef(`id${id}`),
    value: obj,
});

const objWithUriRef = (id: number, obj: number = id) => ({
    ref: uriRef(`uri${id}`),
    value: obj,
});

const objWithBoth = (id: number, obj: number = id) => ({
    ref: {
        identifier: `id${id}`,
        uri: `uri${id}`,
    },
    value: obj,
});

describe("ObjRefMap", () => {
    describe("for objects that have mix of identifier and uri", () => {
        const MixedTestData = [objWithIdRef(1), objWithUriRef(2), objWithBoth(3)];

        it("should handle insert", () => {
            const map = newMapForObjectWithRef(MixedTestData);

            expect(Array.from(map.values())).toEqual(MixedTestData);
        });

        it("should handle insert of duplicates using first-win", () => {
            const others = [objWithIdRef(1, 10), objWithUriRef(2, 20), objWithBoth(3, 30)];
            const map = newMapForObjectWithRef([...others, ...MixedTestData]);

            expect(Array.from(map.values())).toEqual(others);
        });

        it("should allow lookup by either id or uri if the stored object had both", () => {
            const map = newMapForObjectWithRef(MixedTestData);

            expect(map.get(idRef("id3"))).toBeDefined();
            expect(map.get(uriRef("uri3"))).toBeDefined();
        });

        it("should allow lookup only by id if the stored object only has id", () => {
            const map = newMapForObjectWithRef(MixedTestData);

            expect(map.get(idRef("id1"))).toBeDefined();
            expect(map.get(uriRef("uri1"))).toBeUndefined();
        });

        it("should allow lookup only by uri if the stored object only has uri", () => {
            const map = newMapForObjectWithRef(MixedTestData);

            expect(map.get(idRef("id2"))).toBeUndefined();
            expect(map.get(uriRef("uri2"))).toBeDefined();
        });

        it("should bomb if trying to insert object that has both id&uri but previous item with same id and no uri was inserted ", () => {
            expect(() => {
                newMapForObjectWithRef([...MixedTestData, objWithBoth(1)]);
            }).toThrow();
        });
    });

    describe("for objects that have both identifier and uri", () => {
        const UnifiedTestData = [objWithBoth(1), objWithBoth(2), objWithBoth(3)];

        it("should handle insert", () => {
            const map = newMapForObjectWithRef(UnifiedTestData);

            expect(map.size).toEqual(3);
            expect(Array.from(map.values())).toEqual(UnifiedTestData);
        });

        it("should handle insert of duplicates using first-win", () => {
            const others = [objWithBoth(1, 10), objWithBoth(2, 20), objWithBoth(3, 30)];
            const map = newMapForObjectWithRef([...others, ...UnifiedTestData]);

            expect(Array.from(map.values())).toEqual(others);
        });

        it("should allow lookup by either id or uri if the stored object had both", () => {
            const map = newMapForObjectWithRef(UnifiedTestData);

            expect(map.get(idRef("id1"))).toBeDefined();
            expect(map.get(uriRef("uri1"))).toBeDefined();
            expect(map.get(idRef("id2"))).toBeDefined();
            expect(map.get(uriRef("uri2"))).toBeDefined();
            expect(map.get(idRef("id3"))).toBeDefined();
            expect(map.get(uriRef("uri3"))).toBeDefined();
        });
    });
});
