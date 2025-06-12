// (C) 2023 GoodData Corporation
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { mockUseBaseHeadline } from "../../../tests/BaseHeadlineMock.js";
import { useComparisonDataItem } from "../useComparisonDataItem.js";
import {
    createComparison,
    TEST_COLOR_CONFIGS,
    TEST_COMPARISON_PALETTE,
} from "../../../../../tests/TestData.fixtures.js";
import { IChartConfig } from "../../../../../../../../interfaces/index.js";
import { EvaluationType } from "../../../../../interfaces/BaseHeadlines.js";

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

        const { result } = renderHook(() => useComparisonDataItem(evaluationType));
        expect(result.current).toMatchSnapshot();
    });

    it("Should not have indicator when arrow is not enabled", () => {
        mockUseBaseHeadline({
            config: {
                ...DEFAULT_CONFIG,
                comparison: {
                    ...DEFAULT_CONFIG.comparison,
                    isArrowEnabled: false,
                },
            },
        });

        const { result } = renderHook(() => useComparisonDataItem(EvaluationType.POSITIVE_VALUE));
        expect(result.current.indicator).toBeFalsy();
    });
});
