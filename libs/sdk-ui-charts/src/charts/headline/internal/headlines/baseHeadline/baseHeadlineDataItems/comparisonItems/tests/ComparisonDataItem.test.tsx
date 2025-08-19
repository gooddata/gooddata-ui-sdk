// (C) 2023-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IColorPalette } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { IColorConfig } from "../../../../../../../../interfaces/index.js";
import {
    EvaluationType,
    IBaseHeadlineDataItemProps,
    IComparisonDataItem,
} from "../../../../../interfaces/BaseHeadlines.js";
import {
    COMPARISON_HEADLINE_VALUE_SELECTOR,
    INDICATOR_DOWN_CLASSNAME_SELECTOR,
    INDICATOR_UP_CLASSNAME_SELECTOR,
    TEST_DATA_ITEM,
    TEST_RENDER_COLOR_SPECS,
    createComparison,
} from "../../../../../tests/TestData.fixtures.js";
import { mockUseBaseHeadline } from "../../../tests/BaseHeadlineMock.js";
import { ComparisonDataItem } from "../ComparisonDataItem.js";

describe("ComparisonDataItem", () => {
    const renderComparisonDataItem = (props: IBaseHeadlineDataItemProps<IComparisonDataItem>) => {
        const WrappedComparisonDataItem = withIntl(ComparisonDataItem);
        return render(<WrappedComparisonDataItem {...props} />);
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Should render color correctly", () => {
        afterEach(() => {
            vi.clearAllMocks();
        });

        it.each(TEST_RENDER_COLOR_SPECS)(
            "%s",
            (
                _test: string,
                colorConfig: IColorConfig,
                evaluationType: EvaluationType,
                expectedColor: string,
                customPalette: IColorPalette,
            ) => {
                mockUseBaseHeadline({
                    config: {
                        comparison: createComparison({
                            colorConfig,
                        }),
                        ...(customPalette ? { colorPalette: customPalette } : {}),
                    },
                });

                const formatColor = "9c46b5";
                const dataItem = {
                    ...TEST_DATA_ITEM,
                    value: "1666.105",
                    format: `[color=${formatColor}][backgroundColor=d2ccde]$#,##0.00`,
                };
                const { container } = renderComparisonDataItem({
                    dataItem,
                    evaluationType,
                });

                const valueWrapper = container.querySelector(COMPARISON_HEADLINE_VALUE_SELECTOR);
                expect(valueWrapper).toHaveStyle(`color: ${expectedColor || "#" + formatColor}`);
                expect(valueWrapper).toHaveStyle("background-color: #d2ccde");
            },
        );
    });

    describe("Should render indicator correctly", () => {
        beforeEach(() => {
            mockUseBaseHeadline({
                config: {
                    comparison: createComparison({
                        isArrowEnabled: true,
                    }),
                },
            });
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it("Should render arrow up indicator", () => {
            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.POSITIVE_VALUE,
            });

            expect(container.querySelector(INDICATOR_UP_CLASSNAME_SELECTOR)).toBeInTheDocument();
            expect(container.querySelector(INDICATOR_DOWN_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
        });

        it("Should render arrow down indicator", () => {
            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.NEGATIVE_VALUE,
            });

            expect(container.querySelector(INDICATOR_UP_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
            expect(container.querySelector(INDICATOR_DOWN_CLASSNAME_SELECTOR)).toBeInTheDocument();
        });

        it("Should not render arrow indicator in case item status is equals value", () => {
            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.EQUALS_VALUE,
            });

            expect(container.querySelector(INDICATOR_UP_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
            expect(container.querySelector(INDICATOR_DOWN_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
        });

        it("Should not render arrow indicator in case is-arrow-enabled property is a falsy value", () => {
            mockUseBaseHeadline({
                config: {
                    comparison: createComparison({
                        isArrowEnabled: false,
                    }),
                },
            });

            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.NEGATIVE_VALUE,
            });

            expect(container.querySelector(INDICATOR_UP_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
            expect(container.querySelector(INDICATOR_DOWN_CLASSNAME_SELECTOR)).not.toBeInTheDocument();
        });
    });
});
