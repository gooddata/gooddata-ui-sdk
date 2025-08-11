// (C) 2023-2025 GoodData Corporation
import React from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PrimarySectionContent } from "../PrimarySectionContent.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { mockUseBaseHeadline } from "./BaseHeadlineMock.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";

describe("PrimarySectionContent", () => {
    const renderPrimarySectionContent = (props?: {
        primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    }) => {
        return render(<PrimarySectionContent {...props} />);
    };

    beforeEach(() => {
        mockUseBaseHeadline();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should render base headline data item from provided baseHeadlineDataItemComponent property", () => {
        const MockBaseHeadlineItemComponent = vi.fn();
        const primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted> = {
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
            expect.anything(),
        );
    });
});
