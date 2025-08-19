// (C) 2023-2025 GoodData Corporation
import React, { CSSProperties } from "react";

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { IBaseHeadlineValueItem } from "../../../../../interfaces/BaseHeadlines.js";
import { TEST_DATA_ITEM, TEST_RENDER_VALUE_SPECS } from "../../../../../tests/TestData.fixtures.js";
import { mockUseBaseHeadline } from "../../../tests/BaseHeadlineMock.js";
import { ComparisonValue } from "../ComparisonValue.js";

describe("ComparisonValue", () => {
    const renderComparisonDataItem = (props: {
        dataItem: IBaseHeadlineValueItem;
        comparisonStyle: CSSProperties;
        isSubItem?: boolean;
    }) => {
        const Component = withIntl(ComparisonValue);
        return render(<Component {...props} />);
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
