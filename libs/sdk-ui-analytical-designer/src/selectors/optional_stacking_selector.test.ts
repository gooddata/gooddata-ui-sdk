// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { optionalStackingSelector } from "../selectors/optional_stacking_selector.js";
import { type IAppState } from "../store/types.js";
import { withOptionalStackingUiConfig } from "../tests/extended_reference_point_builder.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBuckets } from "../typings/buckets.js";

import { manyMeasuresTwoCategoriesNoStack, oneMeasureOneCategoryOneStack } from "./bucket.test.helpers.js";

/** The persisted `controls` half of the fixture — the counterpart of the uiConfig lock. */
const withStackingControls = (
    state: IAppState,
    controls: { stackMeasures?: boolean; stackMeasuresToPercent?: boolean },
): IAppState =>
    withData(state, {
        visualizationProperties: {
            ...state.data.visualizationProperties,
            controls: { ...state.data.visualizationProperties?.controls, ...controls },
        },
    });

describe("Optional Stacking selector test", () => {
    const mockState = withData(initialState, {
        extendedReferencePoint: withOptionalStackingUiConfig(initialState.data.extendedReferencePoint, {
            supported: true,
        }),
    });

    it("should NOT show optional stacking checkboxes if viz is not supported", () => {
        const props = optionalStackingSelector(initialState);

        expect(props).toEqual({
            isStackMeasuresVisible: false,
            isStackToPercentVisible: false,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should show stack to percent checkbox when there are 1M 1Vb 1Sb", () => {
        const state = withData(mockState, {
            buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets,
        });
        const props = optionalStackingSelector(state);

        expect(props).toEqual({
            isStackMeasuresVisible: false,
            isStackToPercentVisible: true,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should show stack to percent checkbox when the visualization declares it visible (mekko height-only)", () => {
        // no stack bucket and no primary measure — the bucket heuristic alone would hide it
        const state = withData(mockState, {
            extendedReferencePoint: withOptionalStackingUiConfig(mockState.data.extendedReferencePoint, {
                stackToPercentVisible: true,
            }),
        });
        const props = optionalStackingSelector(state);

        expect(props.isStackToPercentVisible).toBe(true);
    });

    it("should hide stack to percent checkbox when the visualization declares it hidden", () => {
        // 1M 1Vb 1Sb — the bucket heuristic alone would show it
        const state = withData(
            withData(mockState, { buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets }),
            {
                extendedReferencePoint: withOptionalStackingUiConfig(mockState.data.extendedReferencePoint, {
                    stackToPercentVisible: false,
                }),
            },
        );
        const props = optionalStackingSelector(state);

        expect(props.isStackToPercentVisible).toBe(false);
    });

    it("should keep the declared stack to percent visibility gated by optional stacking support", () => {
        const state = withData(initialState, {
            extendedReferencePoint: withOptionalStackingUiConfig(initialState.data.extendedReferencePoint, {
                stackToPercentVisible: true,
            }),
        });
        const props = optionalStackingSelector(state);

        expect(props.isStackToPercentVisible).toBe(false);
    });

    it("should show stack measure checkbox when there are nM 2Vb", () => {
        const state = withData(mockState, {
            buckets: manyMeasuresTwoCategoriesNoStack as unknown as IRawBuckets,
        });
        const props = optionalStackingSelector(state);

        expect(props).toEqual({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: false,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should show stack measures and stack to percent checkboxes", () => {
        const state = withStackingControls(
            withData(mockState, { buckets: manyMeasuresTwoCategoriesNoStack as unknown as IRawBuckets }),
            { stackMeasures: true },
        );
        const props = optionalStackingSelector(state);

        expect(props).toEqual({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: true,
            isStackMeasuresChecked: true,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should disable stack measures and stack to percent checkboxes when optional stacking is disabled", () => {
        const state = withData(
            withData(mockState, { buckets: manyMeasuresTwoCategoriesNoStack as unknown as IRawBuckets }),
            {
                extendedReferencePoint: withOptionalStackingUiConfig(mockState.data.extendedReferencePoint, {
                    disabled: true,
                }),
            },
        );
        const props = optionalStackingSelector(state);

        expect(props).toEqual({
            isStackMeasuresVisible: true,
            isStackToPercentVisible: false,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: true,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should enable stack measures and stack to percent checkboxes when optional stacking is enabled", () => {
        const state = withData(mockState, {
            extendedReferencePoint: withOptionalStackingUiConfig(mockState.data.extendedReferencePoint, {
                disabled: false,
            }),
        });
        const props = optionalStackingSelector(state);

        expect(props).toEqual({
            isStackMeasuresVisible: false,
            isStackToPercentVisible: false,
            isStackMeasuresChecked: false,
            isStackToPercentChecked: false,
            isOptionalStackingDisabled: false,
            canStackInPercent: true,
            isStackToPercentDisabledByNegativeValues: false,
        });
    });

    it("should disable stack to percent with single axis and line chart", () => {
        const state = withData(mockState, {
            extendedReferencePoint: withOptionalStackingUiConfig(mockState.data.extendedReferencePoint, {
                canStackInPercent: false,
            }),
        });

        const props = optionalStackingSelector(state);
        expect(props.canStackInPercent).toEqual(false);
    });

    it("should check stack to percent when the uiConfig lock is set (mekko width-only)", () => {
        const state = withData(
            withData(mockState, { buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets }),
            {
                extendedReferencePoint: withOptionalStackingUiConfig(
                    withData(mockState, { buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets })
                        .data.extendedReferencePoint,
                    { stackMeasuresToPercent: true },
                ),
            },
        );

        const props = optionalStackingSelector(state);
        expect(props.isStackToPercentChecked).toBe(true);
    });

    it("should let the uiConfig lock win over a persisted unchecked property", () => {
        const state = withData(
            withData(
                withData(mockState, { buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets }),
                {
                    extendedReferencePoint: withOptionalStackingUiConfig(
                        mockState.data.extendedReferencePoint,
                        { stackMeasuresToPercent: true },
                    ),
                },
            ),
            {
                visualizationProperties: {
                    ...mockState.data.visualizationProperties,
                    controls: {
                        ...mockState.data.visualizationProperties?.controls,
                        stackMeasuresToPercent: false,
                    },
                },
            },
        );

        const props = optionalStackingSelector(state);
        expect(props.isStackToPercentChecked).toBe(true);
    });

    it("should follow the persisted property when the uiConfig lock is absent", () => {
        const state = withStackingControls(
            withData(mockState, { buckets: oneMeasureOneCategoryOneStack as unknown as IRawBuckets }),
            { stackMeasuresToPercent: true },
        );

        const props = optionalStackingSelector(state);
        expect(props.isStackToPercentChecked).toBe(true);
    });
});
