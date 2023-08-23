// (C) 2023 GoodData Corporation
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import ComparisonDataItem from "../ComparisonDataItem.js";
import { IBaseHeadlineDataItemProps, EvaluationType } from "../../../../interfaces/BaseHeadlines.js";
import { mockUseBaseHeadline } from "../../tests/BaseHeadlineMock.js";
import {
    HEADLINE_VALUE_SELECTOR,
    HEADLINE_VALUE_WRAPPER_SELECTOR,
    TEST_DATA_ITEM,
    TEST_RENDER_COLOR_SPECS,
    TEST_RENDER_VALUE_SPECS,
} from "../../../../tests/TestData.fixtures.js";
import { IColorConfig } from "../../../../../../../interfaces/index.js";
import { IColorPalette } from "@gooddata/sdk-model";

describe("ComparisonDataItem", () => {
    const renderComparisonDataItem = (props: IBaseHeadlineDataItemProps) => {
        return render(<ComparisonDataItem {...props} />);
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Should render value correctly", () => {
        beforeEach(() => {
            mockUseBaseHeadline({
                config: {
                    comparison: {
                        enabled: true,
                        colorConfig: {},
                    },
                },
            });
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it.each(TEST_RENDER_VALUE_SPECS)(
            "%s",
            (_condition: string, data: { value: string; format: string }, expected: string) => {
                const dataItem = {
                    ...TEST_DATA_ITEM,
                    value: data?.value,
                    format: data?.format,
                };
                renderComparisonDataItem({
                    dataItem,
                    evaluationType: EvaluationType.POSITIVE_VALUE,
                });

                expect(screen.getByText(expected)).toBeInTheDocument();
            },
        );
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
                        comparison: {
                            enabled: true,
                            colorConfig: {
                                ...colorConfig,
                            },
                        },
                        ...(customPalette ? { colorPalette: customPalette } : {}),
                    },
                });

                const dataItem = {
                    ...TEST_DATA_ITEM,
                    value: "1666.105",
                    format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
                };
                const { container } = renderComparisonDataItem({
                    dataItem,
                    evaluationType,
                });

                const valueWrapper = container.querySelector(HEADLINE_VALUE_WRAPPER_SELECTOR);
                expect(valueWrapper).toHaveStyle(`color: ${expectedColor}`);
                expect(valueWrapper).toHaveStyle("background-color: #d2ccde");
            },
        );
    });

    describe("Should render indicator correctly", () => {
        beforeEach(() => {
            mockUseBaseHeadline({
                config: {
                    comparison: {
                        enabled: true,
                        isArrowEnabled: true,
                    },
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

            const valueEl = container.querySelector(HEADLINE_VALUE_SELECTOR);
            expect(valueEl).toHaveClass("gd-icon-arrow-up");
            expect(valueEl).not.toHaveClass("gd-icon-arrow-down");
        });

        it("Should render arrow down indicator", () => {
            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.NEGATIVE_VALUE,
            });

            const valueEl = container.querySelector(HEADLINE_VALUE_SELECTOR);
            expect(valueEl).not.toHaveClass("gd-icon-arrow-up");
            expect(valueEl).toHaveClass("gd-icon-arrow-down");
        });

        it("Should not render arrow indicator in case item status is equals value", () => {
            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.EQUALS_VALUE,
            });

            const valueEl = container.querySelector(HEADLINE_VALUE_SELECTOR);
            expect(valueEl).not.toHaveClass("gd-icon-arrow-up");
            expect(valueEl).not.toHaveClass("gd-icon-arrow-down");
        });

        it("Should not render arrow indicator in case is-arrow-enabled property is a falsy value", () => {
            mockUseBaseHeadline({
                config: {
                    comparison: {
                        enabled: true,
                        isArrowEnabled: false,
                    },
                },
            });

            const { container } = renderComparisonDataItem({
                dataItem: TEST_DATA_ITEM,
                evaluationType: EvaluationType.NEGATIVE_VALUE,
            });

            const valueEl = container.querySelector(HEADLINE_VALUE_SELECTOR);
            expect(valueEl).not.toHaveClass("gd-icon-arrow-up");
            expect(valueEl).not.toHaveClass("gd-icon-arrow-down");
        });
    });
});
