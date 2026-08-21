// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import {
    HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR,
    TEST_BASE_HEADLINE_ITEM,
} from "../../../tests/TestData.fixtures.js";
import { CompareSection } from "../CompareSection.js";

import { createBaseHeadlineTestContext } from "./BaseHeadline.test.helpers.js";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("CompareSection", () => {
    /**
     * The data item component is injected through the compared items, so that the rendering of the
     * individual compare items can be verified without mocking the CompareSectionItem module.
     */
    const MockCompareItemContent = vi.fn().mockReturnValue(null);

    const secondaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        baseHeadlineDataItemComponent: MockCompareItemContent,
    } as unknown as IBaseHeadlineItem;
    const tertiaryItem = {
        ...secondaryItem,
        elementType: "secondaryValue",
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "tertiary_local_identifier",
        },
    } as unknown as IBaseHeadlineItem;

    const renderCompareSection = (props: {
        secondaryItem: IBaseHeadlineItem;
        tertiaryItem?: IBaseHeadlineItem;
    }) => {
        const WrappedHeadlineCompareSection = withIntlForTest(CompareSection);
        return render(<WrappedHeadlineCompareSection {...props} />, { wrapper });
    };

    beforeEach(() => {
        MockCompareItemContent.mockClear();
        setBaseHeadline();
    });

    it("Should render only one compare item when tertiary item is empty", () => {
        const { container } = renderCompareSection({ secondaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItemContent).toHaveBeenCalledTimes(1);
        expect(MockCompareItemContent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: secondaryItem.data,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });

    it("Should render two compare items when tertiary item is not empty", () => {
        const { container } = renderCompareSection({ secondaryItem, tertiaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItemContent).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                dataItem: tertiaryItem.data,
            }),
            undefined,
        );
        expect(MockCompareItemContent).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                dataItem: secondaryItem.data,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });

    it("Should render paginated component for small screen and compact size is enable", () => {
        setBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 60,
            clientWidth: 60,
        });

        const { container } = renderCompareSection({ secondaryItem, tertiaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeInTheDocument();
        expect(MockCompareItemContent).toHaveBeenCalled();
    });

    it("Should render only one compare item when tertiary item is empty and pagination is match", () => {
        setBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 60,
            clientWidth: 60,
        });

        const { container } = renderCompareSection({ secondaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItemContent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: secondaryItem.data,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });
});
