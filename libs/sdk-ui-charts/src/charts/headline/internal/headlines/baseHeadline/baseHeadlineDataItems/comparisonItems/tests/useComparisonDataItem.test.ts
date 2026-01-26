// (C) 2023-2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type IChartConfig } from "../../../../../../../../interfaces/chartConfig.js";
import { EvaluationType } from "../../../../../interfaces/BaseHeadlines.js";
import {
    TEST_COLOR_CONFIGS,
    TEST_COMPARISON_PALETTE,
    createComparison,
} from "../../../../../tests/TestData.fixtures.js";
import { mockUseBaseHeadline } from "../../../tests/BaseHeadline.test.helpers.js";
import { useComparisonDataItem } from "../useComparisonDataItem.js";

describe("useComparisonDataItem", () => {
    const DEFAULT_CONFIG: IChartConfig = {
        colorPalette: TEST_COMPARISON_PALETTE,
        comparison: createComparison({
            colorConfig: TEST_COLOR_CONFIGS,
            isArrowEnabled: true,
        }),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        null,
        EvaluationType.POSITIVE_VALUE,
        EvaluationType.NEGATIVE_VALUE,
        EvaluationType.EQUALS_VALUE,
    ])("Should snapshot correctly when evaluation type is %s", (evaluationType) => {
        mockUseBaseHeadline({
            config: DEFAULT_CONFIG,
        });

        const { result } = renderHook(() => useComparisonDataItem(evaluationType, undefined));
        expect(result.current).toMatchSnapshot();
    });

    it("Should not have indicator when arrow is not enabled", () => {
        mockUseBaseHeadline({
            config: {
                ...DEFAULT_CONFIG,
                comparison: {
                    ...DEFAULT_CONFIG.comparison!,
                    isArrowEnabled: false,
                },
            },
        });

        const { result } = renderHook(() => useComparisonDataItem(EvaluationType.POSITIVE_VALUE, undefined));
        expect(result.current.indicator).toBeFalsy();
    });
});
