// (C) 2019 GoodData Corporation
import { newAttribute } from "../factories";
import { IAttribute } from "..";

describe("Attributes", () => {
    describe("visualizationAttribute", () => {
        it("should return a simple attribute", () => {
            const expected: IAttribute = {
                attribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "a_foo",
                },
            };
            expect(newAttribute("foo")).toEqual(expected);
        });

        it("should return an attribute with an alias", () => {
            const expected: IAttribute = {
                attribute: {
                    alias: "alias",
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "a_foo",
                },
            };
            expect(newAttribute("foo", a => a.alias("alias"))).toEqual(expected);
        });

        it("should return an attribute with a custom localIdentifier", () => {
            const expected: IAttribute = {
                attribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "custom",
                },
            };
            expect(newAttribute("foo", undefined, "custom")).toEqual(expected);
        });
    });
});
