// (C) 2023-2025 GoodData Corporation
import { afterAll, beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { render } from "@testing-library/react";
import BaseHeadline from "../BaseHeadline.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import * as PrimarySection from "../PrimarySection.js";
import * as CompareSection from "../CompareSection.js";
import { Intl } from "@gooddata/sdk-ui";

describe("BaseHeadline", () => {
    let MockPrimarySection: MockInstance;
    let MockCompareSection: MockInstance;

    const primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted> = TEST_BASE_HEADLINE_ITEM;
    const secondaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted> = {
        ...TEST_BASE_HEADLINE_ITEM,
        elementType: "secondaryValue",
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "secondary_local_identifier",
        },
    };
    const tertiaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted> = {
        ...TEST_BASE_HEADLINE_ITEM,
        data: {
            ...TEST_BASE_HEADLINE_ITEM.data,
            localIdentifier: "tertiary_local_identifier",
        },
    };

    const renderBaseHeadline = (params: {
        primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
        secondaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
        tertiaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
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
        };

        return render(
            <Intl>
                <BaseHeadline {...props} />
            </Intl>,
        );
    };

    beforeEach(() => {
        MockPrimarySection = vi.spyOn(PrimarySection, "default");
        MockCompareSection = vi.spyOn(CompareSection, "default");
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
            expect.anything(),
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
            expect.anything(),
        );
        expect(MockCompareSection).toHaveBeenCalledWith(
            expect.objectContaining({
                secondaryItem,
                tertiaryItem,
            }),
            expect.anything(),
        );
    });
});
