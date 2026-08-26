// (C) 2023-2026 GoodData Corporation

import { type RefObject } from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../tests/TestData.test.helpers.js";

import { createBaseHeadlineTestContext } from "./BaseHeadline.test.helpers.js";
import { CompareSectionItem } from "./CompareSectionItem.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("CompareSectionItem", () => {
    const renderCompareSectionItem = (props: {
        dataItem: IBaseHeadlineItem;
        titleRef?: RefObject<HTMLDivElement>;
    }) => {
        return render(<CompareSectionItem {...props} />, { wrapper });
    };

    beforeEach(() => {
        setBaseHeadline();
    });

    it("Should render base headline data item from provided baseHeadlineDataItemComponent property", () => {
        const MockBaseHeadlineItemComponent = vi.fn();
        const titleRef = vi.fn();
        const dataItem: IBaseHeadlineItem = {
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
            undefined,
        );
    });
});
