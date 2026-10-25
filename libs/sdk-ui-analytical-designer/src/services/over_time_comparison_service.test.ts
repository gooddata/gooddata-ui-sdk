// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { MEASURES, METRIC } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { initialState } from "../reducers/initial_state.js";
import {
    areAllSelectedCompatible as areAllSelectedCompatibleInBuckets,
    createAndAddNewDerivedMeasure as createAndAddNewDerivedMeasureInQueue,
    filterCompatibleMeasures,
    hasDerivedMeasureAsOperand,
} from "../store/buckets/over_time_comparison_helpers.js";
import { type IAppState } from "../store/types.js";
import { getBucketItemByLocalIdentifier } from "../tests/constants.test.helpers.js";
import { withUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { withReferencePointBucket } from "../tests/reference_point_builder.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IBucketItemMetricFilter } from "../typings/bucket_item_filter.js";
import { type IRawBucketItem } from "../typings/buckets.js";

import { getSelectedOverTimeComparisonType } from "./buckets_service.js";
import {
    stateWithMasterAndDerivedMeasures,
    stateWithMasterAndDerivedMeasuresInRefPoint,
} from "./decorated_buckets_service.test.helpers.js";
import { areAllCompatibleMeasuresSelected, getCompatibleMeasures } from "./over_time_comparison_service.js";
import { PluggableVisualizationService } from "./pluggable_visualization_service.js";
import {
    getRefPointBuckets,
    getRefPointFilteredMeasures,
    getRefPointNonDerivedMeasures,
} from "./reference_point_service.js";

/**
 * The whole-root entry points these shims reproduce died with their one caller (the
 * arithmetic-measures wrapper); the RULES live on in
 * store/buckets/over_time_comparison_helpers.ts and these specs keep pinning them against the
 * same state fixtures through the same reference-point readers the deleted adapters used.
 */
const getRefPointCompatibleMeasures = (state: IAppState) =>
    filterCompatibleMeasures(getRefPointNonDerivedMeasures(state), getRefPointBuckets(state));

const areAllSelectedCompatible = (state: IAppState) =>
    areAllSelectedCompatibleInBuckets(
        getRefPointBuckets(state),
        getRefPointFilteredMeasures(state, () => true),
    );

const createAndAddNewDerivedMeasure = (state: IAppState, bucketItem: IRawBucketItem): IAppState =>
    PluggableVisualizationService.setQueueState(
        state,
        createAndAddNewDerivedMeasureInQueue(
            PluggableVisualizationService.getQueueState(state),
            bucketItem,
            getSelectedOverTimeComparisonType(state),
        ),
    );

describe("Over Time Comparison service", () => {
    describe("getRefPointCompatibleMeasures", () => {
        it("should return compatible measures from all buckets", () => {
            const compatible = getRefPointCompatibleMeasures(stateWithMasterAndDerivedMeasuresInRefPoint);

            expect(compatible).toHaveLength(4);
            expect(compatible[0].localIdentifier).toEqual("m1");
            expect(compatible[1].localIdentifier).toEqual("am1");
            expect(compatible[2].localIdentifier).toEqual("m2");
            expect(compatible[3].localIdentifier).toEqual("m3");
        });
    });

    describe("getCompatibleMeasures", () => {
        it("should return compatible measures from all buckets", () => {
            const compatible = getCompatibleMeasures(stateWithMasterAndDerivedMeasures);

            expect(compatible).toHaveLength(3);
            expect(compatible[0].localIdentifier).toEqual("measure2");
            expect(compatible[1].localIdentifier).toEqual("measure3");
            expect(compatible[2].localIdentifier).toEqual("am1");
        });
    });

    describe("areAllSelectedCompatible", () => {
        it("should return true for all selected compatible measures", () => {
            expect(areAllSelectedCompatible(stateWithMasterAndDerivedMeasuresInRefPoint)).toEqual(true);
        });

        it("should return true for empty buckets in ref. point", () => {
            // TWO buckets carrying nothing but an empty `items` — no production write makes a bucket
            // without a local identifier, and that is the point of the fixture. Written out rather
            // than built, because no domain operation can produce it.
            const testState = withData(initialState, {
                referencePoint: {
                    ...initialState.data.referencePoint,
                    buckets: [{ items: [] }, { items: [] }],
                },
            });
            expect(areAllSelectedCompatible(testState)).toEqual(false);
        });

        it("should return false for buckets contains measure with date filter", () => {
            // Same locally-identifier-less bucket shape as above, with a master carrying a DATE
            // filter and the measure derived from it.
            const testState = withData(initialState, {
                referencePoint: {
                    ...initialState.data.referencePoint,
                    buckets: [
                        {
                            items: [
                                {
                                    id: "id0",
                                    localIdentifier: "m0",
                                    type: METRIC,
                                    filters: [
                                        // `isDate` rides along untouched — only the decorated
                                        // models carry it; the stored record keys on `attribute`
                                        {
                                            isDate: true,
                                            attribute: DATE_DATASET_ATTRIBUTE,
                                            allElements: [],
                                            selectedElements: [],
                                            isInverted: true,
                                            totalElementsCount: 0,
                                            noData: false,
                                        } as IBucketItemMetricFilter,
                                    ],
                                },
                                {
                                    id: "id1",
                                    localIdentifier: "m1",
                                    masterLocalIdentifier: "m0",
                                    type: METRIC,
                                },
                            ],
                        },
                        { items: [] },
                    ],
                },
            });
            expect(areAllSelectedCompatible(testState)).toEqual(false);
        });
    });

    describe("areAllCompatibleMeasuresSelected", () => {
        it("should return true for incompatible measures", () => {
            expect(areAllCompatibleMeasuresSelected(stateWithMasterAndDerivedMeasures)).toEqual(true);
        });
    });

    describe("hasDerivedMeasureAsOperand", () => {
        const simpleMeasure = {
            localIdentifier: "m1",
            type: METRIC,
            isMeasure: true,
        };
        const spDerivedMeasure = {
            localIdentifier: "m3",
            type: METRIC,
            masterLocalIdentifier: "m1",
            overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        };
        const ppDerivedMeasure = {
            localIdentifier: "m2",
            type: METRIC,
            masterLocalIdentifier: "m1",
            overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
        };
        const arithmeticMeasure = {
            localIdentifier: "m4",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m1"],
            operator: "sum",
            isArithmeticMeasure: true,
        };
        const incompleteArithmeticMeasure = {
            localIdentifier: "m4",
            type: METRIC,
            operandLocalIdentifiers: ["m1", null],
            operator: "sum",
            isArithmeticMeasure: true,
        };
        const deepArithmeticMeasure = {
            localIdentifier: "m5",
            type: METRIC,
            operandLocalIdentifiers: ["m4", "m1"],
            operator: "sum",
            isArithmeticMeasure: true,
        };
        const arithmeticMeasureFromDerived = {
            localIdentifier: "m6",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m2"],
            operator: "sum",
            isArithmeticMeasure: true,
        };
        const deepArithmeticMeasureFromDerived = {
            localIdentifier: "m6",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m6"],
            operator: "sum",
            isArithmeticMeasure: true,
        };

        const allMeasures = [
            simpleMeasure,
            spDerivedMeasure,
            ppDerivedMeasure,
            arithmeticMeasure,
            incompleteArithmeticMeasure,
            deepArithmeticMeasure,
            arithmeticMeasureFromDerived,
            deepArithmeticMeasureFromDerived,
        ];

        it("should return false for simple measure", () => {
            expect(hasDerivedMeasureAsOperand(simpleMeasure, allMeasures)).toBe(false);
        });

        it("should return false for SP derived measure", () => {
            expect(hasDerivedMeasureAsOperand(spDerivedMeasure, allMeasures)).toBe(false);
        });

        it("should return false for PP derived measure", () => {
            expect(hasDerivedMeasureAsOperand(ppDerivedMeasure, allMeasures)).toBe(false);
        });

        it("should return false for arithmetic measure that has simple measures as operands", () => {
            expect(hasDerivedMeasureAsOperand(arithmeticMeasure, allMeasures)).toBe(false);
        });

        it("should return false for arithmetic measure that has only simple measures in its predecessors", () => {
            expect(hasDerivedMeasureAsOperand(deepArithmeticMeasure, allMeasures)).toBe(false);
        });

        it("should return false for incomplete arithmetic measure", () => {
            expect(hasDerivedMeasureAsOperand(incompleteArithmeticMeasure, allMeasures)).toBe(false);
        });

        it("should return true for arithmetic measure that has derived measure as its operand", () => {
            expect(hasDerivedMeasureAsOperand(arithmeticMeasureFromDerived, allMeasures)).toBe(true);
        });

        it("should return true for arithmetic measure that has derived measure in its predecessors", () => {
            expect(hasDerivedMeasureAsOperand(deepArithmeticMeasureFromDerived, allMeasures)).toBe(true);
        });
    });

    describe("createAndAddNewDerivedMeasure", () => {
        it("should create and queue new derived measure of given measure", () => {
            const state = withData(
                withData(
                    withData(initialState, {
                        buckets: [
                            {
                                localIdentifier: MEASURES,
                                items: [
                                    getBucketItemByLocalIdentifier("m1"),
                                    getBucketItemByLocalIdentifier("m1_pop"),
                                    getBucketItemByLocalIdentifier("m2"),
                                ],
                            },
                        ],
                    }),
                    {
                        referencePoint: withReferencePointBucket(initialState.data.referencePoint, 0, {
                            localIdentifier: MEASURES,
                            items: [
                                getBucketItemByLocalIdentifier("m1"),
                                getBucketItemByLocalIdentifier("m1_pop"),
                                getBucketItemByLocalIdentifier("m2"),
                            ],
                        }),
                    },
                ),
                {
                    extendedReferencePoint: withUiConfig(initialState.data.extendedReferencePoint, {
                        supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                    }),
                },
            );
            const bucketItem = getBucketItemByLocalIdentifier("m2");
            const updatedState = createAndAddNewDerivedMeasure(state, bucketItem);

            const createdDerivedMeasure =
                PluggableVisualizationService.getNewDerivedBucketItems(updatedState)[0];

            expect(createdDerivedMeasure.localIdentifier).toEqual("m2_pop");
            expect(createdDerivedMeasure.overTimeComparisonType).toEqual("same_period_previous_year");
        });

        it("should not create and queue new derived measure of given measure if no nothing is selected as comparison type", () => {
            const state = withData(
                withData(
                    withData(initialState, {
                        buckets: [
                            {
                                localIdentifier: MEASURES,
                                items: [getBucketItemByLocalIdentifier("m1")],
                            },
                        ],
                    }),
                    {
                        referencePoint: withReferencePointBucket(initialState.data.referencePoint, 0, {
                            localIdentifier: MEASURES,
                            items: [getBucketItemByLocalIdentifier("m1")],
                        }),
                    },
                ),
                {
                    extendedReferencePoint: withUiConfig(initialState.data.extendedReferencePoint, {
                        supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                    }),
                },
            );
            const bucketItem = getBucketItemByLocalIdentifier("m1");
            const updatedState = createAndAddNewDerivedMeasure(state, bucketItem);

            const derivedMeasuresQueue = PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
            expect(derivedMeasuresQueue).toHaveLength(0);
        });
    });
});
