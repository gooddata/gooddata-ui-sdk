// (C) 2019 GoodData Corporation
import { objectRefValue, ObjRef } from "../index";

describe("objectRefValue", () => {
    const Scenarios: Array<[string, ObjRef, string | undefined]> = [
        ["return uri for UriRef", { uri: "/uri" }, "/uri"],
        ["return identifier of IdentifierRef", { identifier: "id" }, "id"],
    ];

    it.each(Scenarios)("should %s", (_desc, input, expected) => {
        expect(objectRefValue(input)).toEqual(expected);
    });

    it("should throw if input null", () => {
        // @ts-ignore
        expect(() => objectRefValue(null)).toThrow();
    });

    it("should throw if input undefined", () => {
        // @ts-ignore
        expect(() => objectRefValue(undefined)).toThrow();
    });
});
