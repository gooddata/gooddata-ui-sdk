// (C) 2023 GoodData Corporation
import React, { CSSProperties } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import ComparisonValue from "../ComparisonValue.js";
import { IBaseHeadlineValueItem } from "../../../../../interfaces/BaseHeadlines.js";
import { mockUseBaseHeadline } from "../../../tests/BaseHeadlineMock.js";
import { TEST_DATA_ITEM, TEST_RENDER_VALUE_SPECS } from "../../../../../tests/TestData.fixtures.js";

describe("ComparisonDataItem", () => {
    const renderComparisonDataItem = (props: {
        dataItem: IBaseHeadlineValueItem;
        comparisonStyle: CSSProperties;
        isSubItem?: boolean;
    }) => {
        return render(<ComparisonValue {...props} />);
    };

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
                comparisonStyle: { color: "red" },
            });

            expect(screen.getByText(expected)).toBeInTheDocument();
        },
    );
});
