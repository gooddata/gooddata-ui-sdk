// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IColorPalette } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IColorConfig } from "../../../../../../../../interfaces/comparison.js";
import { EvaluationType, type IComparisonDataWithSubItem } from "../../../../../interfaces/BaseHeadlines.js";
import {
    COMPARISON_HEADLINE_VALUE_SELECTOR,
    INDICATOR_UP_CLASSNAME_SELECTOR,
    TEST_COLOR_CONFIGS,
    TEST_DATA_WITH_SUB_ITEM,
    TEST_RENDER_COLOR_SPECS,
    createComparison,
} from "../../../../../tests/TestData.fixtures.js";
import { createBaseHeadlineTestContext } from "../../../tests/BaseHeadline.test.helpers.js";
import { ComparisonDataWithSubItem } from "../ComparisonDataWithSubItem.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

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

        const Component = withIntlForTest(ComparisonDataWithSubItem);
        return render(<Component {...props} />, { wrapper });
    };

    it("Should render value and sub-value based on comparison-value component", () => {
        setBaseHeadline({
            config: {
                comparison: createComparison({
                    colorConfig: TEST_COLOR_CONFIGS,
                }),
            },
        });

        const { container } = renderComparisonDataItem();

        const valueWrappers = container.querySelectorAll(COMPARISON_HEADLINE_VALUE_SELECTOR);
        expect(valueWrappers).toHaveLength(2);
        expect(valueWrappers[0]).toHaveTextContent("$130,000.00");
        expect(valueWrappers[0]).toHaveStyle("color: rgb(5, 5, 5)");
        expect(valueWrappers[1]).toHaveTextContent("(80000)");
        expect(valueWrappers[1]).toHaveStyle("color: rgb(5, 5, 5)");
    });

    describe("Should render color correctly", () => {
        it.each<[string, IColorConfig, EvaluationType, string, IColorPalette?]>(TEST_RENDER_COLOR_SPECS)(
            "%s",
            (_test, colorConfig, evaluationType, expectedColor, customPalette) => {
                setBaseHeadline({
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
        setBaseHeadline({
            config: {
                comparison: createComparison({
                    colorConfig: TEST_COLOR_CONFIGS,
                    isArrowEnabled: true,
                }),
            },
        });

        const { container } = renderComparisonDataItem();

        expect(container.querySelector(INDICATOR_UP_CLASSNAME_SELECTOR)).toBeInTheDocument();
    });
});
