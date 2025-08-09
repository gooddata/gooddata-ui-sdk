// (C) 2023-2025 GoodData Corporation
import React from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { BaseHeadlineDataItem } from "../BaseHeadlineDataItem.js";
import { IBaseHeadlineDataItemProps, EvaluationType } from "../../../../interfaces/BaseHeadlines.js";
import { mockUseBaseHeadline } from "../../tests/BaseHeadlineMock.js";
import {
    HEADLINE_LINK_STYLE_UNDERLINE,
    HEADLINE_VALUE_WRAPPER_SELECTOR,
    TEST_DATA_ITEM,
    TEST_RENDER_VALUE_SPECS,
} from "../../../../tests/TestData.fixtures.js";
import { IHeadlineDataItem } from "../../../../interfaces/Headlines.js";
import { withIntl } from "@gooddata/sdk-ui";

describe("BaseHeadlineDataItem", () => {
    const renderBaseHeadlineDataItem = (props: IBaseHeadlineDataItemProps<IHeadlineDataItem>) => {
        const WrappedBaseHeadlineDataItem = withIntl(BaseHeadlineDataItem);
        return render(<WrappedBaseHeadlineDataItem {...props} />);
    };

    beforeEach(() => {
        mockUseBaseHeadline();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should render headline item link with underline style when is drillable", () => {
        const { container } = renderBaseHeadlineDataItem({
            dataItem: {
                ...TEST_DATA_ITEM,
                isDrillable: true,
            },
            evaluationType: EvaluationType.POSITIVE_VALUE,
        });

        expect(container.querySelector(HEADLINE_LINK_STYLE_UNDERLINE)).toBeInTheDocument();
    });

    it("Should not render headline item link with underline style when is drillable and disableDrillUnderline is true", () => {
        mockUseBaseHeadline({
            config: {
                disableDrillUnderline: true,
            },
        });
        const { container } = renderBaseHeadlineDataItem({
            dataItem: {
                ...TEST_DATA_ITEM,
                isDrillable: true,
            },
            evaluationType: EvaluationType.POSITIVE_VALUE,
        });

        expect(container.querySelector(HEADLINE_LINK_STYLE_UNDERLINE)).not.toBeInTheDocument();
    });

    describe("Should render value correctly", () => {
        it.each(TEST_RENDER_VALUE_SPECS)(
            "%s",
            (_condition: string, data: { value: string; format: string }, expected: string) => {
                const dataItem = {
                    ...TEST_DATA_ITEM,
                    value: data?.value,
                    format: data?.format,
                };
                renderBaseHeadlineDataItem({
                    dataItem,
                    evaluationType: EvaluationType.POSITIVE_VALUE,
                });

                expect(screen.getByText(expected)).toBeInTheDocument();
            },
        );

        it("Should have style applied on headline value when custom format is provided", () => {
            const dataItem = {
                ...TEST_DATA_ITEM,
                value: "1666.105",
                format: "[color=9c46b5][backgroundColor=d2ccde]$#,##0.00",
            };
            const { container } = renderBaseHeadlineDataItem({
                dataItem,
                evaluationType: EvaluationType.POSITIVE_VALUE,
            });

            const valueWrapper = container.querySelector(HEADLINE_VALUE_WRAPPER_SELECTOR);
            expect(screen.getByText("$1,666.11")).toBeInTheDocument();
            expect(valueWrapper).toHaveStyle("color: #9c46b5");
            expect(valueWrapper).toHaveStyle("background-color: #d2ccde");
        });
    });
});
