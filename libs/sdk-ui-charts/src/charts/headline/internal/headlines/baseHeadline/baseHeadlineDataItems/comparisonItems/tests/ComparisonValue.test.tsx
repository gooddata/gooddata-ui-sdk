// (C) 2023-2026 GoodData Corporation

import { type CSSProperties } from "react";

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { type IBaseHeadlineValueItem } from "../../../../../interfaces/BaseHeadlines.js";
import { TEST_DATA_ITEM, TEST_RENDER_VALUE_SPECS } from "../../../../../tests/TestData.fixtures.js";
import { createMockUseBaseHeadline } from "../../../tests/BaseHeadline.test.helpers.js";
import { ComparisonValue } from "../ComparisonValue.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../../../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

const mockUseBaseHeadline = createMockUseBaseHeadline(useBaseHeadlineMock);

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

    it.each<[string, { value: string; format: string }, string]>(TEST_RENDER_VALUE_SPECS)(
        "%s",
        (_condition, data, expected) => {
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
