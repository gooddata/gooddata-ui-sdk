// (C) 2023-2025 GoodData Corporation

import React from "react";

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IColorPalette } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { IColorConfig } from "../../../../../../../../interfaces/index.js";
import { EvaluationType, IComparisonDataWithSubItem } from "../../../../../interfaces/BaseHeadlines.js";
import {
    COMPARISON_HEADLINE_VALUE_SELECTOR,
    TEST_COLOR_CONFIGS,
    TEST_DATA_WITH_SUB_ITEM,
    TEST_RENDER_COLOR_SPECS,
    createComparison,
} from "../../../../../tests/TestData.fixtures.js";
import { mockUseBaseHeadline } from "../../../tests/BaseHeadlineMock.js";
import { ComparisonDataWithSubItem } from "../ComparisonDataWithSubItem.js";
import * as ComparisonValue from "../ComparisonValue.js";
import * as useComparisonDataItem from "../useComparisonDataItem.js";

describe("ComparisonDataWithSubItem", () => {
    const DEFAULT_PROPS = {
        dataItem: TEST_DATA_WITH_SUB_ITEM,
        evaluationType: EvaluationType.POSITIVE_VALUE,
    };

    const renderComparisonDataItem = (
        params: {
            dataItem?: IComparisonDataWithSubItem;
            evaluationType?: EvaluationType;
        } = {},
    ) => {
        const props = {
            ...DEFAULT_PROPS,
            ...params,
        };

        const Component = withIntl(ComparisonDataWithSubItem);
        return render(<Component {...props} />);
    };

    it("Should render value and sub-value based on comparison-value component", () => {
        mockUseBaseHeadline({
            config: {
                comparison: createComparison({
                    colorConfig: TEST_COLOR_CONFIGS,
                }),
            },
        });

        const MockComparisonValue = vi.spyOn(ComparisonValue, "ComparisonValue");
        renderComparisonDataItem();

        expect(MockComparisonValue).toHaveBeenCalledTimes(2);
        expect(MockComparisonValue).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                dataItem: TEST_DATA_WITH_SUB_ITEM.item,
                comparisonStyle: { color: "rgb(5,5,5)" },
            }),
            expect.anything(),
        );
        expect(MockComparisonValue).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                dataItem: TEST_DATA_WITH_SUB_ITEM.subItem,
                comparisonStyle: { color: "rgb(5,5,5)" },
                isSubItem: true,
            }),
            expect.anything(),
        );
    });

    describe("Should render color correctly", () => {
        afterEach(() => {
            vi.clearAllMocks();
        });

        it.each<[string, IColorConfig, EvaluationType, string, IColorPalette?]>(TEST_RENDER_COLOR_SPECS)(
            "%s",
            (_test, colorConfig, evaluationType, expectedColor, customPalette) => {
                mockUseBaseHeadline({
                    config: {
                        comparison: createComparison({
                            colorConfig,
                        }),
                        ...(customPalette ? { colorPalette: customPalette } : {}),
                    },
                });

                const formatColor = "9c46b5";
                const subFormatColor = "e54d40";

                const dataItem = {
                    ...TEST_DATA_WITH_SUB_ITEM,
                    item: {
                        value: "1666.105",
                        format: `[color=${formatColor}]$#,##0.00`,
                    },
                    subItem: {
                        value: "122.12",
                        format: `[color=${subFormatColor}]$#,##0.00`,
                    },
                };

                const { container } = renderComparisonDataItem({
                    dataItem,
                    evaluationType,
                });

                const valueWrappers = container.querySelectorAll(COMPARISON_HEADLINE_VALUE_SELECTOR);
                expect(valueWrappers[0]).toHaveStyle(`color: ${expectedColor || "#" + formatColor}`);
                expect(valueWrappers[1]).toHaveStyle(`color: ${expectedColor || "#" + subFormatColor}`);
            },
        );
    });

    it("Should render comparison indicator", () => {
        mockUseBaseHeadline({
            config: {
                comparison: createComparison({
                    colorConfig: TEST_COLOR_CONFIGS,
                }),
            },
        });
        const MockIndicator = vi.fn();
        vi.spyOn(useComparisonDataItem, "useComparisonDataItem").mockReturnValue({
            style: {},
            indicator: MockIndicator,
            comparisonAriaLabelFactory: vi.fn(),
        });

        renderComparisonDataItem();
        expect(MockIndicator).toHaveBeenCalled();
    });
});
