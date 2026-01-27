// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { createMockUseBaseHeadline } from "./BaseHeadline.test.helpers.js";
import { type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import {
    HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR,
    TEST_BASE_HEADLINE_ITEM,
} from "../../../tests/TestData.fixtures.js";
import { CompareSection } from "../CompareSection.js";
import { CompareSectionItem } from "../CompareSectionItem.js";

const useBaseHeadlineMock = vi.hoisted(() => vi.fn());

vi.mock("../BaseHeadlineContext.js", () => ({
    useBaseHeadline: useBaseHeadlineMock,
}));

vi.mock("../CompareSectionItem.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        CompareSectionItem: vi.fn((original as { CompareSectionItem: () => void }).CompareSectionItem),
    };
});

const mockUseBaseHeadline = createMockUseBaseHeadline(useBaseHeadlineMock);

describe("CompareSection", () => {
    const MockCompareItem = vi.mocked(CompareSectionItem);
    const secondaryItem: IBaseHeadlineItem<IHeadlineDataItem> = TEST_BASE_HEADLINE_ITEM;
    const tertiaryItem: IBaseHeadlineItem<IHeadlineDataItem> = {
        ...TEST_BASE_HEADLINE_ITEM,
        elementType: null as any,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "tertiary_local_identifier",
        },
    };

    const renderCompareSection = (props?: {
        secondaryItem: IBaseHeadlineItem<IHeadlineDataItem>;
        tertiaryItem?: IBaseHeadlineItem<IHeadlineDataItem>;
    }) => {
        const WrappedHeadlineCompareSection = withIntl(CompareSection);
        return render(<WrappedHeadlineCompareSection {...(props as any)} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseBaseHeadline();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Should render only one compare item when tertiary item is empty", () => {
        const { container } = renderCompareSection({ secondaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: secondaryItem,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });

    it("Should render two compare items when tertiary item is not empty", () => {
        const { container } = renderCompareSection({ secondaryItem, tertiaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItem).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                dataItem: tertiaryItem,
            }),
            undefined,
        );
        expect(MockCompareItem).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                dataItem: secondaryItem,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });

    it("Should render paginated component for small screen and compact size is enable", () => {
        mockUseBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 60,
            clientWidth: 60,
        });

        const secondaryItem: IBaseHeadlineItem<IHeadlineDataItem> = TEST_BASE_HEADLINE_ITEM;
        const { container } = renderCompareSection({ secondaryItem, tertiaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeInTheDocument();
        expect(MockCompareItem).toHaveBeenCalled();
    });

    it("Should render only one compare item when tertiary item is empty and pagination is match", () => {
        mockUseBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 60,
            clientWidth: 60,
        });

        const secondaryItem: IBaseHeadlineItem<IHeadlineDataItem> = TEST_BASE_HEADLINE_ITEM;
        const { container } = renderCompareSection({ secondaryItem });

        expect(container.querySelector(HEADLINE_PAGINATED_COMPARE_SECTION_SELECTOR)).toBeNull();
        expect(MockCompareItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: secondaryItem,
                titleRef: expect.anything(),
            }),
            undefined,
        );
    });
});
