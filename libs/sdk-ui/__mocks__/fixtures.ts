// (C) 2007-2019 GoodData Corporation
import { LegacyExecutionRecording, legacyRecordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { IInsight, uriRef } from "@gooddata/sdk-model";
import { DataViewFacade } from "../src/base/results/facade.js";
import { createRequire } from "module";

export const testWorkspace = "testWorkspace";

const require = createRequire(import.meta.url);

function legacyRecordedDataFacade(rec: LegacyExecutionRecording): DataViewFacade {
    return DataViewFacade.for(legacyRecordedDataView(rec));
}

const BarChartForDrillTests = {
    definition: require("./recordings/bar_chart_for_drill_tests/definition.json"),
    response: require("./recordings/bar_chart_for_drill_tests/response.json"),
    result: require("./recordings/bar_chart_for_drill_tests/result.json"),
};

export const barChartForDrillTests = legacyRecordedDataFacade(BarChartForDrillTests);

export const insightWithPoP: IInsight = {
    insight: {
        identifier: "popMeasureInsight",
        uri: "/some/uri/popMeasureInsight",
        ref: uriRef("/some/uri/popMeasureInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "# Accounts with AD Query",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "m1",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_previous_period",
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: "m1",
                                    dateDataSets: [
                                        {
                                            dataSet: {
                                                uri: "/gdc/md/myproject/obj/921",
                                            },
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "PoP measure",
        sorts: [],
        properties: {},
    },
};

export const insightWithPoPAndAlias: IInsight = {
    insight: {
        identifier: "popMeasureWithAliasInsight",
        uri: "/some/uri/popMeasureInsight",
        ref: uriRef("/some/uri/popMeasureInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "# Accounts with AD Query",
                            alias: "AD Queries",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "m1",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_previous_period",
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: "m1",
                                    dateDataSets: [
                                        {
                                            dataSet: {
                                                uri: "/gdc/md/myproject/obj/921",
                                            },
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "PoP measure with alias",
        sorts: [],
        properties: {},
    },
};

export const insightWithArithmeticAndDerivedMeasures: IInsight = {
    insight: {
        identifier: "arithmeticAndDerivedMeasureInsight",
        uri: "/some/uri/arithmeticAndDerivedMeasureInsight",
        ref: uriRef("/some/uri/arithmeticAndDerivedMeasureInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "am1",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "m1_pop"],
                                },
                            },
                            title: "ignored title",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "AD Accounts",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "m1",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                            title: "ignored title",
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "Arithmetic and derived measures",
        sorts: [],
        properties: {},
    },
};

export const insightWithArithmeticMeasureTree: IInsight = {
    insight: {
        identifier: "arithmeticMeasureTreeInsight",
        uri: "/some/uri/arithmeticMeasureTreeInsight",
        ref: uriRef("/some/uri/arithmeticMeasureTreeInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier:
                                "arithmetic_measure_created_from_complicated_arithmetic_measures",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: [
                                        "arithmetic_measure_created_from_arithmetic_measures",
                                        "arithmetic_measure_created_from_simple_measures",
                                    ],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "AD Accounts",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m2",
                            title: "KD Accounts",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/1245",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "tree_level_2",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "tree_level_1"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "tree_level_1",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "tree_level_0"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "tree_level_0",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "m2"],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "Arithmetic measure tree",
        sorts: [],
        properties: {},
    },
};

export const insightWithComplexArithmeticMeasureTree: IInsight = {
    insight: {
        identifier: "complexArithmeticMeasureTreeInsight",
        uri: "/some/uri/complexArithmeticMeasureTreeInsight",
        ref: uriRef("/some/uri/complexArithmeticMeasureTreeInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier:
                                "arithmetic_measure_created_from_complicated_arithmetic_measures",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: [
                                        "arithmetic_measure_created_from_arithmetic_measures",
                                        "arithmetic_measure_created_from_simple_measures",
                                    ],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "# Accounts with AD Query",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m2",
                            title: "# Accounts with KD Query",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/1245",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m3",
                            title: "# Accounts with AD Query",
                            alias: "AD Queries",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/8172",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m4",
                            title: "# Accounts with KD Query",
                            alias: "KD Queries",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/1245",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_pop",
                            title: "M1 Pop Measure Title",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "m1",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_previous_period",
                            title: "M1 Previous Measure Title",
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: "m1",
                                    dateDataSets: [
                                        {
                                            dataSet: {
                                                uri: "/gdc/md/myproject/obj/921",
                                            },
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_pop_renamed",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "m1",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                            alias: "Renamed SP last year M1",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "m1_previous_period_renamed",
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: "m1",
                                    dateDataSets: [
                                        {
                                            dataSet: {
                                                uri: "/gdc/md/myproject/obj/921",
                                            },
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                            alias: "Renamed previous period M1",
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "derived_measure_from_arithmetic_measure",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "arithmetic_measure_created_from_simple_measures",
                                    popAttribute: {
                                        uri: "/gdc/md/myproject/obj/1514",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "arithmetic_measure_created_from_simple_measures",
                            title: "Arithmetic sum(m1, m2) Measure Title",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "m2"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "arithmetic_measure_created_from_renamed_simple_measures",
                            title: "Arithmetic sum(m3, m4) Measure Title",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m3", "m4"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "arithmetic_measure_created_from_derived_measures",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1_pop", "m1_previous_period"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "arithmetic_measure_created_from_arithmetic_measures",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: [
                                        "arithmetic_measure_created_from_renamed_simple_measures",
                                        "arithmetic_measure_created_from_renamed_derived_measures",
                                    ],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "arithmetic_measure_created_from_renamed_derived_measures",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1_pop_renamed", "m1_previous_period_renamed"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "invalid_arithmetic_measure_with_missing_dependency",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: ["m1", "m666"],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "invalid_arithmetic_measure_with_cyclic_dependency_1",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: [
                                        "m1",
                                        "invalid_arithmetic_measure_with_cyclic_dependency_2",
                                    ],
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "invalid_arithmetic_measure_with_cyclic_dependency_2",
                            definition: {
                                arithmeticMeasure: {
                                    operator: "sum",
                                    measureIdentifiers: [
                                        "m2",
                                        "invalid_arithmetic_measure_with_cyclic_dependency_1",
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "Complex arithmetic measure tree",
        sorts: [],
        properties: {},
    },
};

export const insightWithMultipleMeasureBuckets: IInsight = {
    insight: {
        identifier: "multipleMeasureBucketsInsight",
        uri: "/some/uri/multipleMeasureBucketsInsight",
        ref: uriRef("/some/uri/multipleMeasureBucketsInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                            format: "#,##0.00",
                            title: "Sum of Email Clicks",
                            definition: {
                                measureDefinition: {
                                    aggregation: "sum",
                                    item: {
                                        uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "secondary_measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_pop",
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                    popAttribute: {
                                        uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15330",
                                    },
                                },
                            },
                        },
                    },
                    {
                        measure: {
                            localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_previous_period",
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                    dateDataSets: [
                                        {
                                            dataSet: {
                                                uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/921",
                                            },
                                            periodsAgo: 1,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "Multiple measure buckets",
        sorts: [],
        properties: {},
    },
};

export const insightWithMultipleMeasureBucketsAndFormats: IInsight = {
    insight: {
        identifier: "multipleMeasureBucketsInsight",
        uri: "/some/uri/multipleMeasureBucketsInsight",
        ref: uriRef("/some/uri/multipleMeasureBucketsInsight"),
        visualizationUrl: "local:test",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "count_format",
                            format: "#0x",
                            title: "Count with format",
                            definition: {
                                measureDefinition: {
                                    aggregation: "sum",
                                    item: {
                                        uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "count_relative",
                            title: "Count relative",
                            definition: {
                                measureDefinition: {
                                    computeRatio: true,
                                    aggregation: "sum",
                                    item: {
                                        uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "count",
                            title: "Count",
                            definition: {
                                measureDefinition: {
                                    aggregation: "sum",
                                    item: {
                                        uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
        filters: [],
        title: "Multiple measure buckets",
        sorts: [],
        properties: {},
    },
};
