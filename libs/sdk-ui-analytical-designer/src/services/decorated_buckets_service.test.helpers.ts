// (C) 2007-2026 GoodData Corporation

import { METRIC } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { initialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItem, type IRawBuckets } from "../typings/buckets.js";

const masterMeasure0: IRawBucketItem = {
    id: "id0",
    localIdentifier: "m0",
    type: METRIC,
    filters: [
        {
            attribute: DATE_DATASET_ATTRIBUTE,
            allElements: [],
            selectedElements: [],
            isInverted: true,
            totalElementsCount: 0,
            noData: false,
        },
    ],
};
const masterMeasure1 = {
    id: "id1",
    localIdentifier: "m1",
    type: METRIC,
};
const derivedMeasure1 = {
    id: "idd2",
    localIdentifier: "m1_pop",
    masterLocalIdentifier: "m1",
    type: METRIC,
};
const masterMeasure2 = {
    id: "id2",
    localIdentifier: "m2",
    type: METRIC,
};
const derivedMeasure2 = {
    id: "idd2",
    localIdentifier: "m2_pop",
    masterLocalIdentifier: "m2",
    type: METRIC,
};
const masterMeasure3 = {
    id: "id3",
    localIdentifier: "m3",
    type: METRIC,
    aggregation: "COUNT",
};
const derivedMeasure3 = {
    id: "idd3",
    localIdentifier: "m3_pop",
    masterLocalIdentifier: "m3",
    type: METRIC,
    aggregation: "COUNT",
};
const arithmeticMeasure = {
    id: "id4",
    localIdentifier: "am1",
    type: METRIC,
    operandLocalIdentifiers: ["m1", "m1"],
    operator: "sum",
};
const incompleteArithmeticMeasure = {
    id: "id5",
    localIdentifier: "am2",
    type: METRIC,
    operandLocalIdentifiers: ["m1", null],
    operator: "sum",
};
const arithmeticMeasureFromDerived = {
    id: "id6",
    localIdentifier: "am3",
    type: METRIC,
    operandLocalIdentifiers: ["m1", "m2_pop"],
    operator: "sum",
};
const deepArithmeticMeasureFromDerived = {
    id: "id7",
    localIdentifier: "am4",
    type: METRIC,
    operandLocalIdentifiers: ["m1", "am3"],
    operator: "sum",
};

const derivedFromArithmeticMeasure = {
    id: "id8",
    localIdentifier: "am5",
    type: METRIC,
    masterLocalIdentifier: "am1",
};

export const stateWithMasterAndDerivedMeasuresInRefPoint: IAppState = withData(initialState, {
    referencePoint: {
        ...initialState.data.referencePoint,
        buckets: [
            { items: [masterMeasure0, masterMeasure1, derivedMeasure1, arithmeticMeasure] },
            {
                items: [
                    masterMeasure2,
                    derivedMeasure2,
                    masterMeasure3,
                    derivedMeasure3,
                    derivedFromArithmeticMeasure,
                    incompleteArithmeticMeasure,
                    arithmeticMeasureFromDerived,
                    deepArithmeticMeasureFromDerived,
                ],
            },
        ],
    },
});

const defaultBuckets: IRawBuckets = [
    {
        localIdentifier: "measures",
        items: [
            {
                type: METRIC,
                localIdentifier: "measure1",
                filters: [
                    // incompatible measure
                    {
                        attribute: DATE_DATASET_ATTRIBUTE,
                        allElements: [],
                        selectedElements: [],
                        isInverted: true,
                        totalElementsCount: 0,
                        noData: false,
                    },
                ],
            },
            {
                type: METRIC,
                localIdentifier: "measure2",
            },
            {
                type: METRIC,
                localIdentifier: "measure2_pop",
                masterLocalIdentifier: "measure2",
            },
            {
                type: METRIC,
                localIdentifier: "measure3",
            },
            {
                localIdentifier: "am1",
                type: METRIC,
                operandLocalIdentifiers: ["measure1", "measure1"],
                operator: "sum",
            },
            {
                localIdentifier: "am2",
                type: METRIC,
                operandLocalIdentifiers: ["measure1", null],
                operator: "sum",
            },
            {
                localIdentifier: "am3",
                type: METRIC,
                operandLocalIdentifiers: ["measure1", "measure2_pop"],
                operator: "sum",
            },
            {
                localIdentifier: "am4",
                type: METRIC,
                operandLocalIdentifiers: ["measure1", "am3"],
                operator: "sum",
            },
        ],
    },
];

const fakeAttribute = {
    title: "",
    type: METRIC,
};

export const stateWithMasterAndDerivedMeasures: IAppState = withData(
    withData(initialState, {
        itemCache: { ...initialState.data.itemCache, [`metric.${masterMeasure1.id}`]: fakeAttribute },
    }),
    { buckets: defaultBuckets },
);
