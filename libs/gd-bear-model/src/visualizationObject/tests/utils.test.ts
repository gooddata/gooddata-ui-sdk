// (C) 2007-2018 GoodData Corporation
import { getAttributesDisplayForms } from "../utils";
import { GdcVisualizationObject } from "../GdcVisualizationObject";

describe("visualizationObjectHelper", () => {
    describe("getAttributesDisplayForms", () => {
        it("should get all display forms from measure filters and attributes", () => {
            const mdObject: GdcVisualizationObject.IVisualizationObjectContent = {
                buckets: [
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                visualizationAttribute: {
                                    displayForm: {
                                        uri: "/gdc/md/proj/df1",
                                    },
                                    localIdentifier: "a1",
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                visualizationAttribute: {
                                    displayForm: {
                                        uri: "/gdc/md/proj/df3",
                                    },
                                    localIdentifier: "a2",
                                },
                            },
                            {
                                measure: {
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/proj/1234",
                                            },
                                            filters: [
                                                {
                                                    positiveAttributeFilter: {
                                                        displayForm: { uri: "/gdc/md/proj/df5" },
                                                        in: ["/gdc/md/proj/df5?id=1"],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    localIdentifier: "m1",
                                },
                            },
                        ],
                    },
                ],
                visualizationClass: {
                    uri: "/gdc/md/proj/table",
                },
            };

            const displayForms = getAttributesDisplayForms(mdObject);

            expect(displayForms).toEqual(["/gdc/md/proj/df5", "/gdc/md/proj/df1", "/gdc/md/proj/df3"]);
        });
    });
});
