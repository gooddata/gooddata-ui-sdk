// (C) 2023-2026 GoodData Corporation

import { type CSSProperties } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IBaseHeadlineValueItem } from "../../../../../interfaces/BaseHeadlines.js";
import { TEST_DATA_ITEM, TEST_RENDER_VALUE_SPECS } from "../../../../../tests/TestData.fixtures.js";
import { createBaseHeadlineTestContext } from "../../../tests/BaseHeadline.test.helpers.js";
import { ComparisonValue } from "../ComparisonValue.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("ComparisonValue", () => {
    const renderComparisonDataItem = (props: {
        dataItem: IBaseHeadlineValueItem;
        comparisonStyle: CSSProperties;
        isSubItem?: boolean;
    }) => {
        const Component = withIntlForTest(ComparisonValue);
        return render(<Component {...props} />, { wrapper });
    };

    beforeEach(() => {
        setBaseHeadline({
            config: {
                comparison: {
                    enabled: true,
                    colorConfig: {},
                },
            },
        });
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
