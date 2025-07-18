// (C) 2023-2025 GoodData Corporation
import { RefObject } from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { mockUseBaseHeadline } from "./BaseHeadlineMock.js";
import CompareSectionItem from "../CompareSectionItem.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";

describe("CompareSectionItem", () => {
    const renderCompareSectionItem = (props?: {
        dataItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
        titleRef?: RefObject<HTMLDivElement>;
    }) => {
        return render(<CompareSectionItem {...props} />);
    };

    beforeEach(() => {
        mockUseBaseHeadline();
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it("Should render base headline data item from provided baseHeadlineDataItemComponent property", () => {
        const MockBaseHeadlineItemComponent = vi.fn();
        const titleRef = vi.fn();
        const dataItem: IBaseHeadlineItem<BaseHeadlineItemAccepted> = {
            ...TEST_BASE_HEADLINE_ITEM,
            baseHeadlineDataItemComponent: MockBaseHeadlineItemComponent,
        };

        renderCompareSectionItem({ ...({ dataItem, titleRef } as any) });
        expect(MockBaseHeadlineItemComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: dataItem.data,
                elementType: dataItem.elementType,
                titleRef,
            }),
            expect.anything(),
        );
    });
});
