// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { Granularities } from "../constants/granularities";
import { INormalizedAFM, ALL_TIME_GRANULARITY } from "../utils/AfmUtils";

export const absoluteDateFilter1: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/md/project/obj/727",
        },
        from: "2014-01-01",
        to: "2016-01-01",
    },
};

export const absoluteDateFilter2: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: "/gdc/md/project/obj/626",
        },
        from: "2017-01-01",
        to: "2018-01-01",
    },
};

export const relativeDateFilter: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            uri: "/gdc/md/project/obj/727",
        },
        from: -10,
        to: -9,
        granularity: Granularities.YEAR,
    },
};

export const allTimeDateFilter: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: {
            identifier: "/gdc/md/project/obj/727",
        },
        from: 0,
        to: 0,
        granularity: ALL_TIME_GRANULARITY,
    },
};

export const positiveAttributeFilter: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: {
            uri: "/gdc/md/project/obj/42",
        },
        in: ["/gdc/md/project/obj/42?val=1", "/gdc/md/project/obj/42?val=2"],
    },
};

export const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: {
            uri: "/gdc/md/project/obj/43",
        },
        notIn: ["/gdc/md/project/obj/43?val=1"],
    },
};

export const metricSum: AFM.IMeasure = {
    localIdentifier: "metric_sum",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/measure/obj/1",
            },
            aggregation: "sum",
        },
    },
};

export const metricSum2: AFM.IMeasure = {
    localIdentifier: "metric_sum_2",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/measure/obj/2",
            },
            filters: [relativeDateFilter],
            aggregation: "sum",
        },
    },
};

export const metricSum3: AFM.IMeasure = {
    localIdentifier: "metric_sum_3",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/measure/obj/3",
            },
            filters: [absoluteDateFilter2],
            aggregation: "sum",
        },
    },
};

export const metricSum4: AFM.IMeasure = {
    localIdentifier: "metric_sum_4",
    definition: {
        measure: {
            item: {
                uri: "/gdc/md/measure/obj/4",
            },
            filters: [absoluteDateFilter1],
            aggregation: "sum",
        },
    },
};

export const metricInPercent: AFM.IMeasure = {
    localIdentifier: "measure_in_percent",
    definition: {
        measure: {
            item: {
                uri: "measure_identifier",
            },
            showInPercent: true,
            filters: [relativeDateFilter],
        },
    },
};

export const metricInPercentPop: AFM.IMeasure = {
    localIdentifier: "measure_pop",
    definition: {
        popMeasure: {
            measureIdentifier: "measure_in_percent",
            popAttribute: {
                identifier: "attribute_display_form_identifier",
            },
        },
    },
};

export const simpleMeasure: AFM.IMeasure = {
    localIdentifier: "m1",
    definition: {
        measure: {
            item: {
                uri: "/gdc/mock/measure",
            },
        },
    },
};

export const popMeasure: AFM.IMeasure = {
    localIdentifier: "m1",
    definition: {
        popMeasure: {
            measureIdentifier: "m1",
            popAttribute: {
                uri: "/gdc/mock/measure",
            },
        },
    },
};

export const previousPeriodMeasure: AFM.IMeasure = {
    localIdentifier: "m1",
    definition: {
        previousPeriodMeasure: {
            measureIdentifier: "m1",
            dateDataSets: [
                {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    periodsAgo: 1,
                },
            ],
        },
    },
};

export const arithmeticMeasure: AFM.IMeasure = {
    localIdentifier: "arithmetic_measure_1",
    definition: {
        arithmeticMeasure: {
            measureIdentifiers: ["m1", "m2"],
            operator: "sum",
        },
    },
};

export const simpleMeasureWithAttributeFilters: AFM.IMeasure = {
    localIdentifier: "m1",
    definition: {
        measure: {
            item: {
                uri: "/gdc/mock/measure",
            },
            filters: [positiveAttributeFilter, negativeAttributeFilter],
        },
    },
};

export const afmWithMetricDateFilter: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum, metricSum2],
    filters: [absoluteDateFilter1],
};

export const afmWithoutMetricDateFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [
        metricSum,
        {
            localIdentifier: "metric4_sum",
            definition: {
                measure: {
                    item: {
                        uri: "/gdc/md/measure/obj/4",
                    },
                    filters: [],
                    aggregation: "sum",
                },
            },
        },
        {
            localIdentifier: "metric5_sum",
            definition: {
                measure: {
                    item: {
                        uri: "/gdc/md/measure/obj/5",
                    },
                    filters: [],
                    aggregation: "sum",
                },
            },
        },
    ],
    filters: [absoluteDateFilter1],
};

export const afmWithoutGlobalFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum],
    filters: [],
};

export const afmWithAbsoluteGlobalDateFilter: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum],
    filters: [absoluteDateFilter1],
};

export const afmWithRelativeGlobalDateFilter: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum],
    filters: [relativeDateFilter],
};

export const afmWithAttributeGlobalDateFilter: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum],
    filters: [positiveAttributeFilter],
};

export const afmWithAttributeAndDateGlobalFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum],
    filters: [positiveAttributeFilter, relativeDateFilter, absoluteDateFilter1],
};

export const afmWithPopMeasure: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum, popMeasure],
    filters: [],
};

export const afmWithPreviousPeriodMeasure: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum, previousPeriodMeasure],
    filters: [],
};

export const afmWithArithmeticMeasure: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [metricSum, arithmeticMeasure],
    filters: [],
};

export const afmWithAllMetricTypesSomeWithFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [
        metricSum,
        metricSum2,
        metricSum3,
        simpleMeasureWithAttributeFilters,
        popMeasure,
        previousPeriodMeasure,
        arithmeticMeasure,
    ],
    filters: [absoluteDateFilter1],
};

export const afmWWithMeasuresWithoutFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [simpleMeasure],
    filters: [],
};

export const afmWWithMeasuresWithAttributeFilters: INormalizedAFM = {
    attributes: [],
    nativeTotals: [],
    measures: [simpleMeasureWithAttributeFilters],
    filters: [],
};

export const measureValueFilter1: AFM.IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "m1",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 42,
            },
        },
    },
};

export const measureValueFilter2: AFM.IMeasureValueFilter = {
    measureValueFilter: {
        measure: {
            localIdentifier: "m2",
        },
        condition: {
            comparison: {
                operator: "GREATER_THAN",
                value: 420,
            },
        },
    },
};
