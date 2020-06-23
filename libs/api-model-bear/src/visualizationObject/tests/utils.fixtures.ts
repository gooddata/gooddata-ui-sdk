// (C) 2019 GoodData Corporation
import { GdcVisualizationObject } from "../GdcVisualizationObject";

export const mdObjectWithAttributes: GdcVisualizationObject.IVisualizationObjectContent = {
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
