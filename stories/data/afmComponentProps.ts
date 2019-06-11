// (C) 2007-2018 GoodData Corporation
import { AFM, VisualizationObject } from "@gooddata/typings";

export const MEASURE_1: AFM.IMeasure = {
    localIdentifier: "m1",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/storybook/obj/1",
            },
        },
    },
};

const MEASURE_1_POP: AFM.IMeasure = {
    localIdentifier: "m1_pop",
    definition: {
        popMeasure: {
            measureIdentifier: "m1",
            popAttribute: {
                uri: "/gdc/md/storybook/obj/3.df",
            },
        },
    },
};

const MEASURE_1_PREVIOUS_PERIOD: AFM.IMeasure = {
    localIdentifier: "m1_previous_period",
    definition: {
        previousPeriodMeasure: {
            measureIdentifier: "m1",
            dateDataSets: [
                {
                    dataSet: {
                        uri: "/gdc/md/storybook/obj/3.df",
                    },
                    periodsAgo: 1,
                },
            ],
        },
    },
};

const MEASURE_1_DUPLICATE: AFM.IMeasure = {
    ...MEASURE_1,
    localIdentifier: "m2",
};

export const MEASURE_2: AFM.IMeasure = {
    localIdentifier: "m2",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/storybook/obj/2",
            },
        },
    },
};

const MEASURE_2_POP: AFM.IMeasure = {
    localIdentifier: "m2_pop",
    definition: {
        popMeasure: {
            measureIdentifier: "m2",
            popAttribute: {
                uri: "/gdc/md/storybook/obj/3.df",
            },
        },
    },
};

const MEASURE_2_PREVIOUS_PERIOD: AFM.IMeasure = {
    localIdentifier: "m2_previous_period",
    definition: {
        previousPeriodMeasure: {
            measureIdentifier: "m2",
            dateDataSets: [
                {
                    dataSet: {
                        uri: "/gdc/md/storybook/obj/3.df",
                    },
                    periodsAgo: 1,
                },
            ],
        },
    },
};

const MEASURE_3: AFM.IMeasure = {
    localIdentifier: "m3",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/storybook/obj/3",
            },
        },
    },
};

export const MEASURE_WITH_NULLS: AFM.IMeasure = {
    localIdentifier: "m4",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/storybook/obj/9",
            },
        },
    },
};

const ARITHMETIC_MEASURE_SIMPLE_OPERANDS: AFM.IMeasure = {
    localIdentifier: "arithmetic_measure_1",
    definition: {
        arithmeticMeasure: {
            measureIdentifiers: ["m1", "m2"],
            operator: "sum",
        },
    },
    alias: "Sum of m1 and m2",
};

const ARITHMETIC_MEASURE_USING_ARITHMETIC: AFM.IMeasure = {
    localIdentifier: "arithmetic_measure_2",
    definition: {
        arithmeticMeasure: {
            measureIdentifiers: ["arithmetic_measure_1", "m2"],
            operator: "difference",
        },
    },
    alias: "Difference of arithmetic_measure_1 and m2",
};

const ARITHMETIC_MEASURE_WITH_FORMATTING: AFM.IMeasure = {
    localIdentifier: "arithmetic_measure_3",
    definition: {
        arithmeticMeasure: {
            measureIdentifiers: ["m1", "m2"],
            operator: "sum",
        },
    },
    format: "[backgroundColor=ffff00][green]#,##0.00 €",
    alias: "Formatted sum of m1 and m2",
};

export const ATTRIBUTE_CITIES: AFM.IAttribute = {
    localIdentifier: "a1",
    displayForm: {
        uri: "/gdc/md/storybook/obj/3.df",
    },
};

const ATTRIBUTE: AFM.IAttribute = {
    localIdentifier: "a1",
    displayForm: {
        uri: "/gdc/md/storybook/obj/4.df",
    },
};

const ATTRIBUTE_COLOURS: AFM.IAttribute = {
    localIdentifier: "a1",
    displayForm: {
        uri: "/gdc/md/storybook/obj/4.df",
    },
};

const ATTRIBUTE_POPULARITY: AFM.IAttribute = {
    localIdentifier: "a2",
    displayForm: {
        uri: "/gdc/md/storybook/obj/5.df",
    },
};

export const ATTRIBUTE_COUNTRY = {
    displayForm: {
        uri: "/gdc/md/storybook/obj/3.df",
    },
    localIdentifier: "country",
};

export const AFM_ONE_MEASURE: AFM.IAfm = {
    measures: [
        {
            ...MEASURE_1,
        },
    ],
};

export const AFM_ONE_RENAMED_MEASURE: AFM.IAfm = {
    measures: [
        {
            ...MEASURE_1,
            alias: "My Alias",
        },
    ],
};

export const AFM_ONE_MEASURE_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [MEASURE_1],
    attributes: [ATTRIBUTE],
};

export const AFM_ONE_MEASURE_TWO_ATTRIBUTES: AFM.IAfm = {
    measures: [MEASURE_1],
    attributes: [ATTRIBUTE_POPULARITY, ATTRIBUTE_COLOURS],
};

export const AFM_HEATMAP_58ROWS: AFM.IAfm = {
    measures: [MEASURE_2],
    attributes: [
        {
            ...ATTRIBUTE_COUNTRY,
            localIdentifier: "58countries",
        },
        {
            ...ATTRIBUTE_POPULARITY,
            localIdentifier: "Popularity",
        },
    ],
};

export const AFM_HEATMAP_60ROWS: AFM.IAfm = {
    measures: [MEASURE_1],
    attributes: [
        {
            ...ATTRIBUTE_COUNTRY,
            localIdentifier: "60countries",
        },
        {
            ...ATTRIBUTE_POPULARITY,
            localIdentifier: "Popularity",
        },
    ],
};

export const AFM_HEATMAP_EMPTY_CELLS: AFM.IAfm = {
    measures: [MEASURE_WITH_NULLS],
    attributes: [ATTRIBUTE_POPULARITY, ATTRIBUTE_COLOURS],
};

export const AFM_ONE_MEASURE_TWO_ATTRIBUTES_ONE_RENAMED_ATTRIBUTE: AFM.IAfm = {
    measures: [MEASURE_1],
    attributes: [
        ATTRIBUTE_POPULARITY,
        {
            ...ATTRIBUTE_COLOURS,
            alias: "My Attribute Alias",
        },
    ],
};

export const AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE: AFM.IAfm = {
    measures: [
        {
            ...MEASURE_1,
            alias: "My Measure Alias",
        },
    ],
    attributes: [
        {
            ...ATTRIBUTE,
            alias: "My Attribute Alias",
        },
    ],
};

export const AFM_ONE_ATTRIBUTE: AFM.IAfm = {
    attributes: [ATTRIBUTE],
};

export const AFM_TWO_MEASURES: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
    attributes: [ATTRIBUTE],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_POP: AFM.IAfm = {
    measures: [MEASURE_1_POP, MEASURE_1, MEASURE_2, MEASURE_2_POP],
    attributes: [ATTRIBUTE],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_PREVIOUS_PERIOD: AFM.IAfm = {
    measures: [MEASURE_1_PREVIOUS_PERIOD, MEASURE_1, MEASURE_2, MEASURE_2_PREVIOUS_PERIOD],
    attributes: [ATTRIBUTE],
};

export const AFM_TWO_MEASURES_ONE_RENAMED_ATTRIBUTE: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
    attributes: [
        {
            ...ATTRIBUTE,
            alias: "a",
        },
    ],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_CITIES_TOTALS: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_1_DUPLICATE],
    attributes: [ATTRIBUTE_CITIES],
    nativeTotals: [
        {
            measureIdentifier: MEASURE_1_DUPLICATE.localIdentifier,
            attributeIdentifiers: [],
        },
    ],
};

export const RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_CITIES_TOTALS: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [ATTRIBUTE_CITIES.localIdentifier],
            totals: [
                {
                    measureIdentifier: MEASURE_1.localIdentifier,
                    type: "sum",
                    attributeIdentifier: ATTRIBUTE_CITIES.localIdentifier,
                },
                {
                    measureIdentifier: MEASURE_1_DUPLICATE.localIdentifier,
                    type: "nat",
                    attributeIdentifier: ATTRIBUTE_CITIES.localIdentifier,
                },
            ],
        },
        {
            itemIdentifiers: ["measureGroup"],
        },
    ],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2],
    attributes: [ATTRIBUTE],
    nativeTotals: [
        {
            measureIdentifier: MEASURE_2.localIdentifier,
            attributeIdentifiers: [],
        },
    ],
};

export const RESULT_SPEC_TWO_MEASURES_ONE_ATTRIBUTE_TOTALS: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [ATTRIBUTE.localIdentifier],
            totals: [
                {
                    measureIdentifier: MEASURE_1.localIdentifier,
                    type: "sum",
                    attributeIdentifier: ATTRIBUTE.localIdentifier,
                },
                {
                    measureIdentifier: MEASURE_2.localIdentifier,
                    type: "nat",
                    attributeIdentifier: ATTRIBUTE.localIdentifier,
                },
            ],
        },
        {
            itemIdentifiers: ["measureGroup"],
        },
    ],
};

export const AFM_THREE_MEASURES_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2, MEASURE_3],
    attributes: [ATTRIBUTE],
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Lost",
                    },
                },
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_2.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_2.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Won",
                    },
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri,
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038",
    },
};

export const AFM_ONE_BAR_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Lost",
                    },
                },
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri,
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038",
    },
};

export const AFM_ONE_LINE_MEASURE_ONE_ATTRIBUTE_COMBO_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [],
        },
        {
            localIdentifier: "secondary_measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Lost",
                    },
                },
            ],
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri,
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038",
    },
};

export const AFM_TWO_MEASURES_ONE_ATTRIBUTE_SCATTER_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Lost",
                    },
                },
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_2.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_2.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Won",
                    },
                },
            ],
        },
        {
            localIdentifier: "attribute",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri,
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038",
    },
};

export const AFM_THREE_MEASURES_ONE_ATTRIBUTE_BUBBLE_MD_OBJECT: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_1.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_1.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Lost",
                    },
                },
            ],
        },
        {
            localIdentifier: "secondary_measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_2.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_2.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Won",
                    },
                },
            ],
        },
        {
            localIdentifier: "tertiary_measures",
            items: [
                {
                    measure: {
                        localIdentifier: MEASURE_3.localIdentifier,
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: ((MEASURE_3.definition as AFM.ISimpleMeasureDefinition).measure
                                        .item as AFM.IObjUriQualifier).uri,
                                },
                            },
                        },
                        title: "Size",
                    },
                },
            ],
        },
        {
            localIdentifier: "attribute",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: ATTRIBUTE.localIdentifier,
                        displayForm: {
                            uri: (ATTRIBUTE.displayForm as AFM.IObjUriQualifier).uri,
                        },
                    },
                },
            ],
        },
    ],
    filters: [],
    visualizationClass: {
        uri: "/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/76038",
    },
};

export const AFM_ARITHMETIC_MEASURES: AFM.IAfm = {
    measures: [
        ARITHMETIC_MEASURE_USING_ARITHMETIC,
        MEASURE_1,
        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
        MEASURE_2,
        MEASURE_3,
    ],
};

export const AFM_ARITHMETIC_MEASURES_ONE_ATTRIBUTE: AFM.IAfm = {
    measures: [
        ARITHMETIC_MEASURE_USING_ARITHMETIC,
        MEASURE_1,
        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
        MEASURE_2,
        MEASURE_3,
    ],
    attributes: [ATTRIBUTE],
};

export const AFM_FORMATTED_ARITHMETIC_MEASURE: AFM.IAfm = {
    measures: [MEASURE_1, MEASURE_2, ARITHMETIC_MEASURE_WITH_FORMATTING],
    attributes: [ATTRIBUTE],
};
