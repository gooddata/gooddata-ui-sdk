// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../tests/TestData.test.helpers.js";

import { createBaseHeadlineTestContext } from "./BaseHeadline.test.helpers.js";
import { PrimarySectionCompactContent } from "./PrimarySectionCompactContent.js";

const HEADLINE_PRIMARY_ITEM_SELECTOR = ".s-headline-primary-item";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("PrimarySectionCompactContent", () => {
    /**
     * The data item component is injected through the primary item, so that the rendered content can be
     * verified without mocking the PrimarySectionContent module.
     */
    const MockPrimaryItemContent = vi.fn().mockReturnValue(null);

    const primaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        baseHeadlineDataItemComponent: MockPrimaryItemContent,
    } as unknown as IBaseHeadlineItem;

    const renderPrimarySectionCompactContent = () => {
        const props = {
            primaryItem,
            isOnlyPrimaryItem: false,
        };

        return render(<PrimarySectionCompactContent {...props} />, { wrapper });
    };

    beforeEach(() => {
        MockPrimaryItemContent.mockClear();
    });

    it("Should render primary section content with correctly properties", () => {
        setBaseHeadline({ clientHeight: 100 });
        const { container } = renderPrimarySectionCompactContent();

        expect(container.querySelector(HEADLINE_PRIMARY_ITEM_SELECTOR)).toBeInTheDocument();
        expect(MockPrimaryItemContent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
            }),
            undefined,
        );
    });

    it("Should not be call primary section content in cases client height is 0", () => {
        setBaseHeadline({ clientHeight: 0 });
        renderPrimarySectionCompactContent();

        expect(MockPrimaryItemContent).not.toHaveBeenCalled();
    });
});
