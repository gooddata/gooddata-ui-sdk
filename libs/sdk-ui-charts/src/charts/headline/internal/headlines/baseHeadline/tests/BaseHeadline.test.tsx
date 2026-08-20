// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { BaseHeadline, type IHeadlineProps } from "../BaseHeadline.js";

const PRIMARY_SECTION_SELECTOR = ".s-primary-section";
const PRIMARY_ITEM_SELECTOR = ".s-headline-primary-item";
const COMPARE_ITEM_SELECTOR = ".s-headline-compare-item";

describe("BaseHeadline", () => {
    /**
     * The data item components are injected through the headline items, so that the rendered sections can be
     * verified without mocking the section modules.
     */
    const MockPrimaryItem = vi.fn().mockReturnValue(null);
    const MockSecondaryItem = vi.fn().mockReturnValue(null);
    const MockTertiaryItem = vi.fn().mockReturnValue(null);

    const primaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        baseHeadlineDataItemComponent: MockPrimaryItem,
    } as unknown as IBaseHeadlineItem;
    const secondaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        elementType: "secondaryValue",
        baseHeadlineDataItemComponent: MockSecondaryItem,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "secondary_local_identifier",
        },
    } as unknown as IBaseHeadlineItem;
    const tertiaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        baseHeadlineDataItemComponent: MockTertiaryItem,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "tertiary_local_identifier",
        },
    } as unknown as IBaseHeadlineItem;

    const renderBaseHeadline = (params: {
        primaryItem: IBaseHeadlineItem;
        secondaryItem?: IBaseHeadlineItem;
        tertiaryItem?: IBaseHeadlineItem;
        onAfterRender?: () => void;
    }) => {
        const props = {
            data: {
                primaryItem: params.primaryItem,
                secondaryItem: params.secondaryItem,
                tertiaryItem: params.tertiaryItem,
            },
            config: {},
            onDrill: vi.fn(),
            onAfterRender: params.onAfterRender || vi.fn(),
        } satisfies IHeadlineProps;

        const WrappedBaseHeadline = withIntlForTest(BaseHeadline);
        return render(<WrappedBaseHeadline {...props} />);
    };

    beforeEach(() => {
        MockPrimaryItem.mockClear();
        MockSecondaryItem.mockClear();
        MockTertiaryItem.mockClear();
    });

    it("should call after render callback on when component rendered", () => {
        const onAfterRender = vi.fn();
        vi.useFakeTimers();
        renderBaseHeadline({ primaryItem, onAfterRender });

        vi.runAllTimers();
        vi.useRealTimers();
        expect(onAfterRender).toHaveBeenCalledTimes(1);
    });

    it("Should render only primary section when secondary item is empty", () => {
        const { container } = renderBaseHeadline({ primaryItem });

        expect(container.querySelector(PRIMARY_SECTION_SELECTOR)).toBeInTheDocument();
        expect(container.querySelector(PRIMARY_ITEM_SELECTOR)).toBeInTheDocument();
        expect(MockPrimaryItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
            }),
            undefined,
        );
        expect(container.querySelectorAll(COMPARE_ITEM_SELECTOR)).toHaveLength(0);
        expect(MockSecondaryItem).not.toHaveBeenCalled();
        expect(MockTertiaryItem).not.toHaveBeenCalled();
    });

    it("Should render both primary section and compare section correctly", () => {
        const { container } = renderBaseHeadline({ primaryItem, secondaryItem, tertiaryItem });

        expect(container.querySelector(PRIMARY_SECTION_SELECTOR)).toBeInTheDocument();
        expect(MockPrimaryItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: primaryItem.data,
            }),
            undefined,
        );

        expect(container.querySelectorAll(COMPARE_ITEM_SELECTOR)).toHaveLength(2);
        expect(MockSecondaryItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: secondaryItem.data,
            }),
            undefined,
        );
        expect(MockTertiaryItem).toHaveBeenCalledWith(
            expect.objectContaining({
                dataItem: tertiaryItem.data,
            }),
            undefined,
        );
    });
});
