// (C) 2023-2025 GoodData Corporation

import React from "react";

import { render } from "@testing-library/react";
import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../../interfaces/BaseHeadlines.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { TEST_BASE_HEADLINE_ITEM } from "../../../tests/TestData.fixtures.js";
import { BaseHeadline } from "../BaseHeadline.js";
import * as CompareSection from "../CompareSection.js";
import * as PrimarySection from "../PrimarySection.js";

describe("BaseHeadline", () => {
    let MockPrimarySection: MockInstance;
    let MockCompareSection: MockInstance;

    const primaryItem = TEST_BASE_HEADLINE_ITEM as IBaseHeadlineItem<IHeadlineDataItem>;
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
        MockPrimarySection = vi.spyOn(PrimarySection, "PrimarySection");
        MockCompareSection = vi.spyOn(CompareSection, "CompareSection");
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
