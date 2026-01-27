// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { BaseHeadline } from "../BaseHeadline.js";
import { CompareSection } from "../CompareSection.js";
import { PrimarySection } from "../PrimarySection.js";

vi.mock("../CompareSection.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        CompareSection: vi.fn((original as { CompareSection: () => void }).CompareSection),
    };
});

vi.mock("../PrimarySection.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        PrimarySection: vi.fn((original as { PrimarySection: () => void }).PrimarySection),
    };
});

describe("BaseHeadline", () => {
    const MockPrimarySection = vi.mocked(PrimarySection);
    const MockCompareSection = vi.mocked(CompareSection);

    const primaryItem = TEST_BASE_HEADLINE_ITEM;
    const secondaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        elementType: "secondaryValue" as const,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "secondary_local_identifier",
        },
    } as IBaseHeadlineItem<IHeadlineDataItem>;
    const tertiaryItem = {
        ...TEST_BASE_HEADLINE_ITEM,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "tertiary_local_identifier",
        },
    } as IBaseHeadlineItem<IHeadlineDataItem>;

    const renderBaseHeadline = (params: {
        primaryItem: IBaseHeadlineItem<IHeadlineDataItem>;
        secondaryItem?: IBaseHeadlineItem<IHeadlineDataItem>;
        tertiaryItem?: IBaseHeadlineItem<IHeadlineDataItem>;
        onAfterRender?: () => void;
    }) => {
        const props = {
            data: {
                primaryItem: params.primaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
                secondaryItem: params.secondaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
                tertiaryItem: params.tertiaryItem as IBaseHeadlineItem<BaseHeadlineItemAccepted>,
            },
            config: {},
            onDrill: vi.fn(),
            onAfterRender: params.onAfterRender || vi.fn(),
        };

        const WrappedBaseHeadline = withIntl(BaseHeadline);
        return render(<WrappedBaseHeadline {...props} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.clearAllMocks();
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
        renderBaseHeadline({ primaryItem });

        expect(MockPrimarySection).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem,
                isOnlyPrimaryItem: true,
            }),
            undefined,
        );
        expect(MockCompareSection).not.toHaveBeenCalled();
    });

    it("Should render both primary section and compare section correctly", () => {
        renderBaseHeadline({ primaryItem, secondaryItem, tertiaryItem });

        expect(MockPrimarySection).toHaveBeenCalledWith(
            expect.objectContaining({
                primaryItem,
                isOnlyPrimaryItem: false,
            }),
            undefined,
        );
        expect(MockCompareSection).toHaveBeenCalledWith(
            expect.objectContaining({
                secondaryItem,
                tertiaryItem,
            }),
            undefined,
        );
    });
});
