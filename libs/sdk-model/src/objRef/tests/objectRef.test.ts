// (C) 2019-2021 GoodData Corporation
import { objRefToString, ObjRef, ObjRefInScope, areObjRefsEqual } from "../index.js";

describe("objRefToString", () => {
    const Scenarios: Array<[string, ObjRef, string | undefined]> = [
        ["return uri for UriRef", { uri: "/uri" }, "/uri"],
        ["return identifier of IdentifierRef", { identifier: "id" }, "id"],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expected) => {
        expect(objRefToString(input)).toEqual(expected);
    });

    it("should throw if input null", () => {
        // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
        expect(() => objRefToString(null)).toThrow();
    });

    it("should throw if input undefined", () => {
        // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
        expect(() => objRefToString(undefined)).toThrow();
    });
});

describe("areObjRefsEqual", () => {
    const Scenarios: Array<
        [boolean, string, ObjRefInScope | null | undefined, ObjRefInScope | null | undefined]
    > = [
        // same type
        [true, "uri, uri, same value", { uri: "/uri" }, { uri: "/uri" }],
        [false, "uri, uri, different value", { uri: "/uri1" }, { uri: "/uri2" }],
        [
            true,
            "identifier, identifier, same value",
            { identifier: "/identifier" },
            { identifier: "/identifier" },
        ],
        [
            true,
            "identifier, identifier, same value",
            { identifier: "/identifier", type: "attribute" },
            { identifier: "/identifier", type: "attribute" },
        ],
        [
            false,
            "identifier, identifier, different value",
            { identifier: "/identifier1" },
            { identifier: "/identifier2" },
        ],
        [
            false,
            "identifier, identifier, different value same obj type",
            { identifier: "/identifier1", type: "attribute" },
            { identifier: "/identifier2", type: "attribute" },
        ],
        [
            false,
            "identifier, identifier, different obj types",
            { identifier: "/identifier1", type: "fact" },
            { identifier: "/identifier1", type: "attribute" },
        ],
        [
            true,
            "identifier, identifier, one is missing obj type",
            { identifier: "/identifier1" },
            { identifier: "/identifier1", type: "attribute" },
        ],
        [
            true,
            "localIdentifier, localIdentifier, same value",
            { localIdentifier: "/localIdentifier" },
            { localIdentifier: "/localIdentifier" },
        ],
        [
            false,
            "localIdentifier, localIdentifier, different value",
            { localIdentifier: "/localIdentifier1" },
            { localIdentifier: "/localIdentifier2" },
        ],
        // different types
        [false, "identifier, uri, same value", { identifier: "foo" }, { uri: "foo" }],
        [false, "identifier, uri, different value", { identifier: "foo" }, { uri: "/foo/bar" }],
        [false, "localIdentifier, uri, same value", { localIdentifier: "foo" }, { uri: "foo" }],
        [false, "localIdentifier, uri, different value", { localIdentifier: "foo" }, { uri: "/foo/bar" }],
        [false, "identifier, localIdentifier, same value", { identifier: "foo" }, { localIdentifier: "foo" }],
        [
            false,
            "identifier, localIdentifier, different value",
            { identifier: "foo" },
            { localIdentifier: "bar" },
        ],
        // both nullish
        [true, "null, null", null, null],
        [true, "undefined, undefined", undefined, undefined],
        [true, "null, undefined", null, undefined],
        // nullish and non-nullish
        [false, "null, uri", null, { uri: "foo" }],
        [false, "undefined, identifier", undefined, { identifier: "foo" }],
        // one has both id and uri, the other just one of those
        [
            true,
            "uri & identifier, identifier, matching identifier",
            { identifier: "foo", uri: "/foo/bar" },
            { identifier: "foo" },
        ],
        [
            true,
            "uri & identifier, uri, matching uri",
            { identifier: "foo", uri: "/foo/bar" },
            { uri: "/foo/bar" },
        ],
        [
            true,
            "identifier, uri & identifier, matching identifier",
            { identifier: "foo" },
            { identifier: "foo", uri: "/foo/bar" },
        ],
        [
            true,
            "uri, uri & identifier, matching uri",
            { uri: "/foo/bar" },
            { identifier: "foo", uri: "/foo/bar" },
        ],
    ];

    it.each(Scenarios)("should return %s for %s", (expected, _desc, a, b) => {
        expect(areObjRefsEqual(a, b)).toEqual(expected);
    });
});
