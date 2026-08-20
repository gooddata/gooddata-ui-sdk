// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { PrimarySection } from "../PrimarySection.js";

import { createBaseHeadlineTestContext } from "./BaseHeadline.test.helpers.js";

const HEADLINE_PRIMARY_ITEM_SELECTOR = ".s-headline-primary-item";

const { setBaseHeadline, wrapper } = createBaseHeadlineTestContext();

describe("PrimarySection", () => {
    /**
     * The data item component is injected through the primary item, so that the rendered content can be
     * verified without mocking the primary section content modules.
     */
    const MockPrimaryItemContent = vi.fn().mockReturnValue(null);

    const primaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        baseHeadlineDataItemComponent: MockPrimaryItemContent,
    } as unknown as IBaseHeadlineItem;

    const renderPrimarySection = () => {
        const props = {
            primaryItem,
            isOnlyPrimaryItem: false,
        };
        return render(<PrimarySection {...props} />, { wrapper });
    };

    beforeEach(() => {
        MockPrimaryItemContent.mockClear();
    });

    it("Should render primary compact content while enable compact size", () => {
        setBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 100,
        });

        const { container } = renderPrimarySection();

        // the compact content sizes the primary item according to the client height
        const primaryItemElement = container.querySelector(HEADLINE_PRIMARY_ITEM_SELECTOR);
        expect(primaryItemElement).toBeInTheDocument();
        expect(primaryItemElement!.getAttribute("style")).toContain("line-height");
        expect(MockPrimaryItemContent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
            }),
            undefined,
        );
    });

    it("Should not render any primary content while enable compact size and client height is 0", () => {
        setBaseHeadline({
            config: {
                enableCompactSize: true,
            },
            clientHeight: 0,
        });

        const { container } = renderPrimarySection();

        expect(container.querySelector(HEADLINE_PRIMARY_ITEM_SELECTOR)).toBeNull();
        expect(MockPrimaryItemContent).not.toHaveBeenCalled();
    });

    it("Should render primary content while do not enable compact size", () => {
        setBaseHeadline({
            config: {
                enableCompactSize: false,
            },
            clientHeight: 100,
        });

        const { container } = renderPrimarySection();

        // the plain content does not apply any custom sizing on the primary item
        const primaryItemElement = container.querySelector(HEADLINE_PRIMARY_ITEM_SELECTOR);
        expect(primaryItemElement).toBeInTheDocument();
        expect(primaryItemElement!.getAttribute("style") ?? "").not.toContain("line-height");
        expect(MockPrimaryItemContent).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
            }),
            undefined,
        );
    });
});
