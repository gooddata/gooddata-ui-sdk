// (C) 2022 GoodData Corporation
import {
    prepareCustomOverride,
    resolveCustomOverride,
    setCustomLabels,
    setCustomMetrics,
    setDerivedMetrics,
} from "../utils";
import { IDimensionDescriptor, IExecutionDefinition } from "@gooddata/sdk-model";

describe("Export payload", () => {
    const dimensions: IDimensionDescriptor[] = [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d_pop",
                                    name: "20cd0468e8fe4bdd95bdd7414e996d1d_pop",
                                    format: "#,#.##",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d",
                                    name: "20cd0468e8fe4bdd95bdd7414e996d1d",
                                    format: "#,#.##",
                                    identifier: "f_amount",
                                    ref: {
                                        identifier: "f_amount",
                                        type: "fact",
                                    },
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "d5732e827a454f5393a9dc01f16778a9_pop",
                                    name: "d5732e827a454f5393a9dc01f16778a9_pop",
                                    format: "#,#.##",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "d5732e827a454f5393a9dc01f16778a9",
                                    name: "d5732e827a454f5393a9dc01f16778a9",
                                    format: "#,#.##",
                                    identifier: "f_probability",
                                    ref: {
                                        identifier: "f_probability",
                                        type: "fact",
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        },
        {
            headers: [
                {
                    attributeHeader: {
                        uri: "",
                        identifier: "f_product.ls__id__nm_name",
                        ref: {
                            identifier: "f_product.ls__id__nm_name",
                            type: "displayForm",
                        },
                        formOf: {
                            identifier: "f_product.ls__id__nm_name",
                            name: "Ls  id  nm name",
                            uri: "",
                            ref: {
                                identifier: "f_product.ls__id__nm_name",
                                type: "attribute",
                            },
                        },
                        localIdentifier: "c2f62d0e05c045bebfb0ef02c3ab557d",
                        name: "Ls  id  nm name",
                        totalItems: [],
                    },
                },
                {
                    attributeHeader: {
                        uri: "",
                        identifier: "f_stage.ls__id__nm_name",
                        ref: {
                            identifier: "f_stage.ls__id__nm_name",
                            type: "displayForm",
                        },
                        formOf: {
                            identifier: "f_stage.ls__id__nm_name",
                            name: "Ls  id  nm name",
                            uri: "",
                            ref: {
                                identifier: "f_stage.ls__id__nm_name",
                                type: "attribute",
                            },
                        },
                        localIdentifier: "228f1cbe72844a47b342cabf5580aa9a",
                        name: "Ls  id  nm name",
                        totalItems: [],
                    },
                },
            ],
        },
    ];
    const definition: IExecutionDefinition = {
        workspace: "04b385b1e3304a9faf588c9e0610d299",
        buckets: [
            {
                items: [
                    {
                        measure: {
                            localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d",
                                    popAttribute: {
                                        identifier: "dt_oppcreated_timestamp.year",
                                        type: "attribute",
                                    },
                                },
                            },
                            alias: "Amount - previous year",
                            title: "Sum of F amount - SP year ago",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        identifier: "f_amount",
                                        type: "fact",
                                    },
                                    aggregation: "sum",
                                    filters: [],
                                },
                            },
                            title: "Sum of F amount",
                            format: "#,##0.00%",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "d5732e827a454f5393a9dc01f16778a9_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "d5732e827a454f5393a9dc01f16778a9",
                                    popAttribute: {
                                        identifier: "dt_oppcreated_timestamp.year",
                                        type: "attribute",
                                    },
                                },
                            },
                            title: "Probability - SP year ago",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "d5732e827a454f5393a9dc01f16778a9",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        identifier: "f_probability",
                                        type: "fact",
                                    },
                                    aggregation: "sum",
                                    filters: [],
                                },
                            },
                            title: "Sum of F probability",
                            alias: "Probability",
                            format: "<#>",
                        },
                    },
                ],
                localIdentifier: "measures",
            },
            {
                items: [
                    {
                        attribute: {
                            localIdentifier: "c2f62d0e05c045bebfb0ef02c3ab557d",
                            displayForm: {
                                identifier: "f_product.ls__id__nm_name",
                                type: "displayForm",
                            },
                            alias: "Attribute custom",
                        },
                    },
                    {
                        attribute: {
                            localIdentifier: "228f1cbe72844a47b342cabf5580aa9a",
                            displayForm: {
                                identifier: "f_stage.ls__id__nm_name",
                                type: "displayForm",
                            },
                            alias: "Custom one",
                        },
                    },
                ],
                localIdentifier: "view",
            },
        ],
        attributes: [
            {
                attribute: {
                    localIdentifier: "c2f62d0e05c045bebfb0ef02c3ab557d",
                    displayForm: {
                        identifier: "f_product.ls__id__nm_name",
                        type: "displayForm",
                    },
                    alias: "Attribute custom",
                },
            },
            {
                attribute: {
                    localIdentifier: "228f1cbe72844a47b342cabf5580aa9a",
                    displayForm: {
                        identifier: "f_stage.ls__id__nm_name",
                        type: "displayForm",
                    },
                    alias: "Custom one",
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d_pop",
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d",
                            popAttribute: {
                                identifier: "dt_oppcreated_timestamp.year",
                                type: "attribute",
                            },
                        },
                    },
                    alias: "Amount - previous year",
                    title: "Sum of F amount - SP year ago",
                },
            },
            {
                measure: {
                    localIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "f_amount",
                                type: "fact",
                            },
                            aggregation: "sum",
                            filters: [],
                        },
                    },
                    title: "Sum of F amount",
                    format: "#,##0.00%",
                },
            },
            {
                measure: {
                    localIdentifier: "d5732e827a454f5393a9dc01f16778a9_pop",
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "d5732e827a454f5393a9dc01f16778a9",
                            popAttribute: {
                                identifier: "dt_oppcreated_timestamp.year",
                                type: "attribute",
                            },
                        },
                    },
                    title: "Probability - SP year ago",
                },
            },
            {
                measure: {
                    localIdentifier: "d5732e827a454f5393a9dc01f16778a9",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "f_probability",
                                type: "fact",
                            },
                            aggregation: "sum",
                            filters: [],
                        },
                    },
                    title: "Sum of F probability",
                    alias: "Probability",
                    format: "<#>",
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["measureGroup"],
            },
            {
                itemIdentifiers: ["c2f62d0e05c045bebfb0ef02c3ab557d", "228f1cbe72844a47b342cabf5580aa9a"],
            },
        ],
        filters: [],
        sortBy: [
            {
                attributeSortItem: {
                    attributeIdentifier: "c2f62d0e05c045bebfb0ef02c3ab557d",
                    direction: "desc",
                    aggregation: "sum",
                },
            },
            {
                measureSortItem: {
                    direction: "desc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "20cd0468e8fe4bdd95bdd7414e996d1d_pop",
                            },
                        },
                    ],
                },
            },
        ],
        postProcessing: {},
    };

    test("should resolve custom override step by step", () => {
        const { metrics, labels } = prepareCustomOverride(dimensions);
        expect(metrics).toMatchSnapshot();
        expect(labels).toMatchSnapshot();

        const customMetrics = setCustomMetrics(definition, metrics ?? {});
        const customLabels = setCustomLabels(definition, labels ?? {});
        expect(customMetrics).toMatchSnapshot();
        expect(customLabels).toMatchSnapshot();

        const derivedMetrics = setDerivedMetrics(definition, customMetrics);
        expect(derivedMetrics).toMatchSnapshot();

        const customOverride = resolveCustomOverride(dimensions, definition);
        expect(customOverride).toMatchSnapshot();
        expect(customOverride).toEqual({
            metrics: derivedMetrics,
            labels: customLabels,
        });
    });

    test("should resolve custom override with empty data", () => {
        const emptyDimensions: IDimensionDescriptor[] = [];
        const emptyDefinition: IExecutionDefinition = {
            attributes: [],
            buckets: [],
            dimensions: [],
            filters: [],
            measures: [],
            sortBy: [],
            workspace: "",
        };
        const customOverride = resolveCustomOverride(emptyDimensions, emptyDefinition);
        expect(customOverride).toMatchSnapshot();
    });
});
