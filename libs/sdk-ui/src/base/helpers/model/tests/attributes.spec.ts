// (C) 2018 GoodData Corporation
import { attribute } from "../attributes";
import { IAttribute } from "@gooddata/sdk-model";

describe("Attributes", () => {
    describe("visualizationAttribute", () => {
        it("should return a simple attribute", () => {
            const expected: IAttribute = {
                attribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "va_0",
                },
            };
            expect(attribute("foo")).toMatchObject(expected);
        });

        it("should return a simple attribute with alias", () => {
            const expected: IAttribute = {
                attribute: {
                    alias: "alias",
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "va_1",
                },
            };
            expect(attribute("foo").alias("alias")).toMatchObject(expected);
        });

        it("should return a simple attribute with custom localIdentifier", () => {
            const expected: IAttribute = {
                attribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "custom",
                },
            };
            expect(attribute("foo").localIdentifier("custom")).toMatchObject(expected);
        });
    });
});
