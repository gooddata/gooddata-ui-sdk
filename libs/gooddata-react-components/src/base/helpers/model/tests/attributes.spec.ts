// (C) 2018 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import { attribute } from "../attributes";

describe("Attributes", () => {
    describe("visualizationAttribute", () => {
        it("should return a simple attribute", () => {
            const expected: VisualizationObject.IVisualizationAttribute = {
                visualizationAttribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "va_0",
                },
            };
            expect(attribute("foo")).toMatchObject(expected);
        });

        it("should return a simple attribute with alias", () => {
            const expected: VisualizationObject.IVisualizationAttribute = {
                visualizationAttribute: {
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
            const expected: VisualizationObject.IVisualizationAttribute = {
                visualizationAttribute: {
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
