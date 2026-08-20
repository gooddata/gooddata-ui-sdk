// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySectionContent } from "../PrimarySectionContent.js";

import { createBaseHeadlineTestContext } from "./BaseHeadline.test.helpers.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("PrimarySectionContent", () => {
    const renderPrimarySectionContent = (props: { primaryItem: IBaseHeadlineItem }) => {
        return render(<PrimarySectionContent {...props} />, { wrapper });
    };

    beforeEach(() => {
        setBaseHeadline();
    });

    it("Should render base headline data item from provided baseHeadlineDataItemComponent property", () => {
        const MockBaseHeadlineItemComponent = vi.fn();
        const primaryItem: IBaseHeadlineItem = {
            ...TEST_BASE_HEADLINE_ITEM,
            baseHeadlineDataItemComponent: MockBaseHeadlineItemComponent,
        };

        renderPrimarySectionContent({ primaryItem });
        expect(MockBaseHeadlineItemComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
                elementType: primaryItem.elementType,
                shouldHideTitle: true,
            }),
            undefined,
        );
    });
});
