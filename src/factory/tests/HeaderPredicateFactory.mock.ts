// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IHeaderPredicateContext } from "../../interfaces/HeaderPredicate";

export const afm: AFM.IAfm = {
    measures: [
        // Basic measures
        {
            alias: "Measure defined by uri",
            definition: {
                measure: {
                    item: {
                        uri: "/uriBasedMeasureUri",
                    },
                },
            },
            localIdentifier: "uriBasedMeasureLocalIdentifier",
            format: "#,##0.00",
        },
        {
            alias: "Measure defined by identifier",
            definition: {
                measure: {
                    item: {
                        identifier: "identifierBasedMeasureIdentifier",
                    },
                },
            },
            localIdentifier: "identifierBasedMeasureLocalIdentifier",
            format: "#,##0.00",
        },

        // Show in % measures
        {
            alias: "Show in % ad-hoc measure defined by uri",
            definition: {
                measure: {
                    computeRatio: true,
                    item: {
                        uri: "/uriBasedRatioMeasureUri",
                    },
                },
            },
            localIdentifier: "uriBasedRatioMeasureLocalIdentifier",
            format: "#,##0.00",
        },
        {
            alias: "Show in % ad-hoc measure defined by identifier",
            definition: {
                measure: {
                    computeRatio: true,
                    item: {
                        identifier: "identifierBasedRatioMeasureIdentifier",
                    },
                },
            },
            localIdentifier: "identifierBasedRatioMeasureLocalIdentifier",
            format: "#,##0.00",
        },

        // Adhoc measures from attribute
        {
            alias: "Ad-hoc uri-based measure created from attribute",
            definition: {
                measure: {
                    aggregation: "count",
                    item: {
                        uri: "/attributeUri",
                    },
                },
            },
            localIdentifier: "uriBasedAdhocMeasureLocalIdentifier",
            format: "#,##0.00",
        },
        {
            alias: "Ad-hoc identifier-based measure created from attribute",
            definition: {
                measure: {
                    aggregation: "count",
                    item: {
                        identifier: "attributeIdentifier",
                    },
                },
            },
            localIdentifier: "identifierBasedAdhocMeasureLocalIdentifier",
            format: "#,##0.00",
        },

        // Compare measures
        {
            alias: "Compare PP measure from uri-based measure",
            localIdentifier: "uriBasedPPMeasureLocalIdentifier",
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: "uriBasedMeasureLocalIdentifier",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/bar",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            },
        },
        {
            alias: "Compare PP measure from identifier-based measure",
            localIdentifier: "identifierBasedPPMeasureLocalIdentifier",
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: "identifierBasedMeasureLocalIdentifier",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/bar",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            },
        },

        {
            alias: "Compare SP measure from uri-based measure",
            localIdentifier: "uriBasedSPMeasureLocalIdentifier",
            definition: {
                popMeasure: {
                    measureIdentifier: "uriBasedMeasureLocalIdentifier",
                    popAttribute: {
                        uri: "/foo",
                    },
                },
            },
        },
        {
            alias: "Compare SP measure from identifier-based measure",
            localIdentifier: "identifierBasedSPMeasureLocalIdentifier",
            definition: {
                popMeasure: {
                    measureIdentifier: "identifierBasedMeasureLocalIdentifier",
                    popAttribute: {
                        uri: "/foo",
                    },
                },
            },
        },

        // Ratio compare measures
        {
            alias: "Compare PP measure from uri-based ratio measure",
            localIdentifier: "uriBasedPPRatioMeasureLocalIdentifier",
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: "uriBasedRatioMeasureLocalIdentifier",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/bar",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            },
        },
        {
            alias: "Compare PP measure from identifier-based ratio measure",
            localIdentifier: "identifierBasedPPRatioMeasureLocalIdentifier",
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: "identifierBasedRatioMeasureLocalIdentifier",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/bar",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            },
        },

        {
            alias: "Compare SP measure from uri-based ratio measure",
            localIdentifier: "uriBasedSPRatioMeasureLocalIdentifier",
            definition: {
                popMeasure: {
                    measureIdentifier: "uriBasedRatioMeasureLocalIdentifier",
                    popAttribute: {
                        uri: "/foo",
                    },
                },
            },
        },
        {
            alias: "Compare SP measure from identifier-based ratio measure",
            localIdentifier: "identifierBasedSPRatioMeasureLocalIdentifier",
            definition: {
                popMeasure: {
                    measureIdentifier: "identifierBasedRatioMeasureLocalIdentifier",
                    popAttribute: {
                        uri: "/foo",
                    },
                },
            },
        },

        // Arithmetic measures
        {
            alias: "Arithmetic measure from mixed-based measures",
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: [
                        "uriBasedMeasureLocalIdentifier",
                        "identifierBasedMeasureLocalIdentifier",
                    ],
                    operator: "sum",
                },
            },
            localIdentifier: "arithmeticMeasureLocalIdentifier",
        },

        {
            alias: "Arithmetic measure of 2nd order from mixed-based measures",
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: [
                        "arithmeticMeasureLocalIdentifier",
                        "arithmeticMeasureLocalIdentifier",
                    ],
                    operator: "sum",
                },
            },
            localIdentifier: "arithmeticMeasureOf2ndOrderLocalIdentifier",
        },

        {
            alias: "Arithmetic measure from uri-based compare PP+SP measures",
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: [
                        "uriBasedPPMeasureLocalIdentifier",
                        "uriBasedSPMeasureLocalIdentifier",
                    ],
                    operator: "sum",
                },
            },
            localIdentifier: "uriBasedCompareArithmeticMeasureLocalIdentifier",
        },
        {
            alias: "Arithmetic measure from identifier-based compare PP+SP measures",
            definition: {
                arithmeticMeasure: {
                    measureIdentifiers: [
                        "identifierBasedPPMeasureLocalIdentifier",
                        "identifierBasedSPMeasureLocalIdentifier",
                    ],
                    operator: "sum",
                },
            },
            localIdentifier: "identifierBasedCompareArithmeticMeasureLocalIdentifier",
        },
        // Derived from AM
        {
            alias: "Compare PP measure derived from AM",
            definition: {
                previousPeriodMeasure: {
                    measureIdentifier: "arithmeticMeasureLocalIdentifier",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/bar",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            },
            localIdentifier: "identifierComparePPDerivedFromAM",
        },
        {
            alias: "Compare SP measure derived from AM",
            definition: {
                popMeasure: {
                    measureIdentifier: "arithmeticMeasureLocalIdentifier",
                    popAttribute: {
                        uri: "/foo",
                    },
                },
            },
            localIdentifier: "identifierCompareSPDerivedFromAM",
        },
    ],

    attributes: [
        {
            displayForm: {
                uri: "/attributeDisplayFormUri",
            },
            localIdentifier: "attributeLocalIdentifier",
        },
    ],
};

export const measureHeaders: { [key: string]: Execution.IMeasureHeaderItem } = {
    uriBasedMeasure: {
        measureHeaderItem: {
            uri: "/uriBasedMeasureUri",
            localIdentifier: "uriBasedMeasureLocalIdentifier",
            identifier: "uriBasedMeasureIdentifier",
            name: "uriBasedMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedMeasure: {
        measureHeaderItem: {
            uri: "identifierBasedMeasureUri",
            localIdentifier: "identifierBasedMeasureLocalIdentifier",
            identifier: "identifierBasedMeasureIdentifier",
            name: "identifierBasedMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedRatioMeasureLocalIdentifier",
            name: "uriBasedMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedRatioMeasureLocalIdentifier",
            name: "identifierBasedRatioMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedAdhocMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedAdhocMeasureLocalIdentifier",
            name: "uriBasedAdhocMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedAdhocMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedAdhocMeasureLocalIdentifier",
            name: "identifierBasedAdhocMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedPPMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedPPMeasureLocalIdentifier",
            name: "uriBasedSPMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedPPMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedPPMeasureLocalIdentifier",
            name: "uriBasedSPMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedSPMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedSPMeasureLocalIdentifier",
            name: "uriBasedSPMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedSPMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedSPMeasureLocalIdentifier",
            name: "identifierBasedSPMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedPPRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedPPRatioMeasureLocalIdentifier",
            name: "uriBasedSPRatioMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedPPRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedPPRatioMeasureLocalIdentifier",
            name: "uriBasedSPRatioMeasureName",
            format: "#,##0.00",
        },
    },

    uriBasedSPRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedSPRatioMeasureLocalIdentifier",
            name: "uriBasedSPRatioMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedSPRatioMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedSPRatioMeasureLocalIdentifier",
            name: "identifierBasedSPRatioMeasureName",
            format: "#,##0.00",
        },
    },

    arithmeticMeasure: {
        measureHeaderItem: {
            localIdentifier: "arithmeticMeasureLocalIdentifier",
            name: "arithmeticMeasureName",
            format: "#,##0.00",
        },
    },

    arithmeticMeasureOf2ndOrder: {
        measureHeaderItem: {
            localIdentifier: "arithmeticMeasureOf2ndOrderLocalIdentifier",
            name: "arithmeticMeasureOf2ndName",
            format: "#,##0.00",
        },
    },

    uriBasedCompareArithmeticMeasure: {
        measureHeaderItem: {
            localIdentifier: "uriBasedCompareArithmeticMeasureLocalIdentifier",
            name: "uriBasedCompareArithmeticMeasureName",
            format: "#,##0.00",
        },
    },
    identifierBasedCompareArithmeticMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierBasedCompareArithmeticMeasureLocalIdentifier",
            name: "identifierBasedCompareArithmeticMeasureName",
            format: "#,##0.00",
        },
    },
    derivedPPFromArithmeticMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierComparePPDerivedFromAM",
            name: "identifierComparePPDerivedFromAM",
            format: "#,##0.00",
        },
    },
    derivedSPFromArithmeticMeasure: {
        measureHeaderItem: {
            localIdentifier: "identifierCompareSPDerivedFromAM",
            name: "identifierCompareSPDerivedFromAM",
            format: "#,##0.00",
        },
    },
};

export const attributeHeader: Execution.IAttributeHeader = {
    attributeHeader: {
        uri: "/attributeUri",
        identifier: "attributeIdentifier",
        localIdentifier: "attributeLocalIdentifier",
        name: "attributeName",
        formOf: {
            uri: "/attributeElementUri",
            identifier: "attributeElementIdentifier",
            name: "attributeElementName",
        },
    },
};

export const attributeHeaderItem: Execution.IResultAttributeHeaderItem = {
    attributeHeaderItem: {
        uri: "/attributeItemUri",
        name: "attributeItemName",
    },
};

export const executionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [attributeHeader],
        },
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            measureHeaders.uriBasedMeasure,
                            measureHeaders.identifierBasedMeasure,

                            measureHeaders.uriBasedRatioMeasure,
                            measureHeaders.identifierBasedRatioMeasure,

                            measureHeaders.uriBasedAdhocMeasure,
                            measureHeaders.identifierBasedAdhocMeasure,

                            measureHeaders.uriBasedPPMeasure,
                            measureHeaders.identifierBasedPPMeasure,

                            measureHeaders.uriBasedSPMeasure,
                            measureHeaders.identifierBasedSPMeasure,

                            measureHeaders.uriBasedPPRatioMeasure,
                            measureHeaders.identifierBasedPPRatioMeasure,

                            measureHeaders.uriBasedSPRatioMeasure,
                            measureHeaders.identifierBasedSPRatioMeasure,

                            measureHeaders.arithmeticMeasure,

                            measureHeaders.arithmeticMeasureOf2ndOrder,

                            measureHeaders.uriBasedCompareArithmeticMeasure,
                            measureHeaders.identifierBasedCompareArithmeticMeasure,
                        ],
                    },
                },
            ],
        },
    ],
    links: {
        executionResult: "foo",
    },
};

export const context: IHeaderPredicateContext = {
    afm,
    executionResponse,
};
