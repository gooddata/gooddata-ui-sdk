// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal, type TotalType } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, MEASURES } from "../../constants/bucket.js";
import { DEFAULT_DECIMAL_FORMAT, DEFAULT_PERCENTAGE_FORMAT } from "../../constants/formats.js";
import { isArithmeticMeasure } from "../../models/bucket_item.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { findBucketItemByLocalIdentifier } from "../../services/buckets_service.js";
import { PluggableVisualizationService } from "../../services/pluggable_visualization_service.js";
import { getAllBucketItems } from "../../store/buckets/buckets_selectors.js";
import { withBucketTotals } from "../../tests/buckets_builder.test.helpers.js";
import {
    enrichCategoriesBucketItems,
    getBucketItemByLocalIdentifier,
    measureBucketItems,
} from "../../tests/constants.test.helpers.js";
import { withUiConfig } from "../../tests/extended_reference_point_builder.test.helpers.js";
import { withReferencePointBucket } from "../../tests/reference_point_builder.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { ArithmeticOperatorType } from "../../typings/arithmetic_measure.js";
import { type IRawBucketItem } from "../../typings/buckets.js";
import { type IBucketItem } from "../../typings/metadata.js";
import { dispatchAction } from "../../utils/dispatch_action.js";
import { setHighlightedBucketItems } from "../highlighting/highlighting_actions.js";
import { getHighlightedBucketItems } from "../highlighting/highlighting_selector.js";

import {
    addArithmeticMeasure,
    selectArithmeticMeasureOperand,
    selectArithmeticMeasureOperator,
} from "./arithmetic_measures_actions.js";

describe("Arithmetic Measures Store tests", () => {
    describe("STORE_ADD_ARITHMETIC_MEASURE} test", () => {
        it("should create new arithmetic measure in measures bucket", async () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [measureBucketItems[0], measureBucketItems[1]],
                    },
                ],
            });
            const action = addArithmeticMeasure(MEASURES);

            const updatedState = await dispatchAction(state, action);

            const createdMeasure = updatedState.data.buckets[0].items[2];
            expect(isArithmeticMeasure(createdMeasure)).toBe(true);
        });

        it("should not create new arithmetic measure if there are less than two measures within buckets", async () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [measureBucketItems[0]],
                    },
                ],
            });
            const action = addArithmeticMeasure(MEASURES);

            const updatedState = await dispatchAction(state, action);

            const createdMeasure = updatedState.data.buckets[0].items[2];
            expect(createdMeasure).toBe(undefined);
        });
    });

    describe("STORE_SELECT_ARITHMETIC_MEASURE_OPERAND test", () => {
        it("should set selected operand measure local identifier at given index for specified measure", async () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: measureBucketItems,
                    },
                ],
            });

            const measureLocalIdentifier = "m10";
            const operandIndex = 0;
            const selectedOperandMeasureLocalIdentifier = "m1";

            const action = selectArithmeticMeasureOperand(
                measureLocalIdentifier,
                operandIndex,
                selectedOperandMeasureLocalIdentifier,
            );

            const updatedState = await dispatchAction(state, action);

            const updatedMeasure = findBucketItemByLocalIdentifier(updatedState, measureLocalIdentifier);
            expect(updatedMeasure?.operandLocalIdentifiers?.[operandIndex]).toEqual(
                selectedOperandMeasureLocalIdentifier,
            );
        });

        it("should reset highlighted bucket item local identifier", async () => {
            const measureLocalIdentifier = "m10";

            const setHighlightedBucketItemsAction = setHighlightedBucketItems([measureLocalIdentifier]);
            const state = withData(rootReducer(getInitializedState(), setHighlightedBucketItemsAction), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: measureBucketItems,
                    },
                ],
            });

            const operandIndex = 0;
            const selectedOperandMeasureLocalIdentifier = "m1";

            const action = selectArithmeticMeasureOperand(
                measureLocalIdentifier,
                operandIndex,
                selectedOperandMeasureLocalIdentifier,
            );

            const updatedState = await dispatchAction(state, action);

            expect(getHighlightedBucketItems(updatedState)).toBeUndefined();
        });

        describe("queue up derivative of arithmetic measure to pluggable visualizations", () => {
            it("should queue up derivative if compare is applied on all measures and both operands are not derived measures", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            {
                                supportedOverTimeComparisonTypes: [
                                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                                ],
                            },
                        ),
                    },
                );

                const measureLocalIdentifier = "m12";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m2";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const createdDerivedMeasure =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState)[0];
                expect(createdDerivedMeasure?.localIdentifier).toEqual("m12_pop");
            });

            it("should not queue up derivative if compare is not applied on all measures", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            {
                                supportedOverTimeComparisonTypes: [
                                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                                ],
                            },
                        ),
                    },
                );

                const measureLocalIdentifier = "m12";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m2";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const derivedMeasuresQueue =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
                expect(derivedMeasuresQueue).toHaveLength(0);
            });

            it("should not queue up derivative if arithmetic measure is not complete", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m9"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m9"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            {
                                supportedOverTimeComparisonTypes: [
                                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                                ],
                            },
                        ),
                    },
                );

                const measureLocalIdentifier = "m9";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m1";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const derivedMeasuresQueue =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
                expect(derivedMeasuresQueue).toHaveLength(0);
            });

            it("should not queue up derivative if no comparison type is selected", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            { supportedOverTimeComparisonTypes: [] },
                        ),
                    },
                );

                const measureLocalIdentifier = "m12";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m2";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const derivedMeasuresQueue =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
                expect(derivedMeasuresQueue).toHaveLength(0);
            });

            it("should not queue up derivative if one operand is already a derived measure", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m12"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            {
                                supportedOverTimeComparisonTypes: [
                                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                                ],
                            },
                        ),
                    },
                );

                const measureLocalIdentifier = "m12";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m1_pop";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const derivedMeasuresQueue =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
                expect(derivedMeasuresQueue).toHaveLength(0);
            });

            it("should not queue up derivative if it already exists", async () => {
                const state = withData(
                    withData(
                        withData(getInitializedState(), {
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m5"),
                                        getBucketItemByLocalIdentifier("m5_previous_period"),
                                    ],
                                },
                            ],
                        }),
                        {
                            referencePoint: withReferencePointBucket(
                                getInitializedState().data.referencePoint,
                                0,
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m2_pop"),
                                        getBucketItemByLocalIdentifier("m5"),
                                        getBucketItemByLocalIdentifier("m5_previous_period"),
                                    ],
                                },
                            ),
                        },
                    ),
                    {
                        extendedReferencePoint: withUiConfig(
                            getInitializedState().data.extendedReferencePoint,
                            {
                                supportedOverTimeComparisonTypes: [
                                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                                ],
                            },
                        ),
                    },
                );

                const measureLocalIdentifier = "m5";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m1";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const derivedMeasuresQueue =
                    PluggableVisualizationService.getNewDerivedBucketItems(updatedState);
                expect(derivedMeasuresQueue).toHaveLength(0);
            });
        });

        describe("removing derivative of arithmetic measure", () => {
            const stateWithDerivedArithmeticMeasure = withData(
                withData(
                    withData(getInitializedState(), {
                        buckets: [
                            {
                                localIdentifier: MEASURES,
                                items: [
                                    getBucketItemByLocalIdentifier("m1"),
                                    getBucketItemByLocalIdentifier("m1_pop"),
                                    getBucketItemByLocalIdentifier("m2"),
                                    getBucketItemByLocalIdentifier("m5"),
                                    getBucketItemByLocalIdentifier("m5_previous_period"),
                                ],
                            },
                            {
                                localIdentifier: ATTRIBUTE,
                                items: [enrichCategoriesBucketItems[0]],
                            },
                        ],
                    }),
                    {
                        referencePoint: {
                            ...getInitializedState().data.referencePoint,
                            buckets: [
                                {
                                    localIdentifier: MEASURES,
                                    items: [
                                        getBucketItemByLocalIdentifier("m1"),
                                        getBucketItemByLocalIdentifier("m1_pop"),
                                        getBucketItemByLocalIdentifier("m2"),
                                        getBucketItemByLocalIdentifier("m5"),
                                        getBucketItemByLocalIdentifier("m5_previous_period"),
                                    ],
                                },
                                {
                                    localIdentifier: ATTRIBUTE,
                                    items: [enrichCategoriesBucketItems[0]],
                                },
                            ],
                        },
                    },
                ),
                {
                    extendedReferencePoint: withUiConfig(getInitializedState().data.extendedReferencePoint, {
                        supportedOverTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                    }),
                },
            );
            it("should remove derivative if selected operand is a derived measure", async () => {
                const state = stateWithDerivedArithmeticMeasure;
                const measureLocalIdentifier = "m5";
                const operandIndex = 1;
                const selectedOperandMeasureLocalIdentifier = "m1_pop";

                const action = selectArithmeticMeasureOperand(
                    measureLocalIdentifier,
                    operandIndex,
                    selectedOperandMeasureLocalIdentifier,
                );

                const updatedState = await dispatchAction(state, action);

                const bucketItems = getAllBucketItems(updatedState);

                expect(
                    bucketItems.find(
                        (bucketItem: IRawBucketItem) => bucketItem?.localIdentifier === "m5_pop",
                    ),
                ).toEqual(undefined);
            });
            it("should remove derivative totals if selected operand is a derived measure", async () => {
                const m5total: ITotal = {
                    measureIdentifier: "m5",
                    attributeIdentifier: "product",
                    type: "sum",
                };
                const m5PopTotal: ITotal = {
                    measureIdentifier: "m5_pop",
                    attributeIdentifier: "product",
                    type: "sum",
                };
                const totals = [m5PopTotal, m5total];

                const attributeBucketIndex = 1;
                const state = withData(
                    withData(stateWithDerivedArithmeticMeasure, {
                        buckets: withBucketTotals(
                            stateWithDerivedArithmeticMeasure.data.buckets,
                            attributeBucketIndex,
                            totals,
                        ),
                    }),
                    {
                        referencePoint: withReferencePointBucket(
                            stateWithDerivedArithmeticMeasure.data.referencePoint,
                            attributeBucketIndex,
                            {
                                ...stateWithDerivedArithmeticMeasure.data.referencePoint.buckets[
                                    attributeBucketIndex
                                ],
                                totals,
                            },
                        ),
                    },
                );

                const action = selectArithmeticMeasureOperand("m5", 1, "m1_pop");

                const updatedState = await dispatchAction(state, action);
                const updatedTotals = updatedState.data.buckets[attributeBucketIndex].totals;

                expect(updatedTotals).toEqual([m5total]);
            });
        });

        describe("auto creation of the table totals for arithmetic measure", () => {
            const rowAttributes: IBucketItem[] = [
                {
                    localIdentifier: "a1",
                    type: ATTRIBUTE,
                    filters: [],
                },
                {
                    localIdentifier: "a2",
                    type: ATTRIBUTE,
                    filters: [],
                },
            ];

            function total(measureIdentifier: string, attributeIdentifier: string, type: TotalType): ITotal {
                return {
                    measureIdentifier,
                    attributeIdentifier,
                    type,
                };
            }

            it("should not create totals when the first operand is being set", async () => {
                const initialTotals: ITotal[] = [total("m1", "a1", "sum")];
                const state = withData(getInitializedState(), {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [
                                getBucketItemByLocalIdentifier("m1"),
                                getBucketItemByLocalIdentifier("m2"),
                                getBucketItemByLocalIdentifier("m9"), // AM without any operand
                            ],
                        },
                        {
                            localIdentifier: ATTRIBUTE,
                            items: rowAttributes,
                            totals: initialTotals,
                        },
                    ],
                });

                const action = selectArithmeticMeasureOperand("m9", 0, "m1");

                const updatedState = await dispatchAction(state, action);

                expect(updatedState.data.buckets[1].totals).toEqual(initialTotals);
            });

            it("should create totals when the second operand is being set for the first time", async () => {
                const initialTotals: ITotal[] = [
                    total("m1", "a1", "sum"),
                    total("m2", "a1", "sum"),
                    total("m1", "a1", "max"),
                ];
                const state = withData(getInitializedState(), {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [
                                getBucketItemByLocalIdentifier("m1"),
                                getBucketItemByLocalIdentifier("m2"),
                                getBucketItemByLocalIdentifier("m10"), // AM without one operand
                            ],
                        },
                        {
                            localIdentifier: ATTRIBUTE,
                            items: rowAttributes,
                            totals: initialTotals,
                        },
                    ],
                });

                const action = selectArithmeticMeasureOperand("m10", 0, "m1");

                const updatedState = await dispatchAction(state, action);

                expect(updatedState.data.buckets[1].totals).toEqual([
                    total("m1", "a1", "sum"),
                    total("m2", "a1", "sum"),
                    total("m10", "a1", "sum"),
                    total("m1", "a1", "max"),
                ]);
            });

            it("should not create totals when the both operands were already set", async () => {
                const initialTotals: ITotal[] = [
                    total("m1", "a1", "sum"),
                    total("m2", "a1", "sum"),
                    total("m8", "a1", "max"),
                ];
                const state = withData(getInitializedState(), {
                    buckets: [
                        {
                            localIdentifier: MEASURES,
                            items: [
                                getBucketItemByLocalIdentifier("m1"),
                                getBucketItemByLocalIdentifier("m2"),
                                getBucketItemByLocalIdentifier("m8"), // AM with both operand
                            ],
                        },
                        {
                            localIdentifier: ATTRIBUTE,
                            items: rowAttributes,
                            totals: initialTotals,
                        },
                    ],
                });

                const action = selectArithmeticMeasureOperand("m8", 0, "m1");

                const updatedState = await dispatchAction(state, action);

                expect(updatedState.data.buckets[1].totals).toEqual(initialTotals);
            });
        });
    });

    describe("STORE_SELECT_ARITHMETIC_MEASURE_OPERATOR test", () => {
        it("should set selected operator measure by local identifier", async () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: measureBucketItems,
                    },
                ],
            });

            const measureLocalIdentifier = "m10";

            const measureWithDefaultValues = findBucketItemByLocalIdentifier(state, measureLocalIdentifier);
            expect(measureWithDefaultValues.operator).toEqual(ArithmeticOperatorType.RATIO);

            const updatedOperator = ArithmeticOperatorType.SUM;

            const action = selectArithmeticMeasureOperator(measureLocalIdentifier, updatedOperator);

            const updatedState = await dispatchAction(state, action);

            const updatedMeasure = findBucketItemByLocalIdentifier(updatedState, measureLocalIdentifier);
            expect(updatedMeasure.operator).toEqual(updatedOperator);
        });

        describe("changing format on operator change", () => {
            it.each`
                currentOperator                  | newOperator                      | currentFormat | expectedFormat
                ${ArithmeticOperatorType.SUM}    | ${ArithmeticOperatorType.CHANGE} | ${null}       | ${DEFAULT_PERCENTAGE_FORMAT}
                ${ArithmeticOperatorType.SUM}    | ${ArithmeticOperatorType.CHANGE} | ${"custom#"}  | ${"custom#"}
                ${ArithmeticOperatorType.CHANGE} | ${ArithmeticOperatorType.SUM}    | ${null}       | ${DEFAULT_DECIMAL_FORMAT}
                ${ArithmeticOperatorType.CHANGE} | ${ArithmeticOperatorType.SUM}    | ${"custom#"}  | ${"custom#"}
            `(
                "should set format to $expectedFormat when operator was changed from $currentOperator to $newOperator and format was $currentFormat and custom formatting is $customFormatting",
                async ({ currentFormat, expectedFormat, currentOperator, newOperator }) => {
                    const state = withData(getInitializedState(), {
                        buckets: [
                            {
                                localIdentifier: MEASURES,
                                items: [
                                    {
                                        localIdentifier: "m10",
                                        type: "metric",
                                        operandLocalIdentifiers: [null, "m2"],
                                        operator: currentOperator,
                                        format: currentFormat,
                                    },
                                ],
                            },
                        ],
                    });
                    const measureLocalIdentifier = "m10";
                    const action = selectArithmeticMeasureOperator(measureLocalIdentifier, newOperator);

                    const updatedState = await dispatchAction(state, action);

                    const updatedMeasure = findBucketItemByLocalIdentifier(
                        updatedState,
                        measureLocalIdentifier,
                    );
                    expect(updatedMeasure.format).toBe(expectedFormat);
                },
            );
        });
    });
});
