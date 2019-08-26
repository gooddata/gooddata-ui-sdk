// (C) 2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import { hasAttribute, hasTertiaryMeasures, isStacked } from "../mdObjectHelper";

describe("mdObjectHelper", () => {
    const visualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: "a1",
            displayForm: {
                uri: "/gdc/2",
            },
        },
    };
    const measure = {
        measure: {
            localIdentifier: "m1",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/3",
                    },
                },
            },
        },
    };

    const visualizationClass = {
        uri: "/gdc/1",
    };
    const emptyMdObject: VisualizationObject.IVisualizationObjectContent = {
        buckets: [],
        visualizationClass,
    };

    describe("hasAttribute", () => {
        it("should correctly detect attribute absence", () => {
            expect(hasAttribute(emptyMdObject)).toEqual(false);
        });

        it("should correctly detect attribute presence", () => {
            const mdObject: VisualizationObject.IVisualizationObjectContent = {
                buckets: [
                    {
                        localIdentifier: "attribute",
                        items: [visualizationAttribute],
                    },
                ],
                visualizationClass,
            };
            expect(hasAttribute(mdObject)).toEqual(true);
        });
    });

    describe("hasTertiaryMeasures", () => {
        it("should correctly detect tertiary measures absence", () => {
            expect(hasTertiaryMeasures(emptyMdObject)).toEqual(false);
        });

        it("should correctly detect tertiary measures presence", () => {
            const mdObject: VisualizationObject.IVisualizationObjectContent = {
                buckets: [
                    {
                        localIdentifier: "tertiary_measures",
                        items: [measure],
                    },
                ],
                visualizationClass,
            };
            expect(hasTertiaryMeasures(mdObject)).toEqual(true);
        });
    });

    describe("isStacked", () => {
        it("should correctly detect not stacked", () => {
            expect(isStacked(emptyMdObject)).toEqual(false);
        });

        it("should correctly detect stacked", () => {
            const mdObject: VisualizationObject.IVisualizationObjectContent = {
                buckets: [
                    {
                        localIdentifier: "segment",
                        items: [visualizationAttribute],
                    },
                ],
                visualizationClass,
            };
            expect(isStacked(mdObject)).toEqual(true);
        });
    });
});
